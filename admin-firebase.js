// Admin Panel JavaScript - Firebase Integration
import { 
    loginUser, 
    logoutUser, 
    getAllUsers, 
    getPendingUsers, 
    updateUserRole, 
    deleteUser as firebaseDeleteUser, 
    createPost, 
    getAllPosts, 
    deletePost as firebaseDeletePost, 
    onAuthChange,
    uploadImage,
    getCurrentUser
} from './firebase-service.js';

// Estado da aplicação
let isLoggedIn = false;
let posts = [];
let users = [];
let currentUser = null;

// Elementos DOM
const loginPage = document.getElementById('login-page');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const postForm = document.getElementById('post-form');
const postType = document.getElementById('post-type');
const imageField = document.getElementById('image-field');
const videoField = document.getElementById('video-field');

// Verificar autenticação ao carregar
onAuthChange(async (user) => {
    if (user) {
        try {
            // Aguardar um pouco para o token se propagar
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Usuário logado
            const userData = await getCurrentUser();
            if (userData && userData.role !== 'pending' && userData.approved) {
                currentUser = userData;
                isLoggedIn = true;
                showAdminPanel();
                await loadPosts();
                if (currentUser.role === 'admin') {
                    await loadUsers();
                }
            } else if (userData) {
                // Usuário pendente ou não aprovado
                await handleLogout();
                showAlert('login-alert', '⏳ Sua conta ainda não foi aprovada. Aguarde a aprovação de um administrador.', 'error');
            }
        } catch (error) {
            console.error('Erro ao verificar usuário:', error);
            // Não fazer nada, deixar na tela de login
        }
    } else {
        // Usuário não logado
        isLoggedIn = false;
        currentUser = null;
    }
});

// Event Listeners
loginForm?.addEventListener('submit', handleLogin);
logoutBtn?.addEventListener('click', handleLogout);
postForm?.addEventListener('submit', handlePostSubmit);
postType?.addEventListener('change', handleMediaTypeChange);

// Tabs
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        switchTab(tabName);
    });
});

// Settings
document.getElementById('export-btn')?.addEventListener('click', exportPosts);
document.getElementById('import-btn')?.addEventListener('click', () => {
    document.getElementById('import-file').click();
});
document.getElementById('import-file')?.addEventListener('change', importPosts);

