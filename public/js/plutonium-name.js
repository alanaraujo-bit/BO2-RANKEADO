// BO2 RANKED - PLUTONIUM NAME MANAGEMENT

// Check if user needs to set Plutonium name after login
async function checkPlutoniumNameSetup() {
    if (!RankedData.currentUser) return;
    
    try {
        const playerData = await RankedData.getPlayer(RankedData.currentUser);
        if (!playerData || !playerData.plutoniumName) {
            // Show modal to set Plutonium name
            showPlutoniumNameModal();
        }
    } catch (error) {
        console.error('Error checking Plutonium name:', error);
    }
}

// Show modal to set Plutonium name (first time)
function showPlutoniumNameModal() {
    const modal = document.getElementById('plutoniumNameModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('plutoniumNameInput').value = '';
        document.getElementById('plutoniumNameInput').focus();
    }
}

// Save Plutonium name (first time setup)
async function savePlutoniumName(event) {
    event.preventDefault();
    
    const input = document.getElementById('plutoniumNameInput');
    const plutoniumName = input.value.trim();
    
    if (!plutoniumName || plutoniumName.length < 2) {
        alert('❌ Por favor, digite um nome válido (mínimo 2 caracteres)');
        return;
    }
    
    if (!RankedData.currentUser) {
        alert('❌ Você precisa estar logado');
        return;
    }
    
    try {
        // Update player data with Plutonium name
        await RankedData.updatePlayerPartial(RankedData.currentUser, {
            plutoniumName: plutoniumName,
            plutoniumNameUpdatedAt: Date.now()
        });
        
        console.log(`✅ Plutonium name saved: ${plutoniumName}`);
        
        // Close modal
        document.getElementById('plutoniumNameModal').style.display = 'none';
        
        // Show success message
        alert(`✅ Nome do Plutonium configurado: ${plutoniumName}\n\nAgora suas estatísticas serão registradas automaticamente quando você jogar!`);
        
        // Update profile page if visible
        if (UI && typeof UI.updateProfileView === 'function') {
            await UI.updateProfileView();
        }
    } catch (error) {
        console.error('Error saving Plutonium name:', error);
        alert('❌ Erro ao salvar nome do Plutonium. Tente novamente.');
    }
}

// Update profile page with Plutonium name status
function updateProfilePlutoniumSection() {
    if (!RankedData.currentUser) return;
    
    RankedData.getPlayer(RankedData.currentUser).then(playerData => {
        const displayDiv = document.getElementById('plutoniumNameDisplay');
        const editDiv = document.getElementById('plutoniumNameEdit');
        const notSetDiv = document.getElementById('plutoniumNameNotSet');
        const currentNameSpan = document.getElementById('currentPlutoniumName');
        
        if (!displayDiv || !editDiv || !notSetDiv || !currentNameSpan) return;
        
        if (playerData && playerData.plutoniumName) {
            // Show current name
            currentNameSpan.textContent = playerData.plutoniumName;
            displayDiv.style.display = 'block';
            editDiv.style.display = 'none';
            notSetDiv.style.display = 'none';
        } else {
            // Show "not set" warning
            displayDiv.style.display = 'none';
            editDiv.style.display = 'none';
            notSetDiv.style.display = 'block';
        }
    }).catch(error => {
        console.error('Error loading Plutonium name:', error);
    });
}

// Show edit form in profile page
function showEditPlutoniumName() {
    const displayDiv = document.getElementById('plutoniumNameDisplay');
    const editDiv = document.getElementById('plutoniumNameEdit');
    const notSetDiv = document.getElementById('plutoniumNameNotSet');
    const input = document.getElementById('editPlutoniumNameInput');
    const currentNameSpan = document.getElementById('currentPlutoniumName');
    
    if (!editDiv || !input) return;
    
    // Set current value
    if (currentNameSpan && currentNameSpan.textContent !== '-') {
        input.value = currentNameSpan.textContent;
    } else {
        input.value = '';
    }
    
    // Show edit form
    if (displayDiv) displayDiv.style.display = 'none';
    if (notSetDiv) notSetDiv.style.display = 'none';
    editDiv.style.display = 'block';
    input.focus();
}

// Cancel editing
function cancelEditPlutoniumName() {
    updateProfilePlutoniumSection();
}

// Update Plutonium name from profile page
async function updatePlutoniumName(event) {
    event.preventDefault();
    
    const input = document.getElementById('editPlutoniumNameInput');
    const plutoniumName = input.value.trim();
    
    if (!plutoniumName || plutoniumName.length < 2) {
        alert('❌ Por favor, digite um nome válido (mínimo 2 caracteres)');
        return;
    }
    
    if (!RankedData.currentUser) {
        alert('❌ Você precisa estar logado');
        return;
    }
    
    try {
        // Update player data with Plutonium name
        await RankedData.updatePlayerPartial(RankedData.currentUser, {
            plutoniumName: plutoniumName,
            plutoniumNameUpdatedAt: Date.now()
        });
        
        console.log(`✅ Plutonium name updated: ${plutoniumName}`);
        
        // Show success message
        alert(`✅ Nome do Plutonium atualizado: ${plutoniumName}`);
        
        // Update display
        updateProfilePlutoniumSection();
    } catch (error) {
        console.error('Error updating Plutonium name:', error);
        alert('❌ Erro ao atualizar nome do Plutonium. Tente novamente.');
    }
}

// Export functions to global scope
window.savePlutoniumName = savePlutoniumName;
window.updatePlutoniumName = updatePlutoniumName;
window.showEditPlutoniumName = showEditPlutoniumName;
window.cancelEditPlutoniumName = cancelEditPlutoniumName;
window.checkPlutoniumNameSetup = checkPlutoniumNameSetup;
window.updateProfilePlutoniumSection = updateProfilePlutoniumSection;

console.log('✅ plutonium-name.js loaded');
