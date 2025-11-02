# 🔥 ATUALIZAR REGRAS DO FIRESTORE

## 📋 Passo a Passo:

1. **Acesse o Firebase Console:**
   - URL: https://console.firebase.google.com/project/rankops-8d2ea/firestore/rules

2. **Cole as novas regras:**
   - Copie o conteúdo do arquivo `firestore.rules` deste projeto
   - Cole na área de edição do Firebase Console

3. **Publique as regras:**
   - Clique no botão **"Publicar"** ou **"Publish"**
   - Aguarde a confirmação

---

## ✅ Pronto!

Agora o Firestore está pronto para receber dados de forma organizada!

## 🗄️ Estrutura Criada:

### Collections Principais:

1. **`players`** - Perfis dos jogadores
   - Subcollection: `matches` - Histórico de partidas

2. **`matches`** - Partidas completas com todos os dados

3. **`kills`** - Registro de kills individuais

4. **`events`** - Eventos genéricos (chat, weapon_change, etc)

---

## 🎮 Testando:

Depois que o Vercel terminar o deploy (1-2 minutos):

1. **Reinicie o monitor Python**
2. **Jogue uma partida completa**
3. **Veja os dados no Firebase Console:**
   - https://console.firebase.google.com/project/rankops-8d2ea/firestore/data

Você deve ver:
- ✅ Collection `players` com seu jogador
- ✅ Collection `matches` com a partida
- ✅ Collection `kills` com as kills da partida
- ✅ Dentro do seu player: subcollection `matches` com o histórico

---

## 📊 Benefícios:

✅ **Queries rápidas** - Dados organizados por entidade  
✅ **Histórico por jogador** - Fácil ver evolução  
✅ **Rankings** - Calcular top players facilmente  
✅ **Análises** - Stats detalhadas por mapa, arma, etc  
✅ **Escalável** - Suporta milhares de jogadores e partidas  

---

**Pronto para testar!** 🚀
