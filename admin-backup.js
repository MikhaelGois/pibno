// Admin Panel JavaScript - Firebase Integration
import { 
    loginUser, 
    logoutUser, 
    getAllUsers, 
    getPendingUsers, 
    updateUserRole, 
    deleteUser, 
    createPost, 
    getAllPosts, 
    deletePost, 
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
        } else {
            // Usuário pendente ou não aprovado
            await handleLogout();
            showAlert('login-alert', '⏳ Sua conta ainda não foi aprovada. Aguarde a aprovação de um administrador.', 'error');
        }
    } else {
        // Usuário não logado
        isLoggedIn = false;
        currentUser = null;
    }
});

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
logoutBtn.addEventListener('click', handleLogout);
postForm.addEventListener('submit', handlePostSubmit);
postType.addEventListener('change', handleMediaTypeChange);

// Reset System Button
document.getElementById('reset-system-btn').addEventListener('click', resetSystem);

// Tabs
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        switchTab(tabName);
    });
});

// Settings
document.getElementById('settings-form').addEventListener('submit', handlePasswordChange);
document.getElementById('export-btn').addEventListener('click', exportPosts);
document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
});
document.getElementById('import-file').addEventListener('change', importPosts);

// Users
document.getElementById('create-user-form')?.addEventListener('submit', handleCreateUser);

// Funções de Autenticação
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('username').value; // Agora aceita email
    const password = document.getElementById('password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = '🔄 Entrando...';
    
    try {
        const result = await loginUser(email, password);
        
        if (result.success) {
            currentUser = result.userData;
            
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
    localStorage.clear(); // Limpar qualquer dado local
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
}

// Funções de Posts
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
            author: formData.get('author'),
            content: formData.get('content'),
            type: type
        };
        
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
                <p>Por ${post.author} • ${new Date(post.date || post.createdAt).toLocaleDateString('pt-BR')} • ${post.type === 'image' ? '📷 Imagem' : '🎥 Vídeo'}</p>
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
        const result = await deletePost(id);
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
        document.getElementById('post-video').removeAttribute('required');
    } else {
        videoField.classList.add('active');
        imageField.classList.remove('active');
        document.getElementById('post-image').removeAttribute('required');
    }
}

// Funções de Configurações
function handlePasswordChange(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!newPassword || !confirmPassword) {
        showAlert('settings-alert', 'Preencha todos os campos!', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAlert('settings-alert', 'As senhas não coincidem!', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showAlert('settings-alert', 'A senha deve ter pelo menos 6 caracteres!', 'error');
        return;
    }
    
    localStorage.setItem('pibno_admin_password', newPassword);
    showAlert('settings-alert', 'Senha atualizada com sucesso!', 'success');
    
    document.getElementById('settings-form').reset();
    
    setTimeout(() => {
        document.getElementById('settings-alert').innerHTML = '';
    }, 3000);
}

function exportPosts() {
    const dataStr = JSON.stringify({ posts: posts }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pibno_posts_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showAlert('settings-alert', 'Posts exportados com sucesso!', 'success');
    setTimeout(() => {
        document.getElementById('settings-alert').innerHTML = '';
    }, 3000);
}

function importPosts(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            if (data.posts && Array.isArray(data.posts)) {
                posts = data.posts;
                savePosts();
                renderPostsList();
                showAlert('settings-alert', `${posts.length} posts importados com sucesso!`, 'success');
            } else {
                showAlert('settings-alert', 'Arquivo JSON inválido!', 'error');
            }
        } catch (error) {
            showAlert('settings-alert', 'Erro ao ler o arquivo!', 'error');
        }
        
        setTimeout(() => {
            document.getElementById('settings-alert').innerHTML = '';
        }, 3000);
    };
    reader.readAsText(file);
}

// Funções Auxiliares
function switchTab(tabName) {
    // Atualizar botões
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Atualizar conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Recarregar lista de posts se for a aba de gerenciar
    if (tabName === 'manage') {
        renderPostsList();
    }
}

function showAlert(elementId, message, type) {
    const alertDiv = document.getElementById(elementId);
    alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
}

function updatePostsJSON() {
    // Esta função seria usada em um ambiente com backend
    // Para ambiente estático, os posts ficam no localStorage
    // e são carregados diretamente pelo script.js principal
    console.log('Posts atualizados:', posts);
}

// Tornar funções globais para uso no HTML
window.deletePost = deletePost;

// ===== SISTEMA DE USUÁRIOS =====

