require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

// Parse JSON bodies for API routes
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// API route to receive updates from BO2 server
const SECRET_KEY = process.env.BO2_SECRET || 'fallback_secreto';
app.post('/api/update_stats', (req, res) => {
    // Method guard (Express only routes POST here, but keep parity with Next handler)
    // Authorization check
    const auth = req.headers.authorization;
    if (!auth || auth !== `Bearer ${SECRET_KEY}`) {
        return res.status(403).json({ error: 'Não autorizado' });
    }

    const body = req.body;
    console.log('📩 Dados recebidos do servidor:', body);

    // Aqui você poderia salvar no banco, por enquanto só confirma o recebimento
    return res.status(200).json({ ok: true, recebido: body });
});

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`BO2 Ranked System running on port ${PORT}`);
});
