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
API_URL = os.getenv("BO2_API_URL", "http://localhost:3000/api/update_stats")
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
    "start_time": None
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
def parse_kill_line(linha: str):
    """
    Parse de linhas de kill
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

def parse_match_start(linha: str):
    """Parse de início de partida"""
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
    """Parse de fim de partida"""
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
    
    ultima_posicao = 0
    log_info("Monitoring started. Waiting for log entries...")
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
                    
                    # KILL events
                    if "KILL:" in linha:
                        dados = parse_kill_line(linha)
                        if dados:
                            session_stats["kills"] += 1
                            enviar_dados("kill", dados)
                    
                    # MATCH START events
                    elif "MATCH_START:" in linha:
                        dados = parse_match_start(linha)
                        if dados:
                            session_stats["match_active"] = True
                            session_stats["start_time"] = datetime.now()
                            enviar_dados("match_start", dados)
                    
                    # MATCH END events
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