function initializeUsers() {
    const storedUsers = localStorage.getItem('pibno_users');
    
    if (!storedUsers) {
        // Criar usuário admin padrão automaticamente
        users = [
            {
                id: 1,
                username: DEFAULT_USERNAME,
                password: DEFAULT_PASSWORD,
                name: 'Administrador',
                role: 'admin',
                createdAt: new Date().toISOString()
            }
        ];
        saveUsers();
        console.log('✅ Usuário admin padrão criado automaticamente');
    } else {
        users = JSON.parse(storedUsers);
        
        // Garantir que sempre existe pelo menos o admin padrão
        const adminExists = users.find(u => u.username === DEFAULT_USERNAME);
        if (!adminExists) {
            users.unshift({
                id: 1,
                username: DEFAULT_USERNAME,
                password: DEFAULT_PASSWORD,
                name: 'Administrador',
                role: 'admin',
                createdAt: new Date().toISOString()
            });
            saveUsers();
            console.log('✅ Usuário admin padrão restaurado');
        }
    }
}

function saveUsers() {
    localStorage.setItem('pibno_users', JSON.stringify(users));
}

function loadUsers() {
    const storedUsers = localStorage.getItem('pibno_users');
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    }
    renderUsersList();
    renderPendingUsers();
}

function authenticateUser(username, password) {
    return users.find(user => user.username === username && user.password === password);
}

function getUserByUsername(username) {
    return users.find(user => user.username === username);
}

function handleCreateUser(e) {
    e.preventDefault();
    
    if (!currentUser || currentUser.role !== 'admin') {
        showAlert('users-alert', 'Apenas administradores podem criar usuários!', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const username = formData.get('username').trim().toLowerCase();
    const password = formData.get('password');
    const name = formData.get('name').trim();
    const role = formData.get('role');
    
    // Validações
    if (username.includes(' ')) {
        showAlert('users-alert', 'O nome de usuário não pode conter espaços!', 'error');
        return;
    }
    
    if (username.length < 3) {
        showAlert('users-alert', 'O nome de usuário deve ter pelo menos 3 caracteres!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('users-alert', 'A senha deve ter pelo menos 6 caracteres!', 'error');
        return;
    }
    
    // Verificar se usuário já existe
    if (users.find(u => u.username === username)) {
        showAlert('users-alert', 'Este nome de usuário já existe!', 'error');
        return;
    }
    
    // Criar novo usuário
    const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        name: name,
        role: role,
        createdAt: new Date().toISOString(),
        approved: true,
        email: ''
    };
    
    users.push(newUser);
    saveUsers();
    renderUsersList();
    renderPendingUsers();
    
    showAlert('users-alert', `Usuário "${username}" criado com sucesso!`, 'success');
    document.getElementById('create-user-form').reset();
    
    setTimeout(() => {
        document.getElementById('users-alert').innerHTML = '';
    }, 3000);
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
        const isCurrentUser = currentUser && currentUser.username === user.username;
        const canDelete = currentUser && currentUser.role === 'admin' && !isCurrentUser && user.username !== DEFAULT_USERNAME;
        let roleLabel = '✏️ Editor';
        if (user.role === 'admin') roleLabel = '👑 Administrador';
        if (user.role === 'viewer') roleLabel = '👁️ Leitor';
        
        return `
            <div class="post-item">
                <div class="post-info">
                    <h3>${user.name} ${isCurrentUser ? '(Você)' : ''}</h3>
                    <p>@${user.username} • ${roleLabel} • Criado em ${formatDate(user.createdAt.split('T')[0])}</p>
                    ${user.email ? `<p style="font-size: 0.85rem; color: var(--text-light);">📧 ${user.email}</p>` : ''}
                </div>
                <div class="post-actions">
                    ${canDelete ? `<button class="btn-delete" onclick="deleteUser(${user.id})">🗑️ Excluir</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function renderPendingUsers() {
    const pendingList = document.getElementById('pending-users-list');
    const pendingSection = document.getElementById('pending-users-section');
    
    if (!currentUser || currentUser.role !== 'admin') {
        pendingSection.style.display = 'none';
        return;
    }
    
    pendingSection.style.display = 'block';
    
    // Filtrar usuários pendentes
    const pendingUsers = users.filter(u => u.role === 'pending' || u.approved === false);
    
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
                    <p style="font-size: 0.85rem; color: var(--text-light);">📧 ${user.email || 'Não informado'}</p>
                    <p style="font-size: 0.85rem; color: var(--text-light);">📅 Solicitado em ${formatDate(user.createdAt.split('T')[0])}</p>
                </div>
                <div class="post-actions" style="display: flex; gap: 0.5rem; flex-direction: column;">
                    <select id="role-${user.id}" style="padding: 0.5rem; border-radius: 5px; border: 2px solid #e0e0e0;">
                        <option value="viewer">👁️ Leitor</option>
                        <option value="editor" selected>✏️ Editor</option>
                        <option value="admin">👑 Administrador</option>
                    </select>
                    <button class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="approveUser(${user.id})">✅ Aprovar</button>
                    <button class="btn-delete" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="rejectUser(${user.id})">❌ Rejeitar</button>
                </div>
            </div>
        `;
    }).join('');
}

function deleteUser(id) {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Apenas administradores podem excluir usuários!');
        return;
    }
    
    const user = users.find(u => u.id === id);
    
    if (!user) return;
    
    if (user.username === DEFAULT_USERNAME) {
        alert('Não é possível excluir o usuário administrador padrão!');
        return;
    }
    
    if (user.username === currentUser.username) {
        alert('Você não pode excluir seu próprio usuário!');
        return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o usuário "${user.name}" (@${user.username})?`)) {
        users = users.filter(u => u.id !== id);
        saveUsers();
        renderUsersList();
        showAlert('users-alert', 'Usuário excluído com sucesso!', 'success');
        setTimeout(() => {
            document.getElementById('users-alert').innerHTML = '';
        }, 3000);
    }
}

// Atualizar a aba de gerenciar para mostrar tabs corretamente
function switchTab(tabName) {
    // Atualizar botões
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Atualizar conteúdo
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Recarregar lista de posts se for a aba de gerenciar
    if (tabName === 'manage') {
        renderPostsList();
    }
    
    // Recarregar lista de usuários se for a aba de usuários
    if (tabName === 'users') {
        renderUsersList();
        renderPendingUsers();
    }
}

// Aprovar usuário
function approveUser(id) {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Apenas administradores podem aprovar usuários!');
        return;
    }
    
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    const selectedRole = document.getElementById(`role-${id}`).value;
    
    if (confirm(`Aprovar "${user.name}" (@${user.username}) como ${selectedRole === 'admin' ? 'Administrador' : selectedRole === 'editor' ? 'Editor' : 'Leitor'}?`)) {
        user.role = selectedRole;
        user.approved = true;
        saveUsers();
        renderUsersList();
        renderPendingUsers();
        showAlert('users-alert', `✅ Usuário "${user.name}" aprovado com sucesso!`, 'success');
        setTimeout(() => {
            document.getElementById('users-alert').innerHTML = '';
        }, 3000);
    }
}

