import requests
import time
import os

# ===============================
# Configurações (somente ASCII)
# ===============================
API_URL = os.getenv("BO2_API_URL", "https://bo2-ranked.vercel.app/api/update_stats")
SECRET_KEY = os.getenv("BO2_SECRET", "")
DEFAULT_LOG = r"C:\\Program Files (x86)\\Steam\\steamapps\\common\\Call of Duty Black Ops II\\player_stats.txt"
LOG_FILE = os.getenv("BO2_LOG_FILE", DEFAULT_LOG)


def enviar_stats(killer: str, victim: str, stats: dict) -> None:
    payload = {"killer": killer, "victim": victim, "stats": stats}
    headers = {"Authorization": f"Bearer {SECRET_KEY}", "Content-Type": "application/json"}
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=10)
        print("SENT:", payload)
        print("RESPONSE:", response.status_code, response.text)
    except Exception as e:
        print("ERROR sending stats:", repr(e))


def parse_kill_line(linha: str):
    # Aceita formatos:
    #   "KILL: PlayerA -> PlayerB"
    #   "KILL: PlayerA matou PlayerB (Headshot)"
    s = linha.strip()
    if not s.startswith("KILL:"):
        return None
    content = s[len("KILL:"):].strip()
    killer = victim = None

    if "->" in content:
        parts = [p.strip() for p in content.split("->", 1)]
        if len(parts) == 2:
            killer, victim = parts[0], parts[1]
    else:
        # Fallback muito simples: "PlayerA matou PlayerB"
        words = content.split()
        if len(words) >= 3:
            killer, victim = words[0], words[2]

    if not killer or not victim:
        return None

    stats = {"tipo": "headshot" if "Headshot" in linha or "(Headshot)" in linha else "normal"}
    return killer, victim, stats


def monitorar_log():
    print(f"API_URL={API_URL}")
    print(f"LOG_FILE={LOG_FILE}")
    if not SECRET_KEY:
        print("WARNING: BO2_SECRET vazio. Defina a variavel de ambiente BO2_SECRET.")

    ultima_posicao = 0
    while True:
        try:
            with open(LOG_FILE, "r", encoding="utf-8", errors="ignore") as file:
                file.seek(ultima_posicao)
                linhas = file.readlines()
                ultima_posicao = file.tell()

                for linha in linhas:
                    if "KILL:" in linha:
                        parsed = parse_kill_line(linha)
                        if parsed:
                            killer, victim, stats = parsed
                            enviar_stats(killer, victim, stats)
        except FileNotFoundError:
            print("Log file not found, waiting...")
        except Exception as e:
            print("ERROR loop:", repr(e))

        time.sleep(5)  # verifica a cada 5 segundos


if __name__ == "__main__":
    monitorar_log()
