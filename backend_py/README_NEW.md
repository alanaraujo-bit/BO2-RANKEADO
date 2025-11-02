# 🎮 BO2 RANKED - LOG MONITOR & UPLOADER

Monitor automático que captura eventos do Black Ops 2 e envia para o sistema ranqueado.

## 📋 Requisitos

- **Python 3.8+**
- **Biblioteca `requests`**
- **Variável de ambiente `BO2_SECRET`** configurada

## 🚀 Instalação Rápida

### 1. Instalar Python (se não tiver)
Baixe e instale: [Python 3.12](https://www.python.org/downloads/)
- ✅ Marque "Add Python to PATH" durante a instalação

### 2. Instalar Dependências
Abra PowerShell como **Administrador** e execute:

```powershell
# Usando py (recomendado no Windows)
py -m pip install --upgrade pip
py -m pip install requests

# OU usando python diretamente
python -m pip install --upgrade pip
python -m pip install requests
```

### 3. Configurar Variável de Ambiente
**IMPORTANTE:** Defina sua chave secreta (mesma do servidor):

```powershell
# PowerShell como Administrador
setx BO2_SECRET "sua_chave_secreta_aqui" /M
```

Substitua `sua_chave_secreta_aqui` pela mesma chave configurada no servidor.

## 🎯 Como Usar

### Método 1: Arquivo .CMD (Recomendado)
1. Abra PowerShell na pasta `backend_py`
2. Execute:
```powershell
.\run_uploader.cmd
```

### Método 2: Python Direto
1. Abra PowerShell na pasta `backend_py`
2. Execute:
```powershell
py bo2_log_uploader.py
```

## 📝 Formatos de Log Suportados

O script monitora o arquivo de log e aceita os seguintes formatos:

### Kills
```
KILL: PlayerA -> PlayerB
KILL: PlayerA -> PlayerB [M4A1]
KILL: PlayerA -> PlayerB [DSR-50] (headshot)
```

### Início de Partida
```
MATCH_START: Nuketown, TDM, 8 players
MATCH_START: Hijacked, Domination, 12 players
```

### Fim de Partida
```
MATCH_END: Blue Team, 75-50, 10:30
MATCH_END: Alan, 30-15, 08:45
```

## ⚙️ Configuração Avançada

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `BO2_SECRET` | *(obrigatório)* | Chave secreta de autenticação |
| `BO2_API_URL` | `http://localhost:3000/api/update_stats` | URL do servidor |
| `BO2_LOG_FILE` | `C:\...\Call of Duty Black Ops II\player_stats.txt` | Caminho do log |

### Exemplo de Configuração Completa
```powershell
setx BO2_SECRET "minha_chave_super_secreta" /M
setx BO2_API_URL "https://seu-site.vercel.app/api/update_stats" /M
setx BO2_LOG_FILE "C:\Custom\Path\game_log.txt" /M
```

**Nota:** Após definir variáveis de ambiente, reinicie o PowerShell.

## 🔍 Monitoramento

O script exibe em tempo real:
- ✅ Kills detectados e enviados
- ✅ Início/fim de partidas
- ✅ Status de conexão com servidor
- ❌ Erros e tentativas de retry

Exemplo de output:
```
[2025-11-01 15:30:45] INFO: BO2 RANKED - LOG MONITOR STARTED
[2025-11-01 15:30:45] INFO: API URL: http://localhost:3000/api/update_stats
[2025-11-01 15:30:45] INFO: Log File: C:\...\player_stats.txt
[2025-11-01 15:31:10] ✓ KILL: {"killer": "Alan", "victim": "Pedro", "weapon": "M4A1", "headshot": false}
[2025-11-01 15:31:15] ✓ KILL: {"killer": "Alan", "victim": "Bruno", "weapon": "DSR-50", "headshot": true}
```

## 🐛 Troubleshooting

### Erro: "Python não encontrado"
- Reinstale Python marcando "Add to PATH"
- Use `py` ao invés de `python`

### Erro: "requests not found"
```powershell
py -m pip install requests --force-reinstall
```

### Erro: "BO2_SECRET não definido"
```powershell
setx BO2_SECRET "sua_chave" /M
# Reinicie o PowerShell
```

### Erro: "Connection failed"
- Verifique se o servidor Node está rodando
- Confirme a URL em `BO2_API_URL`
- Verifique firewall/antivírus

### Log não está sendo detectado
- Confirme o caminho do arquivo em `BO2_LOG_FILE`
- Verifique se o arquivo existe e tem permissões de leitura
- Teste adicionando uma linha manualmente no arquivo

## 🧪 Teste Manual

Para testar sem o jogo rodando:

1. Abra o arquivo `player_stats.txt` no caminho configurado
2. Adicione uma linha:
```
KILL: TestPlayer1 -> TestPlayer2 [M4A1] (headshot)
```
3. Salve o arquivo
4. Veja o output no console do monitor

## 📊 Integração com o Sistema

O monitor envia dados para `/api/update_stats` que:
1. Valida a autenticação (Bearer token)
2. Armazena eventos no Firestore
3. Atualiza estatísticas dos jogadores
4. Calcula MMR e rankings

## 🔒 Segurança

- ✅ Usa autenticação Bearer token
- ✅ Chave secreta em variável de ambiente
- ✅ Retry automático em caso de falha
- ✅ Timeout configurado (10s)
- ✅ Logs sanitizados (sem expor dados sensíveis)

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs em `uploader.out.log`
2. Confirme as variáveis de ambiente
3. Teste a conexão com o servidor
4. Verifique as permissões do arquivo de log

---

**Desenvolvido para BO2 Ranked System** 🎯
