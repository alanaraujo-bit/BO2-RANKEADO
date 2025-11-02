#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BO2 RANKED - LOG MONITOR & UPLOADER
====================================
Monitora o arquivo de log do BO2 e envia estatísticas para o servidor.

Formatos de log aceitos:
- KILL: PlayerA -> PlayerB [arma] (headshot)
- MATCH_START: Mapa, Modo, Jogadores
- MATCH_END: Vencedor, Placar, Tempo
- PLAYER_JOIN: PlayerName
- PLAYER_LEAVE: PlayerName
"""

import requests
import time
import os
import sys
import json
from datetime import datetime
from pathlib import Path

# ===============================
# CONFIGURAÇÕES
# ===============================
API_URL = os.getenv("BO2_API_URL", "https://rankops.vercel.app/api/update_stats")
SECRET_KEY = os.getenv("BO2_SECRET", "")
DEFAULT_LOG = r"C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops II\player_stats.txt"
LOG_FILE = os.getenv("BO2_LOG_FILE", DEFAULT_LOG)
CHECK_INTERVAL = 2  # segundos entre verificações
MAX_RETRIES = 3
RETRY_DELAY = 5

# Estado da sessão
session_stats = {
    "kills": 0,
    "deaths": 0,
    "match_active": False,
    "start_time": None,
    "last_init_game": None  # Guarda último InitGame para evitar duplicatas
}

# ===============================
# FUNÇÕES DE LOG
# ===============================
def log_info(msg):
    """Loga mensagem informativa com timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] INFO: {msg}")

def log_error(msg):
    """Loga mensagem de erro com timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] ERROR: {msg}", file=sys.stderr)

def log_success(msg):
    """Loga mensagem de sucesso com timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] ✓ {msg}")

