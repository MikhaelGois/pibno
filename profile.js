import { getCurrentUser, getUserData, uploadImage, updateUserProfile, logoutUser, onAuthChange } from './firebase-service.js';

let currentUser = null;
let selectedAvatarFile = null;

document.addEventListener('DOMContentLoaded', () => {
    // Aguardar alteração de autenticação para carregar o perfil
    const unsubscribe = onAuthChange(async (authUser) => {
        if (!authUser) {
            // Se não estiver autenticado, redirecionar
            window.location.href = 'index.html';
            return;
        }

        // Buscar dados do documento do usuário
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }

        currentUser = user;

        // Preencher UI com dados do usuário
        document.getElementById('name').value = user.name || '';
        document.getElementById('username').value = user.username || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('memberType').value = user.memberType || '';
        document.getElementById('bio').value = user.bio || '';

        // feed threshold removed: fixed default 300px for all users

        if (user.avatarUrl) {
            document.getElementById('avatar-img').src = user.avatarUrl;
        }

        // Não precisamos mais do listener após carregar
        if (typeof unsubscribe === 'function') unsubscribe();
    });

    document.getElementById('avatar-input').addEventListener('change', handleAvatarChange);
    document.getElementById('save-btn').addEventListener('click', handleSave);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
});

function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Simple client-side limit (2.5MB)
    if (file.size > 2.5 * 1024 * 1024) {
        showAlert('Arquivo muito grande. Use até 2.5MB.', 'error');
        e.target.value = '';
        return;
    }

    selectedAvatarFile = file;
    const reader = new FileReader();
    reader.onload = () => {
        document.getElementById('avatar-img').src = reader.result;
    };
    reader.readAsDataURL(file);
}

async function handleSave() {
    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Salvando...';

    try {
        const name = document.getElementById('name').value.trim();
        const bio = document.getElementById('bio').value.trim();

        const updates = { name, bio };

        if (selectedAvatarFile && currentUser && currentUser.id) {
            const uploadResult = await uploadImage(selectedAvatarFile, `avatars/${currentUser.id}`);
            if (uploadResult.success) {
                updates.avatarUrl = uploadResult.url;
            } else {
                showAlert('Falha ao enviar avatar: ' + uploadResult.error, 'error');
            }
        }

        const result = await updateUserProfile(currentUser.id, updates);
        if (result.success) {
            showAlert('Perfil atualizado com sucesso!', 'success');
            // Atualizar currentUser
            Object.assign(currentUser, updates);
            selectedAvatarFile = null;
        } else {
            showAlert('Erro ao atualizar perfil: ' + result.error, 'error');
        }
    } catch (error) {
        console.error(error);
        showAlert('Erro inesperado ao salvar.', 'error');
    }

    saveBtn.disabled = false;
    saveBtn.textContent = originalText;
}

async function handleLogout() {
    // Se houver alterações não salvas, pedir confirmação para salvar antes de sair
    try {
        if (hasUnsavedChanges()) {
            const shouldSave = await showConfirm('Você tem alterações não salvas. Deseja salvar antes de sair?');
            if (shouldSave) {
                await handleSave();
                await logoutUser();
                window.location.href = 'index.html';
                return;
            } else {
                // Usuário escolheu permanecer na página
                return;
            }
        }
    } catch (e) {
        console.error('Erro ao verificar alterações não salvas:', e);
    }

    await logoutUser();
    window.location.href = 'index.html';
}

function hasUnsavedChanges() {
    if (!currentUser) return false;
    const name = document.getElementById('name')?.value?.trim() || '';
    const bio = document.getElementById('bio')?.value?.trim() || '';
    // Se selecionou um novo avatar, há alterações
    if (selectedAvatarFile) return true;
    if (name !== (currentUser.name || '')) return true;
    if (bio !== (currentUser.bio || '')) return true;
    return false;
}

function showAlert(message, type = 'info') {
    const area = document.getElementById('alert-area');
    if (!area) return;
    const isError = type === 'error' || type === 'danger';
    const isSuccess = type === 'success';
    const bg = isError ? '#ffd6d6' : (isSuccess ? '#e6f7ea' : '#eef2ff');
    const border = isError ? '#f5c2c2' : (isSuccess ? '#cfe9d6' : '#cfd8ff');
    const color = isError ? '#7a1f1f' : (isSuccess ? '#0b6623' : '#1b2a6a');
    area.innerHTML = `<div style="padding:0.5rem 0.75rem; margin-top:0.25rem; border-radius:6px; color:${color}; background:${bg}; border:1px solid ${border};">${escapeHtml(String(message))}</div>`;
    const timeout = isError ? 5000 : 3000;
    setTimeout(() => { area.innerHTML = ''; }, timeout);
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Caixa de confirmação personalizada no #alert-area
function showConfirm(message) {
    return new Promise((resolve) => {
        const area = document.getElementById('alert-area');
        if (!area) return resolve(false);
        area.innerHTML = '';

        const box = document.createElement('div');
        box.style.padding = '0.75rem';
        box.style.borderRadius = '8px';
        box.style.background = '#fff8e6';
        box.style.border = '1px solid #f0dca8';
        box.style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)';

        const p = document.createElement('p');
        p.style.margin = '0';
        p.style.color = '#333';
        p.textContent = message;

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '0.5rem';
        actions.style.marginTop = '0.75rem';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn';
        saveBtn.textContent = 'Salvar e sair';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.textContent = 'Cancelar';

        actions.appendChild(saveBtn);
        actions.appendChild(cancelBtn);
        box.appendChild(p);
        box.appendChild(actions);

        area.appendChild(box);

        const clean = () => { area.innerHTML = ''; };

        saveBtn.addEventListener('click', () => { clean(); resolve(true); });
        cancelBtn.addEventListener('click', () => { clean(); resolve(false); });
    });
}
