/* ===================================================================
   MATCH REGISTRATION PAGE - INTERACTIVE FUNCTIONS
   BO2 Plutonium Ranked System
   ================================================================ */

// Result button selection
function selectResult(result) {
    const winBtn = document.getElementById('resultWin');
    const lossBtn = document.getElementById('resultLoss');
    const hiddenInput = document.getElementById('resultSelect');
    
    if (result === 'win') {
        winBtn.classList.add('active');
        lossBtn.classList.remove('active');
        hiddenInput.value = 'win';
    } else {
        lossBtn.classList.add('active');
        winBtn.classList.remove('active');
        hiddenInput.value = 'loss';
    }
}

// K/D Ratio Calculator
function updateKDRatio() {
    const kills = parseInt(document.getElementById('killsInput').value) || 0;
    const deaths = parseInt(document.getElementById('deathsInput').value) || 0;
    const kdDisplay = document.getElementById('kdValue');
    
    if (deaths === 0) {
        kdDisplay.textContent = kills.toFixed(2);
    } else {
        const kd = (kills / deaths).toFixed(2);
        kdDisplay.textContent = kd;
    }
    
    // Color coding based on K/D
    if ((kills / (deaths || 1)) >= 2.0) {
        kdDisplay.style.color = '#FFD700'; // Gold
    } else if ((kills / (deaths || 1)) >= 1.0) {
        kdDisplay.style.color = '#00FF00'; // Green
    } else {
        kdDisplay.style.color = '#FF6600'; // Orange
    }
}

// Reset form
function resetForm() {
    document.getElementById('matchReportForm').reset();
    document.getElementById('resultWin').classList.remove('active');
    document.getElementById('resultLoss').classList.remove('active');
    document.getElementById('kdValue').textContent = '0.00';
    document.getElementById('filePreview').innerHTML = '';
}

// Close confirmation modal
function closeConfirmation() {
    const confirmationCard = document.getElementById('matchConfirmation');
    confirmationCard.style.display = 'none';
}

// Show confirmation with details
function showMatchConfirmation(matchDetails) {
    const confirmationCard = document.getElementById('matchConfirmation');
    const detailsDiv = document.getElementById('confirmationDetails');
    const mmrDiv = document.getElementById('mmrUpdateDisplay');
    
    // Build details HTML
    detailsDiv.innerHTML = `
        <div style='display:flex; justify-content:space-between; margin-bottom:8px;'>
            <span style='color:#FF6600;'>Adversário:</span>
            <span style='color:#FFF;'>${matchDetails.opponent}</span>
        </div>
        <div style='display:flex; justify-content:space-between; margin-bottom:8px;'>
            <span style='color:#FF6600;'>Mapa:</span>
            <span style='color:#FFF;'>${matchDetails.map}</span>
        </div>
        <div style='display:flex; justify-content:space-between; margin-bottom:8px;'>
            <span style='color:#FF6600;'>Modo:</span>
            <span style='color:#FFF;'>${matchDetails.mode}</span>
        </div>
        <div style='display:flex; justify-content:space-between;'>
            <span style='color:#FF6600;'>K/D:</span>
            <span style='color:#FFD700; font-weight:700;'>${matchDetails.kills}/${matchDetails.deaths}</span>
        </div>
    `;
    
    // Show MMR update if confirmed
    if (matchDetails.mmrChange) {
        mmrDiv.innerHTML = `
            <div style='font-size:0.9rem; color:#FF6600;'>MMR:</div>
            <div style='font-family:Orbitron; font-size:1.5rem; color:#FFD700;'>
                +${matchDetails.mmrChange}
            </div>
        `;
    } else {
        mmrDiv.innerHTML = `
            <div style='font-size:0.9rem; color:#FF6600; text-align:center;'>
                Aguardando confirmação do adversário para atualizar MMR
            </div>
        `;
    }
    
    confirmationCard.style.display = 'block';
}

// Load recent submissions for display
function loadRecentSubmissions() {
    const currentUser = RankedData.currentUser;
    if (!currentUser) return;
    
    const recentMatches = RankedData.matches
        .filter(m => m.playerA === currentUser || m.playerB === currentUser)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);
    
    if (recentMatches.length === 0) {
        document.getElementById('recentSubmissionsSection').style.display = 'none';
        return;
    }
    
    const gridDiv = document.getElementById('recentMatchesGrid');
    gridDiv.innerHTML = recentMatches.map(match => {
        const isWin = match.winner === currentUser;
        const opponent = match.playerA === currentUser ? match.playerB : match.playerA;
        const statusColor = match.confirmed ? '#00FF00' : '#FFD700';
        const statusText = match.confirmed ? '✅ CONFIRMADO' : '⏳ PENDENTE';
        
        return `
            <div class="recent-match-card">
                <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                    <span style="color:${isWin ? '#00FF00' : '#FF3333'}; font-weight:700;">
                        ${isWin ? '✅ VITÓRIA' : '❌ DERROTA'}
                    </span>
                    <span style="color:${statusColor}; font-size:0.8rem;">
                        ${statusText}
                    </span>
                </div>
                <div style="color:#FFF; margin-bottom:8px;">
                    vs <strong>${opponent}</strong>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#888;">
                    <span>${match.map}</span>
                    <span>${match.mode}</span>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('recentSubmissionsSection').style.display = 'block';
}

// Initialize page events
document.addEventListener('DOMContentLoaded', function() {
    // K/D live update
    const killsInput = document.getElementById('killsInput');
    const deathsInput = document.getElementById('deathsInput');
    
    if (killsInput) {
        killsInput.addEventListener('input', updateKDRatio);
    }
    if (deathsInput) {
        deathsInput.addEventListener('input', updateKDRatio);
    }
    
    // Screenshot preview
    const screenshotInput = document.getElementById('screenshotInput');
    if (screenshotInput) {
        screenshotInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            const preview = document.getElementById('filePreview');
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    preview.innerHTML = `
                        <div style='text-align:center;'>
                            <img src='${event.target.result}' style='max-width:100%; border-radius:4px;' alt='Screenshot Preview'>
                            <div style='margin-top:8px; color:#00FF00; font-size:0.9rem;'>
                                ✅ Screenshot carregado
                            </div>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Load recent submissions when navigating to play page
    const playPage = document.getElementById('play');
    if (playPage) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target.classList.contains('active')) {
                    loadRecentSubmissions();
                }
            });
        });
        observer.observe(playPage, { attributes: true, attributeFilter: ['class'] });
    }
});