# ===============================
# ENVIO DE DADOS
# ===============================
def enviar_dados(evento_tipo: str, dados: dict, retry=0) -> bool:
    """
    Envia dados para o servidor com retry automático
    
    Args:
        evento_tipo: Tipo do evento (kill, match_end, etc)
        dados: Dados do evento
        retry: Tentativa atual (para recursão)
    
    Returns:
        bool: True se enviado com sucesso
    """
    payload = {
        "type": evento_tipo,
        "timestamp": datetime.now().isoformat(),
        "data": dados
    }
    
    headers = {
        "Authorization": f"Bearer {SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=10)
        
        if response.status_code == 200:
            log_success(f"{evento_tipo.upper()}: {json.dumps(dados, ensure_ascii=False)}")
            return True
        else:
            log_error(f"Server returned {response.status_code}: {response.text[:100]}")
            
            if retry < MAX_RETRIES:
                log_info(f"Retrying in {RETRY_DELAY}s... (attempt {retry + 1}/{MAX_RETRIES})")
                time.sleep(RETRY_DELAY)
                return enviar_dados(evento_tipo, dados, retry + 1)
            return False
            
    except requests.exceptions.ConnectionError:
        log_error(f"Connection failed to {API_URL}")
        if retry < MAX_RETRIES:
            log_info(f"Retrying in {RETRY_DELAY}s... (attempt {retry + 1}/{MAX_RETRIES})")
            time.sleep(RETRY_DELAY)
            return enviar_dados(evento_tipo, dados, retry + 1)
        return False
        
    except Exception as e:
        log_error(f"Exception sending data: {repr(e)}")
        return False

# ===============================
# PARSERS DE LINHAS
# ===============================
def parse_plutonium_kill(linha: str):
    """
    Parse de kills do Plutonium
    Formato: timestamp K;attacker_guid;attacker_num;attacker_team;attacker_name;victim_guid;victim_num;victim_team;victim_name;weapon;damage;means_of_death;hitloc
    Exemplo: 111:21 K;5962719;0;axis;alanzeira_AP;5962719;-1;axis;alanzeira_AP;destructible_car_mp;176;MOD_EXPLOSIVE;none
    """
    s = linha.strip()
    if " K;" not in s:
        return None
    
    try:
        # Split timestamp e dados
        parts = s.split(" ", 1)
        if len(parts) < 2:
            return None
        
        data = parts[1].split(";")
        if len(data) < 13:
            return None
        
        killer_name = data[4]
        victim_name = data[8]
        weapon = data[9]
        hitloc = data[12] if len(data) > 12 else "none"
        
        # Se killer e victim são iguais, é suicídio
        if killer_name == victim_name:
            return None
        
        return {
            "killer": killer_name,
            "victim": victim_name,
            "weapon": weapon,
            "headshot": hitloc.lower() == "head"
        }
    except Exception:
        return None

def parse_kill_line(linha: str):
    """
    Parse de linhas de kill (formato customizado para testes)
    Formatos aceitos:
    - KILL: PlayerA -> PlayerB
    - KILL: PlayerA -> PlayerB [M4A1]
    - KILL: PlayerA -> PlayerB [M4A1] (headshot)
    """
    s = linha.strip()
    if not s.startswith("KILL:"):
        return None
    
    content = s[len("KILL:"):].strip()
    
    # Parse weapon and headshot
    weapon = "unknown"
    headshot = False
    
    if "(headshot)" in content.lower():
        headshot = True
        content = content.replace("(headshot)", "").replace("(Headshot)", "").strip()
    
    if "[" in content and "]" in content:
        weapon_start = content.index("[")
        weapon_end = content.index("]")
        weapon = content[weapon_start+1:weapon_end].strip()
        content = content[:weapon_start].strip()
    
    # Parse killer -> victim
    if "->" not in content:
        return None
    
    parts = [p.strip() for p in content.split("->", 1)]
    if len(parts) != 2:
        return None
    
    killer, victim = parts[0], parts[1]
    
    if not killer or not victim:
        return None
    
    return {
        "killer": killer,
        "victim": victim,
        "weapon": weapon,
        "headshot": headshot
    }

def parse_plutonium_join(linha: str):
    """
    Parse de player join do Plutonium
    Formato: timestamp J;guid;num;name
    Exemplo: 111:00 J;5962719;0;alanzeira_AP
    """
    s = linha.strip()
    if " J;" not in s:
        return None
    
    try:
        parts = s.split(" ", 1)
        if len(parts) < 2:
            return None
        
        data = parts[1].split(";")
        if len(data) < 4:
            return None
        
        return {
            "player": data[3],
            "guid": data[1]
        }
    except Exception:
        return None

def parse_plutonium_quit(linha: str):
    """
    Parse de player quit do Plutonium
    Formato: timestamp Q;guid;num;name
    Exemplo: 122:51 Q;6120270;1;samuwuu
    """
    s = linha.strip()
    if " Q;" not in s:
        return None
    
    try:
        parts = s.split(" ", 1)
        if len(parts) < 2:
            return None
        
        data = parts[1].split(";")
        if len(data) < 4:
            return None
        
        return {
            "player": data[3],
            "guid": data[1]
        }
    except Exception:
        return None

def parse_plutonium_init_game(linha: str):
    r"""
    Parse de InitGame do Plutonium para detectar início de partida
    Formato: timestamp InitGame: \key\value\key\value...
    """
    s = linha.strip()
    if "InitGame:" not in s:
        return None
    
    try:
        # Extrair valores importantes
        mapname = "Unknown"
        gametype = "Unknown"
        maxclients = "Unknown"
        
        if "\\mapname\\" in s:
            idx = s.index("\\mapname\\") + 9
            end = s.find("\\", idx)
            mapname = s[idx:end] if end > idx else s[idx:]
        
        if "\\g_gametype\\" in s:
            idx = s.index("\\g_gametype\\") + 12
            end = s.find("\\", idx)
            gametype = s[idx:end] if end > idx else s[idx:]
        
        if "\\com_maxclients\\" in s:
            idx = s.index("\\com_maxclients\\") + 16
            end = s.find("\\", idx)
            maxclients = s[idx:end] if end > idx else s[idx:]
        
        return {
            "map": mapname,
            "mode": gametype,
            "players": f"{maxclients} players"
        }
    except Exception:
        return None

def parse_match_start(linha: str):
    """Parse de início de partida (formato customizado)"""
    # MATCH_START: Nuketown, TDM, 8 players
    if not linha.strip().startswith("MATCH_START:"):
        return None
    
    content = linha.split(":", 1)[1].strip()
    parts = [p.strip() for p in content.split(",")]
    
    return {
        "map": parts[0] if len(parts) > 0 else "Unknown",
        "mode": parts[1] if len(parts) > 1 else "Unknown",
        "players": parts[2] if len(parts) > 2 else "Unknown"
    }

def parse_match_end(linha: str):
    """Parse de fim de partida (formato customizado)"""
    # MATCH_END: Blue Team, 75-50, 10:30
    if not linha.strip().startswith("MATCH_END:"):
        return None
    
    content = linha.split(":", 1)[1].strip()
    parts = [p.strip() for p in content.split(",")]
    
    return {
        "winner": parts[0] if len(parts) > 0 else "Unknown",
        "score": parts[1] if len(parts) > 1 else "0-0",
        "duration": parts[2] if len(parts) > 2 else "00:00"
    }

# ===============================
# MONITOR PRINCIPAL
# ===============================
def monitorar_log():
    """Loop principal de monitoramento do log"""
    
    log_info("=" * 60)
    log_info("BO2 RANKED - LOG MONITOR STARTED")
    log_info("=" * 60)
    log_info(f"API URL: {API_URL}")
    log_info(f"Log File: {LOG_FILE}")
    log_info(f"Check Interval: {CHECK_INTERVAL}s")
    
    if not SECRET_KEY:
        log_error("BO2_SECRET not set! Define with: setx BO2_SECRET \"your_secret\" /M")
        return
    else:
        log_info(f"Secret Key: {'*' * len(SECRET_KEY)} (length: {len(SECRET_KEY)})")
    
    # Verifica se o arquivo de log existe
    log_path = Path(LOG_FILE)
    if not log_path.exists():
        log_info(f"Creating log file: {LOG_FILE}")
        log_path.parent.mkdir(parents=True, exist_ok=True)
        log_path.touch()
    
    # IMPORTANTE: Começa do FINAL do arquivo (ignora histórico)
    ultima_posicao = 0
    try:
        with open(LOG_FILE, "r", encoding="utf-8", errors="ignore") as file:
            file.seek(0, 2)  # Vai para o final do arquivo
            ultima_posicao = file.tell()
            log_info(f"Starting from end of file (position: {ultima_posicao})")
    except Exception:
        pass
    
    log_info("Monitoring started. Waiting for NEW log entries...")
    log_info("-" * 60)
    
    while True:
        try:
            with open(LOG_FILE, "r", encoding="utf-8", errors="ignore") as file:
                file.seek(ultima_posicao)
                linhas = file.readlines()
                ultima_posicao = file.tell()
                
                for linha in linhas:
                    linha = linha.strip()
                    if not linha:
                        continue
                    
                    # PLUTONIUM KILL events (formato real do jogo)
                    if " K;" in linha:
                        dados = parse_plutonium_kill(linha)
                        if dados:
                            session_stats["kills"] += 1
                            enviar_dados("kill", dados)
                    
                    # PLUTONIUM PLAYER JOIN
                    elif " J;" in linha:
                        dados = parse_plutonium_join(linha)
                        if dados:
                            log_info(f"Player joined: {dados['player']}")
                            enviar_dados("player_join", dados)
                    
                    # PLUTONIUM PLAYER QUIT
                    elif " Q;" in linha:
                        dados = parse_plutonium_quit(linha)
                        if dados:
                            log_info(f"Player left: {dados['player']}")
                            enviar_dados("player_quit", dados)
                    
                    # PLUTONIUM INIT GAME (início de partida)
                    elif "InitGame:" in linha:
                        dados = parse_plutonium_init_game(linha)
                        if dados:
                            # Evita enviar duplicatas (Plutonium grava InitGame 2x)
                            dados_str = json.dumps(dados, sort_keys=True)
                            if session_stats["last_init_game"] != dados_str:
                                session_stats["last_init_game"] = dados_str
                                session_stats["match_active"] = True
                                session_stats["start_time"] = datetime.now()
                                session_stats["kills"] = 0
                                session_stats["deaths"] = 0
                                enviar_dados("match_start", dados)
                    
                    # PLUTONIUM SHUTDOWN GAME (fim de partida)
                    elif "ShutdownGame:" in linha:
                        if session_stats["match_active"]:
                            session_stats["match_active"] = False
                            dados = {
                                "kills": session_stats["kills"],
                                "deaths": session_stats["deaths"]
                            }
                            enviar_dados("match_end", dados)
                            
                            # Log session summary
                            log_info("-" * 60)
                            log_info(f"Session Summary - Kills: {session_stats['kills']}, Deaths: {session_stats['deaths']}")
                            log_info("-" * 60)
                    
                    # CUSTOM TEST FORMAT - KILL events
                    elif "KILL:" in linha:
                        dados = parse_kill_line(linha)
                        if dados:
                            session_stats["kills"] += 1
                            enviar_dados("kill", dados)
                    
                    # CUSTOM TEST FORMAT - MATCH START events
                    elif "MATCH_START:" in linha:
                        dados = parse_match_start(linha)
                        if dados:
                            session_stats["match_active"] = True
                            session_stats["start_time"] = datetime.now()
                            enviar_dados("match_start", dados)
                    
                    # CUSTOM TEST FORMAT - MATCH END events
                    elif "MATCH_END:" in linha:
                        dados = parse_match_end(linha)
                        if dados:
                            session_stats["match_active"] = False
                            enviar_dados("match_end", dados)
                            
                            # Log session summary
                            log_info("-" * 60)
                            log_info(f"Session Summary - Kills: {session_stats['kills']}, Deaths: {session_stats['deaths']}")
                            log_info("-" * 60)
        
        except FileNotFoundError:
            log_error(f"Log file not found: {LOG_FILE}")
            time.sleep(CHECK_INTERVAL * 2)
        
        except KeyboardInterrupt:
            log_info("\nShutdown requested by user")
            log_info("=" * 60)
            log_info("BO2 RANKED - LOG MONITOR STOPPED")
            log_info("=" * 60)
            sys.exit(0)
        
        except Exception as e:
            log_error(f"Unexpected error: {repr(e)}")
        
        time.sleep(CHECK_INTERVAL)

# ===============================
# ENTRY POINT
# ===============================
if __name__ == "__main__":
    try:
        monitorar_log()
    except KeyboardInterrupt:
        log_info("\nShutdown complete")
        sys.exit(0)
