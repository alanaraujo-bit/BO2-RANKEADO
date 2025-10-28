# BO2 Log Uploader (Python)

Este utilitário monitora um arquivo de log (`player_stats.txt`) e envia estatísticas para o endpoint do servidor Node (`/api/update_stats`).

## Requisitos
- Python 3.8+
- Biblioteca `requests`

Instalação (Windows PowerShell):
```powershell
py -m pip install --upgrade pip ; py -m pip install requests
```
Se o comando `py` não existir, tente:
```powershell
python -m pip install --upgrade pip ; python -m pip install requests
```

## Como usar
1. Inicie seu servidor Node (na raiz do projeto):
```powershell
npm start
```
2. Em outro terminal, rode o uploader (na pasta `backend_py`):
```powershell
cd backend_py
py bo2_log_uploader.py
```
3. Edite/adicione linhas em `player_stats.txt` com o formato:
```
KILL: PlayerA matou PlayerB (Headshot)
KILL: Alan matou Bruno
```
O script lê novas linhas e envia para `http://localhost:3000/api/update_stats` com bearer `MINHA_CHAVE_SECRETA_BO2`.

## Observações
- Ajuste `SECRET_KEY` no script e no `server.js` para uma variável de ambiente em produção.
- Altere `API_URL` se o servidor Node estiver remoto.
