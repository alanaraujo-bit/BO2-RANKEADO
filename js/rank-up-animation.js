// ============================================================================
// RANK UP ANIMATION SYSTEM
// Sistema de animação de rank up tipo BO2 Prestige
// ============================================================================

const RankUpAnimation = {
    // Mostrar animação de rank up
    show(rankData) {
        const overlay = document.getElementById('rankUpOverlay');
        const icon = document.getElementById('rankUpIcon');
        const name = document.getElementById('rankUpName');
        const mmr = document.getElementById('rankUpMMR');
        
        // Atualizar dados
        icon.textContent = rankData.icon;
        name.textContent = rankData.name;
        mmr.textContent = `${rankData.mmr} MMR`;
        
        // Mostrar overlay
        overlay.classList.add('active');
        
        // Criar partículas explosivas
        this.createParticles();
        
        // Tocar som (opcional - comentado por enquanto)
        // this.playSound();
        
        // Auto-fechar após 4 segundos
        setTimeout(() => {
            this.hide();
        }, 4000);
    },
    
    // Esconder animação
    hide() {
        const overlay = document.getElementById('rankUpOverlay');
        overlay.classList.remove('active');
        
        // Limpar partículas
        const container = document.getElementById('rankUpParticles');
        container.innerHTML = '';
    },
    
    // Criar explosão de partículas
    createParticles() {
        const container = document.getElementById('rankUpParticles');
        container.innerHTML = ''; // Limpar anteriores
        
        const particleCount = 50; // 50 partículas
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Posição aleatória em círculo
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 200 + Math.random() * 300; // Velocidade aleatória
            
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            // Cor aleatória (laranja ou azul)
            const colors = ['#FF7A00', '#FF8800', '#00D9FF', '#FFD700'];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            // Tamanho aleatório
            const size = 4 + Math.random() * 8;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Definir variáveis CSS para animação
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            // Delay aleatório
            particle.style.animationDelay = (Math.random() * 0.3) + 's';
            
            container.appendChild(particle);
        }
    },
    
    // Tocar som de rank up (opcional - requer arquivo de áudio)
    playSound() {
        // Para adicionar som, descomentar e adicionar arquivo de áudio:
        /*
        const audio = new Audio('sounds/rank-up.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Não foi possível tocar o som:', e));
        */
    }
};

// Testar animação (comentar em produção)
// Para testar, descomente a linha abaixo:
// setTimeout(() => RankUpAnimation.show({ icon: '🥇', name: 'OURO I', mmr: 1500 }), 2000);

// Exportar para uso global
window.RankUpAnimation = RankUpAnimation;
