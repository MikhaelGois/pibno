import { getPostsPage } from './firebase-service.js';

const POSTS_PER_PAGE = 8;
const SCROLL_THRESHOLD_PX = 300; // fixed default for all users
let isLoading = false;
let hasMore = true;
let lastCursor = null; // createdAt of last item loaded

document.addEventListener('DOMContentLoaded', async () => {
    await loadMore();
    window.addEventListener('scroll', handleScroll);
});

async function handleScroll() {
    if (isLoading || !hasMore) return;
    const threshold = SCROLL_THRESHOLD_PX;
    const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - threshold;
    if (nearBottom) {
        await loadMore();
    }
}

// note: removed preference UI and alerts — feed uses fixed threshold

async function loadMore() {
    if (isLoading || !hasMore) return;
    isLoading = true;
    const postsArea = document.getElementById('posts-list');
    const status = document.getElementById('infinite-status');
    status.textContent = 'Carregando...';

    try {
        const res = await getPostsPage(POSTS_PER_PAGE, lastCursor);
        if (!res.success) throw new Error(res.error || 'Erro na consulta');

        const posts = res.posts || [];
        if (posts.length === 0) {
            hasMore = false;
            status.textContent = 'Você alcançou o fim do feed';
            return;
        }

        posts.forEach(p => postsArea.appendChild(createPostCard(p)));

        const last = posts[posts.length - 1];
        lastCursor = last.createdAt || last.createdAt;
        hasMore = posts.length >= POSTS_PER_PAGE;
        status.textContent = hasMore ? 'Role para carregar mais...' : 'Você alcançou o fim do feed';
    } catch (e) {
        console.error(e);
        document.getElementById('posts-list').innerHTML = '<p class="note">Erro ao carregar posts.</p>';
        document.getElementById('infinite-status').textContent = 'Erro ao carregar posts';
    } finally {
        isLoading = false;
    }
}

function createPostCard(post) {
    const div = document.createElement('div');
    div.className = 'post-card';

    const date = post.createdAt ? (post.createdAt.seconds ? new Date(post.createdAt.seconds * 1000) : new Date(post.createdAt)) : null;
    const dateText = date ? date.toLocaleDateString('pt-BR') : '';

    const excerpt = post.content ? (post.content.replace(/<[^>]*>/g, '').slice(0, 200) + '...') : '';

    const authorHtml = post.authorUsername ? `<a href="user.html?username=${encodeURIComponent(post.authorUsername)}">${escapeHtml(post.author || post.authorUsername)}</a>` : (post.authorId ? `<a href="user.html?id=${post.authorId}">${escapeHtml(post.author || 'Anônimo')}</a>` : escapeHtml(post.author || 'Anônimo'));

    div.innerHTML = `
        <h3>${escapeHtml(post.title || 'Sem título')}</h3>
        <div class="post-meta">${authorHtml} • ${dateText}</div>
        <div style="color:var(--text-color);">${escapeHtml(excerpt)}</div>
        <p style="margin-top:0.5rem;"><a class="btn" href="post.html?id=${post.id}">Abrir →</a></p>
    `;

    return div;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
