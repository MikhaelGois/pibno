import { getUserData, getUserByUsername, getPostsByAuthor } from './firebase-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadUserFromQuery();
});

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: params.get('id'),
        username: params.get('username')
    };
}

async function loadUserFromQuery() {
    const params = getQueryParams();
    let userResult = null;

    if (params.id) {
        userResult = await getUserData(params.id);
        if (userResult && userResult.success) {
            renderUser(userResult.data);
            loadUserPosts(userResult.data.username);
            return;
        }
    }

    if (params.username) {
        userResult = await getUserByUsername(params.username);
        if (userResult && userResult.success) {
            renderUser(userResult.data);
            loadUserPosts(userResult.data.username);
            return;
        }
    }

    showAlert('Usuário não encontrado.', 'error');
}

function renderUser(user) {
    document.getElementById('user-name').textContent = user.name || '—';
    document.getElementById('user-username').textContent = user.username || '—';
    document.getElementById('user-memberType').textContent = user.memberType || 'Membro';
    document.getElementById('user-bio').textContent = user.bio || '';
    if (user.avatarUrl) document.getElementById('user-avatar').src = user.avatarUrl;
    if (user.createdAt) {
        let d;
        if (user.createdAt.seconds) d = new Date(user.createdAt.seconds * 1000);
        else d = new Date(user.createdAt);
        document.getElementById('user-joined').textContent = d.toLocaleDateString('pt-BR');
    } else {
        document.getElementById('user-joined').textContent = '—';
    }
}

async function loadUserPosts(username) {
    const postsArea = document.getElementById('posts-list');
    postsArea.innerHTML = '<p class="note">Carregando...</p>';
    try {
        const res = await getPostsByAuthor(username, 20);
        if (res.success && res.posts.length > 0) {
            postsArea.innerHTML = '';
            res.posts.forEach(p => {
                const el = createPostCard(p);
                postsArea.appendChild(el);
            });
        } else {
            postsArea.innerHTML = '<p class="note">Nenhuma postagem pública encontrada.</p>';
        }
    } catch (e) {
        console.error(e);
        postsArea.innerHTML = '<p class="note">Erro ao carregar postagens.</p>';
    }
}

function createPostCard(post) {
    const div = document.createElement('div');
    div.className = 'post-card';

    const date = post.createdAt ? (post.createdAt.seconds ? new Date(post.createdAt.seconds * 1000) : new Date(post.createdAt)) : null;
    const dateText = date ? date.toLocaleDateString('pt-BR') : '';

    const excerpt = post.content ? (post.content.replace(/<[^>]*>/g, '').slice(0, 140) + '...') : '';

    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <strong>${escapeHtml(post.title || 'Sem título')}</strong>
            <small style="color:var(--text-light);">${dateText}</small>
        </div>
        <div style="color:var(--text-color); margin-bottom:0.5rem;">${escapeHtml(excerpt)}</div>
        <a href="post.html?id=${post.id}" class="btn">Abrir postagem →</a>
    `;

    return div;
}

function showAlert(message, type='info') {
    const area = document.getElementById('alert-area');
    area.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
