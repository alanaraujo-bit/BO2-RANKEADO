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
API_URL = os.getenv("BO2_API_URL", "https://bo2-ranked.vercel.app/api/update_stats")
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
    "last_init_game": None,  # Guarda último InitGame para evitar duplicatas
    "match_info": {},  # Info da partida atual
    "players": {},  # Estatísticas por player
    "team_scores": {"allies": 0, "axis": 0},  # Score por equipe
    "registered_players_cache": {}  # Cache de players cadastrados {nome: bool}
}

# Estrutura de stats por player
def init_player_stats(player_name):
    """Inicializa estatísticas de um player"""
    return {
        "name": player_name,
        "team": None,  # allies ou axis
        "kills": 0,
        "deaths": 0,
        "assists": 0,
        "headshots": 0,
        "suicides": 0,
        "teamkills": 0,
        "current_streak": 0,
        "best_streak": 0,
        "death_streak": 0,
        "damage_dealt": 0,
        "damage_taken": 0,
        "weapons_used": {},  # {weapon: {kills, headshots, damage}}
        "victims": {},  # {victim_name: kill_count}
        "killed_by": {},  # {killer_name: death_count}
        "hit_locations": {},  # {hitloc: count} - mapa de calor
        "recent_damage": {},  # {victim_name: {damage, timestamp}} - para calcular assists
        "first_blood": False,
        "join_time": None,
        "quit_time": None,
        "playtime": 0,
        "chat_messages": []  # Mensagens enviadas no chat
    }

# ===============================
# FUNÇÕES DE LOG
# ===============================
def log_info(msg):
    """Loga mensagem informativa com timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] ℹ️  {msg}")

def log_error(msg):
    """Loga mensagem de erro com timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] ❌ {msg}", file=sys.stderr)

def log_success(msg):
    """Loga mensagem de sucesso com timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] ✅ {msg}")

def log_event(icon, title, details):
    """Loga evento formatado de forma organizada"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"\n[{timestamp}] {icon} {title}")
    for key, value in details.items():
        print(f"  │ {key:<20} {value}")
    print(f"  └{'─' * 50}")

