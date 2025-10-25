import requests
import time
import json
import os

# ===============================
# ⚙️ CONFIGURAÇÕES
# ===============================
API_URL = "http://localhost:3000/api/update_stats"  # endereço do servidor Node
# Lê a variável de ambiente BO2_SECRET ou usa um fallback local
SECRET_KEY = os.getenv("BO2_SECRET", "fallback_secreto")  # mesma chave do server.js
LOG_FILE = "player_stats.txt"  # log do jogo (ou arquivo monitorado)

# ===============================
# 🔁 FUNÇÃO PARA ENVIAR DADOS
# ===============================
def enviar_stats(killer, victim, stats):
    payload = {
        "killer": killer,
        "victim": victim,
        "stats": stats
    }

    headers = {
        "Authorization": f"Bearer {SECRET_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        print("📤 Enviado:", payload)
        print("📥 Resposta:", response.status_code, response.text)
    except Exception as e:
        print("❌ Erro ao enviar stats:", e)


# ===============================
# 📜 MONITORAR O ARQUIVO DE LOG
# ===============================
def monitorar_log():
    print("👀 Monitorando arquivo:", LOG_FILE)
    ultima_posicao = 0

    while True:
        try:
            with open(LOG_FILE, "r") as file:
                file.seek(ultima_posicao)
                linhas = file.readlines()
                ultima_posicao = file.tell()

                for linha in linhas:
                    # Exemplo de log: "KILL: PlayerA matou PlayerB (Headshot)"
                    if "KILL:" in linha:
                        partes = linha.strip().split()
                        killer = partes[1]
                        victim = partes[3]
                        stats = {"tipo": "headshot" if "(Headshot)" in linha else "normal"}
                        enviar_stats(killer, victim, stats)

        except FileNotFoundError:
            print("⚠️ Arquivo de log não encontrado, aguardando...")
        except Exception as e:
            print("❌ Erro geral:", e)

        time.sleep(5)  # verifica a cada 5 segundos


if __name__ == "__main__":
    monitorar_log()