// ===== AUTENTICAÇÃO =====

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('username').value; // Campo aceita email agora
    const password = document.getElementById('password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = '🔄 Entrando...';
    
    try {
        const result = await loginUser(email, password);
        
        if (result.success) {
            // Aguardar um pouco para o token se propagar
            await new Promise(resolve => setTimeout(resolve, 500));
            
            currentUser = result.userData;
            
            console.log('Dados do usuário:', currentUser); // DEBUG
            
            // Verificar se está aprovado
            if (currentUser.role === 'pending' || !currentUser.approved) {
                await logoutUser();
                showAlert('login-alert', '⏳ Sua conta ainda não foi aprovada. Aguarde a aprovação de um administrador.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }
            
            isLoggedIn = true;
            showAdminPanel();
            await loadPosts();
            if (currentUser.role === 'admin') {
                await loadUsers();
            }
        } else {
            showAlert('login-alert', `❌ ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showAlert('login-alert', '❌ Erro ao fazer login. Tente novamente.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function handleLogout() {
    await logoutUser();
    isLoggedIn = false;
    currentUser = null;
    posts = [];
    users = [];
    loginPage.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    loginForm.reset();
}

function showAdminPanel() {
    loginPage.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    
    // Mostrar informações do usuário
    if (currentUser) {
        const userInfo = document.getElementById('user-info');
        let roleLabel = '✏️ Editor';
        if (currentUser.role === 'admin') roleLabel = '👑 Administrador';
        if (currentUser.role === 'viewer') roleLabel = '👁️ Leitor';
        userInfo.textContent = `Logado como: ${currentUser.name} (@${currentUser.username}) • ${roleLabel}`;
        
        // Controlar visibilidade das abas baseado na função
        const createTab = document.querySelector('[data-tab="create"]');
        const manageTab = document.querySelector('[data-tab="manage"]');
        const usersTab = document.querySelector('[data-tab="users"]');
        const settingsTab = document.querySelector('[data-tab="settings"]');
        
        if (currentUser.role === 'viewer') {
            // Leitores só veem posts
            if (createTab) createTab.style.display = 'none';
            if (manageTab) manageTab.click(); // Ir para aba de visualizar
            if (usersTab) usersTab.style.display = 'none';
            if (settingsTab) settingsTab.style.display = 'none';
        } else if (currentUser.role === 'editor') {
            // Editores não veem usuários
            if (createTab) createTab.style.display = 'block';
            if (manageTab) manageTab.style.display = 'block';
            if (usersTab) usersTab.style.display = 'none';
            if (settingsTab) settingsTab.style.display = 'block';
        } else {
            // Admins veem tudo
            if (createTab) createTab.style.display = 'block';
            if (manageTab) manageTab.style.display = 'block';
            if (usersTab) usersTab.style.display = 'block';
            if (settingsTab) settingsTab.style.display = 'block';
        }
    }

    // Preencher preview do autor no formulário de criação de posts
    const authorPreview = document.getElementById('post-author');
    const authorIdField = document.getElementById('post-author-id');
    const authorUsernameField = document.getElementById('post-author-username');
    if (authorPreview) authorPreview.value = currentUser.name || currentUser.email || '';
    if (authorIdField) authorIdField.value = currentUser.id || '';
    if (authorUsernameField) authorUsernameField.value = currentUser.username || '';
}

// ===== POSTS =====

async function loadPosts() {
    try {
        const result = await getAllPosts();
        if (result.success) {
            posts = result.posts;
            renderPostsList();
        }
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
    }
}

async function handlePostSubmit(e) {
    e.preventDefault();
    
    // Verificar permissões
    if (!currentUser || (currentUser.role !== 'editor' && currentUser.role !== 'admin')) {
        showAlert('form-alert', '❌ Você não tem permissão para criar posts!', 'error');
        setTimeout(() => {
            document.getElementById('form-alert').innerHTML = '';
        }, 3000);
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '🔄 Publicando...';
    
    try {
        const formData = new FormData(postForm);
        const type = formData.get('type');
        
        const postData = {
            title: formData.get('title'),
            content: formData.get('content'),
            type: type
        };

        // Anexar dados do autor quando disponível
        if (currentUser) {
            postData.authorId = currentUser.id || currentUser.uid || null;
            postData.authorUsername = currentUser.username || '';
            postData.author = postData.author || currentUser.name || currentUser.email || '';
        }
        
        // Upload de imagem se tipo for image
        if (type === 'image') {
            const imageFileInput = document.getElementById('image-file');
            if (imageFileInput && imageFileInput.files[0]) {
                submitBtn.textContent = '📤 Enviando imagem...';
                const uploadResult = await uploadImage(imageFileInput.files[0], 'posts');
                if (uploadResult.success) {
                    postData.image = uploadResult.url;
                } else {
                    throw new Error('Erro ao fazer upload da imagem');
                }
            } else {
                // Usar URL de imagem se fornecida
                const imageUrl = formData.get('image');
                if (imageUrl) {
                    postData.image = imageUrl;
                } else {
                    postData.image = 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80';
                }
            }
        } else if (type === 'video') {
            postData.videoId = formData.get('videoId');
        }
        
        submitBtn.textContent = '💾 Salvando...';
        const result = await createPost(postData);
        
        if (result.success) {
            showAlert('form-alert', '✅ Postagem publicada com sucesso!', 'success');
            postForm.reset();
            await loadPosts(); // Recarregar posts
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Erro ao criar post:', error);
        showAlert('form-alert', `❌ Erro ao publicar: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        setTimeout(() => {
            document.getElementById('form-alert').innerHTML = '';
        }, 3000);
    }
}

function renderPostsList() {
    const postsList = document.getElementById('posts-list');
    
    if (posts.length === 0) {
        postsList.innerHTML = '<p style="text-align: center; color: var(--text-light);">Nenhuma postagem ainda. Crie sua primeira postagem!</p>';
        return;
    }
    
    postsList.innerHTML = posts.map(post => `
        <div class="post-item">
            <div class="post-info">
                <h3>${post.title}</h3>
                <p>Por ${post.authorUsername ? `<a href="user.html?username=${encodeURIComponent(post.authorUsername)}" target="_blank">${post.author || post.authorUsername}</a>` : (post.authorId ? `<a href="user.html?id=${post.authorId}" target="_blank">${post.author || 'Anônimo'}</a>` : post.author || 'Anônimo')} • ${new Date(post.date || post.createdAt).toLocaleDateString('pt-BR')} • ${post.type === 'image' ? '📷 Imagem' : '🎥 Vídeo'}</p>
            </div>
            <div class="post-actions">
                <button class="btn-delete" onclick="handleDeletePost('${post.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `).join('');
}

// Tornar função global para onclick
window.handleDeletePost = async function(id) {
    if (!confirm('Tem certeza que deseja excluir esta postagem?')) {
        return;
    }
    
    try {
        const result = await firebaseDeletePost(id);
        if (result.success) {
            showAlert('form-alert', '✅ Postagem excluída com sucesso!', 'success');
            await loadPosts();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Erro ao excluir post:', error);
        showAlert('form-alert', `❌ Erro ao excluir: ${error.message}`, 'error');
    }
    
    setTimeout(() => {
        document.getElementById('form-alert').innerHTML = '';
    }, 3000);
};

function handleMediaTypeChange() {
    const type = postType.value;
    
    if (type === 'image') {
        imageField.classList.add('active');
        videoField.classList.remove('active');
        document.getElementById('post-video')?.removeAttribute('required');
    } else {
        videoField.classList.add('active');
        imageField.classList.remove('active');
        document.getElementById('post-image')?.removeAttribute('required');
    }
}

// ===== USUÁRIOS =====

async function loadUsers() {
    try {
        const result = await getAllUsers();
        if (result.success) {
            users = result.users;
            renderUsersList();
            await renderPendingUsers();
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

function renderUsersList() {
    const usersList = document.getElementById('users-list');
    
    // Filtrar apenas usuários aprovados
    const approvedUsers = users.filter(u => u.role !== 'pending' && u.approved !== false);
    
    if (approvedUsers.length === 0) {
        usersList.innerHTML = '<p style="text-align: center; color: var(--text-light);">Nenhum usuário cadastrado.</p>';
        return;
    }
    
    usersList.innerHTML = approvedUsers.map(user => {
        const isCurrentUser = currentUser && currentUser.email === user.email;
        const canDelete = currentUser && currentUser.role === 'admin' && !isCurrentUser;
        let roleLabel = '✏️ Editor';
        if (user.role === 'admin') roleLabel = '👑 Administrador';
        if (user.role === 'viewer') roleLabel = '👁️ Leitor';
        
        return `
            <div class="post-item">
                <div class="post-info">
                    <h3>${user.name} ${isCurrentUser ? '(Você)' : ''}</h3>
                    <p>@${user.username} • ${roleLabel} • Criado em ${new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
                    <p style="font-size: 0.85rem; color: var(--text-light);">📧 ${user.email}</p>
                </div>
                <div class="post-actions">
                    ${canDelete ? `<button class="btn-delete" onclick="handleDeleteUser('${user.id}')">🗑️ Excluir</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

async function renderPendingUsers() {
    const pendingList = document.getElementById('pending-users-list');
    const pendingSection = document.getElementById('pending-users-section');
    
    if (!currentUser || currentUser.role !== 'admin') {
        pendingSection.style.display = 'none';
        return;
    }
    
    pendingSection.style.display = 'block';
    
    try {
        // Buscar usuários pendentes do Firebase
        const result = await getPendingUsers();
        if (!result.success) {
            throw new Error(result.error);
        }
        
        const pendingUsers = result.users;
        
        if (pendingUsers.length === 0) {
            pendingList.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 1rem;">Nenhum usuário aguardando aprovação.</p>';
            return;
        }
        
        pendingList.innerHTML = pendingUsers.map(user => {
            return `
                <div class="post-item" style="background: #fff8e1; border-left: 4px solid #ffa726;">
                    <div class="post-info">
                        <h3>${user.name}</h3>
                        <p>@${user.username} • ⏳ Aguardando aprovação</p>
                        <p style="font-size: 0.85rem; color: var(--text-light);">📧 ${user.email}</p>
                        <p style="font-size: 0.85rem; color: var(--text-light);">📅 Solicitado em ${new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div class="post-actions" style="display: flex; gap: 0.5rem; flex-direction: column;">
                        <select id="role-${user.id}" style="padding: 0.5rem; border-radius: 5px; border: 2px solid #e0e0e0;">
                            <option value="viewer">👁️ Leitor</option>
                            <option value="editor" selected>✏️ Editor</option>
                            <option value="admin">👑 Administrador</option>
                        </select>
                        <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="handleApproveUser('${user.id}')">✅ Aprovar</button>
                        <button class="btn-delete" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="handleRejectUser('${user.id}')">❌ Rejeitar</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Erro ao carregar usuários pendentes:', error);
        pendingList.innerHTML = '<p style="text-align: center; color: var(--error); padding: 1rem;">Erro ao carregar usuários pendentes.</p>';
    }
}

// Tornar funções globais
window.handleDeleteUser = async function(id) {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Apenas administradores podem excluir usuários!');
        return;
    }
    
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    if (user.email === currentUser.email) {
        alert('Você não pode excluir seu próprio usuário!');
        return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o usuário "${user.name}" (@${user.username})?`)) {
        try {
            const result = await firebaseDeleteUser(id);
            if (result.success) {
                showAlert('users-alert', '✅ Usuário excluído com sucesso!', 'success');
                await loadUsers();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            showAlert('users-alert', `❌ Erro ao excluir: ${error.message}`, 'error');
        }
        
        setTimeout(() => {
            document.getElementById('users-alert').innerHTML = '';
        }, 3000);
    }
};

window.handleApproveUser = async function(id) {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Apenas administradores podem aprovar usuários!');
        return;
    }
    
    const pendingResult = await getPendingUsers();
    const user = pendingResult.users.find(u => u.id === id);
    if (!user) return;
    
    const selectedRole = document.getElementById(`role-${id}`).value;
    
    if (confirm(`Aprovar "${user.name}" (@${user.username}) como ${selectedRole === 'admin' ? 'Administrador' : selectedRole === 'editor' ? 'Editor' : 'Leitor'}?`)) {
        try {
            const result = await updateUserRole(id, selectedRole, true);
            if (result.success) {
                showAlert('users-alert', `✅ Usuário "${user.name}" aprovado com sucesso!`, 'success');
                await loadUsers();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erro ao aprovar usuário:', error);
            showAlert('users-alert', `❌ Erro ao aprovar: ${error.message}`, 'error');
        }
        
        setTimeout(() => {
            document.getElementById('users-alert').innerHTML = '';
        }, 3000);
    }
};

window.handleRejectUser = async function(id) {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Apenas administradores podem rejeitar usuários!');
        return;
    }
    
    const pendingResult = await getPendingUsers();
    const user = pendingResult.users.find(u => u.id === id);
    if (!user) return;
    
    if (confirm(`Rejeitar e excluir a solicitação de "${user.name}" (@${user.username})?`)) {
        try {
            const result = await firebaseDeleteUser(id);
            if (result.success) {
                showAlert('users-alert', `Solicitação de "${user.name}" foi rejeitada e excluída.`, 'success');
                await loadUsers();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Erro ao rejeitar usuário:', error);
            showAlert('users-alert', `❌ Erro ao rejeitar: ${error.message}`, 'error');
        }
        
        setTimeout(() => {
            document.getElementById('users-alert').innerHTML = '';
        }, 3000);
    }
};

// ===== CONFIGURAÇÕES =====

function exportPosts() {
    const dataStr = JSON.stringify({ posts: posts }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pibno_posts_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showAlert('settings-alert', '✅ Posts exportados com sucesso!', 'success');
    setTimeout(() => {
        document.getElementById('settings-alert').innerHTML = '';
    }, 3000);
}

async function importPosts(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(event) {
        try {
            const data = JSON.parse(event.target.result);
            if (data.posts && Array.isArray(data.posts)) {
                // Importar posts para o Firebase
                let imported = 0;
                for (const post of data.posts) {
                    const result = await createPost({
                        title: post.title,
                        author: post.author,
                        content: post.content,
                        type: post.type,
                        image: post.image,
                        videoId: post.videoId
                    });
                    if (result.success) imported++;
                }
                
                await loadPosts();
                showAlert('settings-alert', `✅ ${imported} posts importados com sucesso!`, 'success');
            } else {
                showAlert('settings-alert', '❌ Arquivo JSON inválido!', 'error');
            }
        } catch (error) {
            console.error('Erro ao importar:', error);
            showAlert('settings-alert', '❌ Erro ao ler o arquivo!', 'error');
        }
        
        setTimeout(() => {
            document.getElementById('settings-alert').innerHTML = '';
        }, 3000);
    };
    reader.readAsText(file);
}

// ===== AUXILIARES =====

function switchTab(tabName) {
    // Atualizar botões
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Atualizar conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
    
    // Recarregar listas
    if (tabName === 'manage') {
        renderPostsList();
    } else if (tabName === 'users') {
        renderUsersList();
        renderPendingUsers();
    }
}

function showAlert(elementId, message, type) {
    const alertDiv = document.getElementById(elementId);
    if (alertDiv) {
        alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    }
}