# ===============================
# VERIFICAÇÃO DE REGISTRO
# ===============================
def verificar_player_registrado(player_name: str) -> bool:
    """
    Verifica se um player está cadastrado na plataforma
    Usa cache para evitar múltiplas requisições
    
    Args:
        player_name: Nome do player no Plutonium
    
    Returns:
        bool: True se está cadastrado
    """
    # Verifica cache primeiro
    if player_name in session_stats["registered_players_cache"]:
        return session_stats["registered_players_cache"][player_name]
    
    # Consulta API para verificar registro
    try:
        # Usa endpoint de health para verificar se player existe
        # (em produção, você pode criar um endpoint específico)
        payload = {
            "type": "check_registration",
            "data": {"player": player_name}
        }
        
        headers = {
            "Authorization": f"Bearer {SECRET_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(API_URL, headers=headers, json=payload, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            # Verifica se o Firebase retornou informação sobre registro
            firebase_info = data.get("firebase", {})
            is_registered = firebase_info.get("saved", False)
            
            # Atualiza cache
            session_stats["registered_players_cache"][player_name] = is_registered
            return is_registered
    except Exception as e:
        # Em caso de erro, assume não registrado mas não cacheia
        pass
    
    return False

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
            # Verifica se a resposta indica sucesso no Firebase
            try:
                response_data = response.json()
                firebase_info = response_data.get("firebase", {})
                
                # Atualiza cache de players registrados baseado na resposta
                if evento_tipo in ["kill", "player_join", "player_quit"]:
                    player_name = None
                    
                    if evento_tipo == "kill":
                        killer = dados.get("killer")
                        victim = dados.get("victim")
                        
                        # Se Firebase salvou, ambos estão registrados
                        if firebase_info.get("saved"):
                            if killer:
                                session_stats["registered_players_cache"][killer] = True
                            if victim:
                                session_stats["registered_players_cache"][victim] = True
                        else:
                            # Se não salvou, pelo menos um não está registrado
                            # Marca como não registrado (será verificado individualmente depois)
                            if killer and killer not in session_stats["registered_players_cache"]:
                                session_stats["registered_players_cache"][killer] = False
                            if victim and victim not in session_stats["registered_players_cache"]:
                                session_stats["registered_players_cache"][victim] = False
                    
                    elif evento_tipo in ["player_join", "player_quit"]:
                        player_name = dados.get("player")
                        if player_name:
                            # Se Firebase salvou, player está registrado
                            session_stats["registered_players_cache"][player_name] = firebase_info.get("saved", False)
                
                # Log apenas para eventos importantes (não para dano ou weapon change)
                if evento_tipo in ["kill", "match_start", "match_end", "player_join", "player_quit"]:
                    if firebase_info.get("saved"):
                        # Firebase salvou com sucesso - silencioso
                        pass
                    elif firebase_info.get("error"):
                        # Firebase teve erro - avisa apenas uma vez por sessão
                        if not hasattr(enviar_dados, "_firebase_warning_shown"):
                            log_error(f"⚠️  Firebase não está salvando: {firebase_info['error']}")
                            log_info("💡 Configure as credenciais do Firebase no Vercel para persistir dados")
                            enviar_dados._firebase_warning_shown = True
                
                if response_data.get("ok"):
                    return True
            except:
                pass
            return True
        else:
            log_error(f"Servidor retornou {response.status_code}: {response.text[:100]}")
            
            if retry < MAX_RETRIES:
                log_info(f"Tentando novamente em {RETRY_DELAY}s... (tentativa {retry + 1}/{MAX_RETRIES})")
                time.sleep(RETRY_DELAY)
                return enviar_dados(evento_tipo, dados, retry + 1)
            return False
            
    except requests.exceptions.ConnectionError:
        log_error(f"Falha na conexão com {API_URL}")
        if retry < MAX_RETRIES:
            log_info(f"Tentando novamente em {RETRY_DELAY}s... (tentativa {retry + 1}/{MAX_RETRIES})")
            time.sleep(RETRY_DELAY)
            return enviar_dados(evento_tipo, dados, retry + 1)
        return False
        
    except Exception as e:
        log_error(f"Erro ao enviar dados: {repr(e)}")
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
        
        killer_guid = data[1]
        killer_team = data[3]
        killer_name = data[4]
        victim_guid = data[5]
        victim_team = data[7]
        victim_name = data[8]
        weapon = data[9]
        damage = data[10]
        means_of_death = data[11]  # MOD_RIFLE, MOD_PISTOL, MOD_EXPLOSIVE, etc
        hitloc = data[12] if len(data) > 12 else "none"
        
        # Se killer e victim são iguais, é suicídio
        is_suicide = killer_name == victim_name
        
        # Se killer_guid é -1, é kill do mundo (queda, etc)
        is_world_kill = killer_guid == "-1"
        
        return {
            "killer": killer_name,
            "killer_guid": killer_guid,
            "killer_team": killer_team,
            "victim": victim_name,
            "victim_guid": victim_guid,
            "victim_team": victim_team,
            "weapon": weapon,
            "damage": damage,
            "means_of_death": means_of_death,
            "hitloc": hitloc,
            "headshot": hitloc.lower() == "head",
            "is_suicide": is_suicide,
            "is_world_kill": is_world_kill,
            "is_teamkill": killer_team == victim_team and not is_suicide
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

def parse_plutonium_weapon(linha: str):
    """
    Parse de troca de arma do Plutonium
    Formato: timestamp Weapon;guid;num;name;weapon
    Exemplo: 9:16 Weapon;5962719;1;alanzeira_AP;870mcs_mp+extbarrel+reflex
    """
    s = linha.strip()
    if " Weapon;" not in s:
        return None
    
    try:
        parts = s.split(" ", 1)
        if len(parts) < 2:
            return None
        
        data = parts[1].split(";")
        if len(data) < 5:
            return None
        
        return {
            "player": data[3],
            "guid": data[1],
            "weapon": data[4]
        }
    except Exception:
        return None

def parse_plutonium_say(linha: str):
    """
    Parse de mensagem de chat do Plutonium
    Formato: timestamp say;guid;num;name;message
    Exemplo: 11:58 say;6104210;2;[OpTc]HVDEZXL6;lol
    """
    s = linha.strip()
    if " say;" not in s:
        return None
    
    try:
        parts = s.split(" ", 1)
        if len(parts) < 2:
            return None
        
        data = parts[1].split(";", 4)  # Limita split para não quebrar a mensagem
        if len(data) < 5:
            return None
        
        return {
            "player": data[3],
            "guid": data[1],
            "message": data[4]
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
# PROCESSAMENTO DE ESTATÍSTICAS
# ===============================
def process_damage_stats(damage_data):
    """Processa estatísticas de dano"""
    attacker = damage_data["killer"]
    victim = damage_data["victim"]
    weapon = damage_data["weapon"]
    damage = int(damage_data["damage"]) if damage_data["damage"].isdigit() else 0
    hitloc = damage_data["hitloc"]
    
    # Inicializa players se não existirem
    if attacker not in session_stats["players"]:
        session_stats["players"][attacker] = init_player_stats(attacker)
    if victim not in session_stats["players"]:
        session_stats["players"][victim] = init_player_stats(victim)
    
    attacker_stats = session_stats["players"][attacker]
    victim_stats = session_stats["players"][victim]
    
    # Atualiza team do player
    if damage_data.get("killer_team"):
        attacker_stats["team"] = damage_data["killer_team"]
    if damage_data.get("victim_team"):
        victim_stats["team"] = damage_data["victim_team"]
    
    # Dano causado
    attacker_stats["damage_dealt"] += damage
    
    # Dano recebido
    victim_stats["damage_taken"] += damage
    
    # Hit location tracking
    if hitloc not in attacker_stats["hit_locations"]:
        attacker_stats["hit_locations"][hitloc] = 0
    attacker_stats["hit_locations"][hitloc] += 1
    
    # Weapon tracking
    if weapon not in attacker_stats["weapons_used"]:
        attacker_stats["weapons_used"][weapon] = {"kills": 0, "headshots": 0, "damage": 0}
    attacker_stats["weapons_used"][weapon]["damage"] += damage
    
    # Recent damage para cálculo de assists
    if victim not in attacker_stats["recent_damage"]:
        attacker_stats["recent_damage"][victim] = {"damage": 0, "timestamp": datetime.now()}
    attacker_stats["recent_damage"][victim]["damage"] += damage
    attacker_stats["recent_damage"][victim]["timestamp"] = datetime.now()

def process_kill_stats(kill_data):
    """Processa estatísticas de uma kill"""
    killer = kill_data["killer"]
    victim = kill_data["victim"]
    weapon = kill_data["weapon"]
    headshot = kill_data["headshot"]
    is_suicide = kill_data.get("is_suicide", False)
    is_world_kill = kill_data.get("is_world_kill", False)
    is_teamkill = kill_data.get("is_teamkill", False)
    
    # Inicializa players se não existirem
    if killer not in session_stats["players"]:
        session_stats["players"][killer] = init_player_stats(killer)
    if victim not in session_stats["players"]:
        session_stats["players"][victim] = init_player_stats(victim)
    
    killer_stats = session_stats["players"][killer]
    victim_stats = session_stats["players"][victim]
    
    # Atualiza team do player
    if kill_data.get("killer_team"):
        killer_stats["team"] = kill_data["killer_team"]
    if kill_data.get("victim_team"):
        victim_stats["team"] = kill_data["victim_team"]
    
    # Atualiza kills (se não for world kill ou suicide)
    if not is_world_kill and not is_suicide:
        killer_stats["kills"] += 1
        
        # Team score
        killer_team = kill_data.get("killer_team")
        if killer_team in ["allies", "axis"]:
            session_stats["team_scores"][killer_team] += 1
        
        # Teamkill
        if is_teamkill:
            killer_stats["teamkills"] += 1
        
        # Headshot
        if headshot:
            killer_stats["headshots"] += 1
        
        # Streak
        killer_stats["current_streak"] += 1
        killer_stats["death_streak"] = 0
        if killer_stats["current_streak"] > killer_stats["best_streak"]:
            killer_stats["best_streak"] = killer_stats["current_streak"]
        
        # First blood
        if session_stats["kills"] == 0:
            killer_stats["first_blood"] = True
        
        # Armas usadas
        if weapon not in killer_stats["weapons_used"]:
            killer_stats["weapons_used"][weapon] = {"kills": 0, "headshots": 0, "damage": 0}
        killer_stats["weapons_used"][weapon]["kills"] += 1
        if headshot:
            killer_stats["weapons_used"][weapon]["headshots"] += 1
        
        # Vítimas
        if victim not in killer_stats["victims"]:
            killer_stats["victims"][victim] = 0
        killer_stats["victims"][victim] += 1
        
        # Calcular assists (quem deu dano na vítima nos últimos 5 segundos)
        for player_name, player_stats in session_stats["players"].items():
            if player_name == killer or player_name == victim:
                continue
            
            if victim in player_stats["recent_damage"]:
                recent = player_stats["recent_damage"][victim]
                time_diff = (datetime.now() - recent["timestamp"]).total_seconds()
                
                # Se deu dano nos últimos 5 segundos, conta como assist
                if time_diff <= 5 and recent["damage"] >= 10:
                    player_stats["assists"] += 1
                    log_event("🤝", "ASSISTÊNCIA", {
                        "Jogador": player_name,
                        "Dano dado": f"{recent['damage']} HP",
                        "Vítima": victim,
                        "Matador": killer
                    })
        
        # Limpa recent_damage da vítima
        for player_stats in session_stats["players"].values():
            if victim in player_stats["recent_damage"]:
                del player_stats["recent_damage"][victim]
    
    # Atualiza deaths
    victim_stats["deaths"] += 1
    victim_stats["current_streak"] = 0
    victim_stats["death_streak"] += 1
    
    # Killed by
    if not is_world_kill and not is_suicide:
        if killer not in victim_stats["killed_by"]:
            victim_stats["killed_by"][killer] = 0
        victim_stats["killed_by"][killer] += 1
    
    # Suicides
    if is_suicide:
        victim_stats["suicides"] += 1

def get_match_summary():
    """Gera resumo da partida com estatísticas detalhadas"""
    players_summary = []
    
    for player_name, stats in session_stats["players"].items():
        kd_ratio = stats["kills"] / stats["deaths"] if stats["deaths"] > 0 else stats["kills"]
        headshot_ratio = (stats["headshots"] / stats["kills"] * 100) if stats["kills"] > 0 else 0
        
        # Arma mais usada
        favorite_weapon = "N/A"
        if stats["weapons_used"]:
            favorite_weapon = max(stats["weapons_used"].items(), key=lambda x: x[1]["kills"])[0]
        
        # Rival (quem mais matou)
        favorite_victim = "N/A"
        if stats["victims"]:
            favorite_victim = max(stats["victims"].items(), key=lambda x: x[1])[0]
        
        # Nemesis (quem mais te matou)
        nemesis = "N/A"
        if stats["killed_by"]:
            nemesis = max(stats["killed_by"].items(), key=lambda x: x[1])[0]
        
        # Hit location mais comum
        favorite_hitloc = "N/A"
        if stats["hit_locations"]:
            favorite_hitloc = max(stats["hit_locations"].items(), key=lambda x: x[1])[0]
        
        players_summary.append({
            "player": player_name,
            "team": stats["team"],
            "kills": stats["kills"],
            "deaths": stats["deaths"],
            "assists": stats["assists"],
            "kd_ratio": round(kd_ratio, 2),
            "headshots": stats["headshots"],
            "headshot_ratio": round(headshot_ratio, 1),
            "best_streak": stats["best_streak"],
            "damage_dealt": stats["damage_dealt"],
            "damage_taken": stats["damage_taken"],
            "suicides": stats["suicides"],
            "teamkills": stats["teamkills"],
            "first_blood": stats["first_blood"],
            "favorite_weapon": favorite_weapon,
            "favorite_victim": favorite_victim,
            "favorite_hitloc": favorite_hitloc,
            "nemesis": nemesis,
            "weapons_stats": stats["weapons_used"],
            "hit_locations": stats["hit_locations"],
            "chat_messages": stats["chat_messages"]
        })
    
    # Ordena por kills
    players_summary.sort(key=lambda x: x["kills"], reverse=True)
    
    # Define MVP (mais kills)
    if players_summary:
        players_summary[0]["is_mvp"] = True
    
    # Determina vencedor
    winner_team = None
    gametype = session_stats["match_info"].get("mode", "")
    
    if gametype == "dm":  # Free-for-all
        if players_summary:
            winner_team = players_summary[0]["player"]  # Vencedor individual
    else:  # Team modes (tdm, dom, etc)
        allies_score = session_stats["team_scores"]["allies"]
        axis_score = session_stats["team_scores"]["axis"]
        
        if allies_score > axis_score:
            winner_team = "allies"
        elif axis_score > allies_score:
            winner_team = "axis"
        else:
            winner_team = "draw"
    
    return {
        "match_info": session_stats["match_info"],
        "total_kills": session_stats["kills"],
        "total_deaths": sum(p["deaths"] for p in players_summary),
        "team_scores": session_stats["team_scores"],
        "winner_team": winner_team,
        "players": players_summary,
        "duration": (datetime.now() - session_stats["start_time"]).total_seconds() if session_stats["start_time"] else 0
    }

# ===============================
# MONITOR PRINCIPAL
# ===============================
def monitorar_log():
    """Loop principal de monitoramento do log"""
    
    print("\n" + "=" * 70)
    print(f"{'🎮 BO2 RANKED - MONITOR DE LOGS':^70}")
    print("=" * 70)
    print(f"\n📡 API URL:      {API_URL}")
    print(f"📁 Arquivo Log:  {LOG_FILE}")
    print(f"⏱️  Intervalo:    {CHECK_INTERVAL}s")
    
    if not SECRET_KEY:
        log_error("BO2_SECRET não configurado! Use: setx BO2_SECRET \"sua_chave\" /M")
        return
    else:
        print(f"🔑 Secret Key:   {'*' * min(len(SECRET_KEY), 40)} ({len(SECRET_KEY)} chars)")
    
    # Verifica se o arquivo de log existe
    log_path = Path(LOG_FILE)
    if not log_path.exists():
        print(f"\n⚠️  Criando arquivo de log: {LOG_FILE}")
        log_path.parent.mkdir(parents=True, exist_ok=True)
        log_path.touch()
    
    # IMPORTANTE: Começa do FINAL do arquivo (ignora histórico)
    ultima_posicao = 0
    try:
        with open(LOG_FILE, "r", encoding="utf-8", errors="ignore") as file:
            file.seek(0, 2)  # Vai para o final do arquivo
            ultima_posicao = file.tell()
            print(f"\n✅ Iniciando monitoramento (posição: {ultima_posicao} bytes)")
    except Exception:
        pass
    
    print("👀 Aguardando novos eventos no log...")
    print("=" * 70 + "\n")
    
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
                    
                    # PLUTONIUM DAMAGE events (para assists e stats de dano)
                    if " D;" in linha:
                        dados = parse_plutonium_kill(linha)  # Usa mesmo parser (formato igual)
                        if dados:
                            process_damage_stats(dados)
                            # Silencioso - não loga dano individual (muito spam)
                    
                    # PLUTONIUM KILL events (formato real do jogo)
                    elif " K;" in linha:
                        dados = parse_plutonium_kill(linha)
                        if dados:
                            # Processa kill (inclusive suicídios e world kills)
                            if not dados.get("is_world_kill"):
                                # Suicídios e kills normais incrementam contador
                                if not dados.get("is_suicide"):
                                    session_stats["kills"] += 1
                                
                                process_kill_stats(dados)
                                enviar_dados("kill", dados)
                                
                                # Log formatado
                                killer = dados["killer"]
                                victim = dados["victim"]
                                weapon = dados["weapon"]
                                
                                if dados.get("is_suicide"):
                                    # Verifica registro do player
                                    player_reg = killer in session_stats["registered_players_cache"] and session_stats["registered_players_cache"][killer]
                                    
                                    log_event("💀", "SUICÍDIO", {
                                        "Jogador": f"{killer} {'✅' if player_reg else '❌'}",
                                        "Arma": weapon,
                                        "Time": dados.get("killer_team", "N/A").upper(),
                                        "Status": f"{'CADASTRADO' if player_reg else 'NÃO CADASTRADO'}"
                                    })
                                elif dados.get("is_teamkill"):
                                    # Verifica registro dos players
                                    killer_reg = killer in session_stats["registered_players_cache"] and session_stats["registered_players_cache"][killer]
                                    victim_reg = victim in session_stats["registered_players_cache"] and session_stats["registered_players_cache"][victim]
                                    
                                    status_icon = "💾" if (killer_reg and victim_reg) else "⚠️"
                                    
                                    log_event("🔫", "TEAMKILL", {
                                        "Matador": f"{killer} {'✅' if killer_reg else '❌'}",
                                        "Vítima": f"{victim} {'✅' if victim_reg else '❌'}",
                                        "Arma": weapon,
                                        "Time": dados.get("killer_team", "N/A").upper(),
                                        "Salvo": f"{status_icon} {'SIM' if (killer_reg and victim_reg) else 'NÃO (players não cadastrados)'}"
                                    })
                                elif dados.get("headshot"):
                                    # Verifica registro dos players
                                    killer_reg = killer in session_stats["registered_players_cache"] and session_stats["registered_players_cache"][killer]
                                    victim_reg = victim in session_stats["registered_players_cache"] and session_stats["registered_players_cache"][victim]
                                    
                                    status_icon = "💾" if (killer_reg and victim_reg) else "⚠️"
                                    
                                    log_event("🎯", "HEADSHOT", {
                                        "Matador": f"{killer} {'✅' if killer_reg else '❌'}",
                                        "Vítima": f"{victim} {'✅' if victim_reg else '❌'}",
                                        "Arma": weapon,
                                        "Streak": session_stats["players"][killer]["current_streak"],
                                        "Salvo": f"{status_icon} {'SIM' if (killer_reg and victim_reg) else 'NÃO (players não cadastrados)'}"
                                    })
                                else:
                                    # Verifica registro dos players
                                    killer_reg = killer in session_stats["registered_players_cache"] and session_stats["registered_players_cache"][killer]
                                    victim_reg = victim in session_stats["registered_players_cache"] and session_stats["registered_players_cache"][victim]
                                    
                                    status_icon = "💾" if (killer_reg and victim_reg) else "⚠️"
                                    
                                    log_event("💥", "KILL", {
                                        "Matador": f"{killer} {'✅' if killer_reg else '❌'}",
                                        "Vítima": f"{victim} {'✅' if victim_reg else '❌'}",
                                        "Arma": weapon,
                                        "Local do Hit": dados.get("hitloc", "N/A"),
                                        "Streak": session_stats["players"][killer]["current_streak"],
                                        "Salvo": f"{status_icon} {'SIM' if (killer_reg and victim_reg) else 'NÃO (players não cadastrados)'}"
                                    })
                    
                    # PLUTONIUM PLAYER JOIN
                    elif " J;" in linha:
                        dados = parse_plutonium_join(linha)
                        if dados:
                            player_name = dados['player']
                            
                            # Inicializa stats do player
                            if player_name not in session_stats["players"]:
                                session_stats["players"][player_name] = init_player_stats(player_name)
                            session_stats["players"][player_name]["join_time"] = datetime.now()
                            
                            # Envia dados primeiro para verificar registro
                            enviar_dados("player_join", dados)
                            
                            # Verifica se está registrado (verifica resposta do servidor)
                            is_registered = player_name in session_stats["registered_players_cache"] and session_stats["registered_players_cache"][player_name]
                            
                            status_icon = "✅" if is_registered else "⚠️"
                            status_text = "CADASTRADO" if is_registered else "NÃO CADASTRADO"
                            
                            log_event("🟢", "JOGADOR ENTROU", {
                                "Nome": player_name,
                                "GUID": dados['guid'],
                                "Status": f"{status_icon} {status_text}",
                                "Jogadores Online": len(session_stats["players"])
                            })
                    
                    # PLUTONIUM PLAYER QUIT
                    elif " Q;" in linha:
                        dados = parse_plutonium_quit(linha)
                        if dados:
                            player_name = dados['player']
                            
                            # Calcula tempo de jogo
                            playtime = 0
                            stats_summary = {}
                            if player_name in session_stats["players"]:
                                player_stats = session_stats["players"][player_name]
                                if player_stats["join_time"]:
                                    player_stats["quit_time"] = datetime.now()
                                    player_stats["playtime"] = (player_stats["quit_time"] - player_stats["join_time"]).total_seconds()
                                    playtime = int(player_stats["playtime"] / 60)  # minutos
                                
                                stats_summary = {
                                    "Nome": player_name,
                                    "Tempo de Jogo": f"{playtime} min",
                                    "K/D/A": f"{player_stats['kills']}/{player_stats['deaths']}/{player_stats['assists']}",
                                    "Melhor Streak": player_stats['best_streak']
                                }
                            else:
                                stats_summary = {"Nome": player_name}
                            
                            log_event("🔴", "JOGADOR SAIU", stats_summary)
                            
                            enviar_dados("player_quit", dados)
                    
                    # PLUTONIUM WEAPON CHANGE
                    elif " Weapon;" in linha:
                        dados = parse_plutonium_weapon(linha)
                        if dados:
                            # Silencioso - não loga troca de arma (muito spam)
                            enviar_dados("weapon_change", dados)
                    
                    # PLUTONIUM CHAT MESSAGE
                    elif " say;" in linha:
                        dados = parse_plutonium_say(linha)
                        if dados:
                            player_name = dados['player']
                            message = dados['message']
                            
                            # Salva no histórico do player
                            if player_name in session_stats["players"]:
                                session_stats["players"][player_name]["chat_messages"].append({
                                    "timestamp": datetime.now().isoformat(),
                                    "message": message
                                })
                            
                            log_event("💬", "CHAT", {
                                "Jogador": player_name,
                                "Mensagem": message
                            })
                            
                            enviar_dados("chat_message", dados)
                    
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
                                session_stats["match_info"] = dados
                                session_stats["players"] = {}  # Reset players
                                session_stats["team_scores"] = {"allies": 0, "axis": 0}  # Reset team scores
                                
                                print("\n" + "=" * 70)
                                log_event("🎮", "PARTIDA INICIADA", {
                                    "Mapa": dados.get("map", "Desconhecido"),
                                    "Modo": dados.get("mode", "Desconhecido").upper(),
                                    "Max Jogadores": dados.get("players", "?")
                                })
                                print("=" * 70)
                                
                                enviar_dados("match_start", dados)
                    
                    # PLUTONIUM SHUTDOWN GAME (fim de partida)
                    elif "ShutdownGame:" in linha:
                        if session_stats["match_active"]:
                            session_stats["match_active"] = False
                            
                            # Gera resumo completo da partida
                            match_summary = get_match_summary()
                            enviar_dados("match_end", match_summary)
                            
                            # Log resumo da partida
                            print("\n" + "=" * 70)
                            print(f"{'🏁 PARTIDA FINALIZADA':^70}")
                            print("=" * 70)
                            
                            # Info da partida
                            map_name = match_summary['match_info'].get('map', 'Desconhecido')
                            duration_min = int(match_summary['duration'] / 60)
                            duration_sec = int(match_summary['duration'] % 60)
                            
                            print(f"\n📍 Mapa: {map_name}")
                            print(f"⏱️  Duração: {duration_min}:{duration_sec:02d}")
                            print(f"💀 Total de Kills: {match_summary['total_kills']}")
                            
                            # Vencedor
                            winner = match_summary.get('winner_team', 'Desconhecido')
                            print(f"\n{'─' * 70}")
                            if winner in ['allies', 'axis']:
                                team_scores = match_summary['team_scores']
                                winner_name = "ALIADOS" if winner == "allies" else "EIXO"
                                print(f"🏆 VENCEDOR: {winner_name}")
                                print(f"📊 Placar: Aliados {team_scores['allies']} x {team_scores['axis']} Eixo")
                            elif winner == 'draw':
                                print(f"🤝 RESULTADO: EMPATE")
                            else:
                                print(f"🏆 VENCEDOR: {winner}")
                            
                            # Top 5 jogadores
                            print(f"\n{'─' * 70}")
                            print(f"{'👥 TOP 5 JOGADORES':^70}")
                            print(f"{'─' * 70}")
                            
                            for i, p in enumerate(match_summary["players"][:5], 1):
                                mvp = " 👑" if p.get("is_mvp") else ""
                                fb = " 🩸" if p.get("first_blood") else ""
                                team = f"[{p.get('team', '?').upper()}]" if p.get('team') else ""
                                
                                name_display = f"{p['player']}{team}{mvp}{fb}"
                                kda = f"{p['kills']}K/{p['deaths']}D/{p['assists']}A"
                                kd_ratio = f"K/D: {p['kd_ratio']}"
                                hs = f"HS: {p['headshot_ratio']}%"
                                
                                print(f"\n  {i}º {name_display}")
                                print(f"     │ KDA:        {kda}")
                                print(f"     │ {kd_ratio:<12} {hs}")
                                print(f"     │ Streak:     {p['best_streak']}")
                                print(f"     │ Dano:       {p['damage_dealt']}")
                            
                            print(f"\n{'=' * 70}\n")
                    
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
            log_error(f"Arquivo de log não encontrado: {LOG_FILE}")
            time.sleep(CHECK_INTERVAL * 2)
        
        except KeyboardInterrupt:
            print("\n\n" + "=" * 70)
            print(f"{'⏹️  MONITOR ENCERRADO PELO USUÁRIO':^70}")
            print("=" * 70 + "\n")
            sys.exit(0)
        
        except Exception as e:
            log_error(f"Erro inesperado: {repr(e)}")
        
        time.sleep(CHECK_INTERVAL)

# ===============================
# ENTRY POINT
# ===============================
if __name__ == "__main__":
    try:
        monitorar_log()
    except KeyboardInterrupt:
        print("\n✅ Encerramento completo\n")
        sys.exit(0)