// Rejeitar usuário
function rejectUser(id) {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Apenas administradores podem rejeitar usuários!');
        return;
    }
    
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    if (confirm(`Rejeitar e excluir a solicitação de "${user.name}" (@${user.username})?`)) {
        users = users.filter(u => u.id !== id);
        saveUsers();
        renderUsersList();
        renderPendingUsers();
        showAlert('users-alert', `Solicitação de "${user.name}" foi rejeitada e excluída.`, 'success');
        setTimeout(() => {
            document.getElementById('users-alert').innerHTML = '';
        }, 3000);
    }
}

// Tornar funções globais
window.deleteUser = deleteUser;
window.approveUser = approveUser;
window.rejectUser = rejectUser;
// Função para resetar o sistema
function resetSystem() {
    if (confirm('⚠️ ATENÇÃO!\n\nIsso irá:\n• Criar/resetar o usuário admin padrão\n• Manter todos os posts e usuários existentes\n\nDeseja continuar?')) {
        // Garantir que o usuário admin padrão existe
        const storedUsers = localStorage.getItem('pibno_users');
        let users = storedUsers ? JSON.parse(storedUsers) : [];
        
        // Verificar se admin já existe
        const adminExists = users.find(u => u.username === DEFAULT_USERNAME);
        
        if (!adminExists) {
            // Criar admin padrão
            users.unshift({
                id: 1,
                username: DEFAULT_USERNAME,
                password: DEFAULT_PASSWORD,
                name: 'Administrador',
                role: 'admin',
                createdAt: new Date().toISOString()
            });
            
            localStorage.setItem('pibno_users', JSON.stringify(users));
            showAlert('login-alert', '✅ Usuário admin criado com sucesso!\n\nUsuário: admin\nSenha: pibno2025', 'success');
        } else {
            // Reset da senha do admin
            const adminIndex = users.findIndex(u => u.username === DEFAULT_USERNAME);
            users[adminIndex].password = DEFAULT_PASSWORD;
            localStorage.setItem('pibno_users', JSON.stringify(users));
            showAlert('login-alert', '✅ Senha do admin resetada!\n\nUsuário: admin\nSenha: pibno2025', 'success');
        }
    }
}
