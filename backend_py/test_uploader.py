#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de teste para o BO2 Log Uploader
Simula eventos de jogo e testa a conexão com o servidor
"""

import sys
import time
from pathlib import Path

# Adiciona algumas linhas de teste ao arquivo de log
def adicionar_teste_logs(log_file):
    """Adiciona eventos de teste ao arquivo de log"""
    
    print("=" * 60)
    print("BO2 LOG UPLOADER - TESTE")
    print("=" * 60)
    print(f"\nArquivo de log: {log_file}\n")
    
    eventos_teste = [
        "MATCH_START: Nuketown, Team Deathmatch, 8 players",
        "KILL: TestPlayer1 -> TestPlayer2 [M4A1]",
        "KILL: TestPlayer2 -> TestPlayer3 [DSR-50] (headshot)",
        "KILL: TestPlayer1 -> TestPlayer3 [AN-94]",
        "KILL: TestPlayer3 -> TestPlayer1 [Remington 870]",
        "KILL: TestPlayer1 -> TestPlayer2 [MSMC] (headshot)",
        "MATCH_END: TestPlayer1, 30-20, 08:45"
    ]
    
    print("Adicionando eventos de teste:")
    print("-" * 60)
    
    with open(log_file, 'a', encoding='utf-8') as f:
        for i, evento in enumerate(eventos_teste, 1):
            print(f"{i}. {evento}")
            f.write(evento + '\n')
            f.flush()  # Força escrita imediata
            time.sleep(1)  # Aguarda 1 segundo entre eventos
    
    print("-" * 60)
    print("\n✓ Eventos adicionados com sucesso!")
    print("\nVerifique o console do log monitor para ver os eventos sendo processados.")
    print("=" * 60)

if __name__ == "__main__":
    # Define o caminho do log
    import os
    DEFAULT_LOG = r"C:\Program Files (x86)\Steam\steamapps\common\Call of Duty Black Ops II\player_stats.txt"
    LOG_FILE = os.getenv("BO2_LOG_FILE", DEFAULT_LOG)
    
    # Cria o arquivo se não existir
    log_path = Path(LOG_FILE)
    if not log_path.exists():
        log_path.parent.mkdir(parents=True, exist_ok=True)
        log_path.touch()
        print(f"Arquivo de log criado: {LOG_FILE}\n")
    
    # Adiciona eventos de teste
    try:
        adicionar_teste_logs(LOG_FILE)
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        sys.exit(1)
