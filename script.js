// Importar funções do Firebase
import { getAllPosts, loginUser, getCurrentUser, onAuthChange } from './firebase-service.js';

// Menu Mobile Toggle
const navToggle = document.getElementById('nav-toggle');
const nav = document.getElementById('nav');
const navClose = document.getElementById('nav-close');
const navLinks = document.querySelectorAll('.nav-link');

// Abrir menu
navToggle.addEventListener('click', () => {
    nav.classList.add('active');
});

// Fechar menu
navClose.addEventListener('click', () => {
    nav.classList.remove('active');
});

// Fechar menu ao clicar em um link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
    });
});

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
        nav.classList.remove('active');
    }
});

// Scroll suave
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
    
    lastScroll = currentScroll;
});

// Form submission
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        
        // Aqui você pode adicionar a lógica para enviar o formulário
        // Por enquanto, apenas mostra um alerta
        alert(`Obrigado, ${name}! Sua mensagem foi enviada com sucesso. Entraremos em contato em breve.`);
        
        // Limpa o formulário
        contactForm.reset();
    });
}

// Animação de scroll para elementos
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observa os cards para animação
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.schedule-card, .message-card, .ministry-card');
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Link ativo no menu conforme scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
});

// Botão voltar ao topo (opcional)
function createBackToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'back-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--accent-color);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(button);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.style.opacity = '1';
            button.style.pointerEvents = 'all';
        } else {
            button.style.opacity = '0';
            button.style.pointerEvents = 'none';
        }
    });
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
}

// Cria o botão ao carregar a página
createBackToTopButton();

// Sistema de Blog
async function loadBlogPosts() {
    const blogGrid = document.getElementById('blog-posts');
    
    try {
        // Tentar carregar posts do Firebase
        const result = await getAllPosts();
        
        let posts = [];
        
        if (result.success && result.posts.length > 0) {
            // Usar posts do Firebase
            posts = result.posts;
        } else {
            // Fallback: carregar do posts.json
            try {
                const response = await fetch('posts.json');
                const data = await response.json();
                posts = data.posts || [];
            } catch (error) {
                console.log('Nenhum post encontrado no Firebase ou posts.json');
            }
        }
        
        if (posts.length === 0) {
            blogGrid.innerHTML = '<p class="loading">Nenhuma postagem disponível no momento.</p>';
            return;
        }
        
        // Ordenar posts por data (mais recente primeiro)
        posts.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        
        blogGrid.innerHTML = '';
        
        posts.forEach(post => {
            const postElement = createBlogPostElement(post);
            blogGrid.appendChild(postElement);
        });
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
        
        // Tentar carregar do posts.json como último recurso
        try {
            const response = await fetch('posts.json');
            const data = await response.json();
            const posts = data.posts || [];
            
            if (posts.length > 0) {
                blogGrid.innerHTML = '';
                posts.forEach(post => {
                    const postElement = createBlogPostElement(post);
                    blogGrid.appendChild(postElement);
                });
            } else {
                blogGrid.innerHTML = '<p class="loading">Nenhuma postagem disponível no momento.</p>';
            }
        } catch (fallbackError) {
            blogGrid.innerHTML = '<p class="loading">Erro ao carregar postagens. Tente novamente mais tarde.</p>';
        }
    }
}

function createBlogPostElement(post) {
    const article = document.createElement('article');
    article.className = 'blog-post';
    article.onclick = () => openPostModal(post);
    
    const formattedDate = formatDate(post.date);
    
    let mediaHTML = '';
    if (post.type === 'image' && post.image) {
        mediaHTML = `<img src="${post.image}" alt="${post.title}" class="blog-post-image">`;
    } else if (post.type === 'video' && post.videoId) {
        mediaHTML = `
            <iframe 
                class="blog-post-video"
                src="https://www.youtube.com/embed/${post.videoId}" 
                title="${post.title}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    }
    
    // Limitar conteúdo para preview
    const excerpt = post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content;
    
    article.innerHTML = `
        ${mediaHTML}
        <div class="blog-post-content">
            <p class="blog-post-date">${formattedDate}</p>
            <h3 class="blog-post-title">${post.title}</h3>
            <p class="blog-post-author">Por ${post.author}</p>
            <p class="blog-post-excerpt">${excerpt}</p>
            <a href="post.html?id=${post.id}" class="blog-post-read-more" onclick="event.stopPropagation();">Ler mais →</a>
        </div>
    `;
    
    return article;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
}

// Carregar posts quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();
    createPostModal();
    initLoginModal();
});

// Sistema de Login Modal
function initLoginModal() {
    const btnLogin = document.getElementById('btn-login');
    const loginModal = document.getElementById('login-modal');
    const closeLoginModal = document.getElementById('close-login-modal');
    const loginForm = document.getElementById('login-modal-form');
    
    // Verificar se já está logado
    checkIfLoggedIn();
    
    // Abrir modal
    if (btnLogin) {
        btnLogin.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Verificar autenticação com Firebase
            const user = await getCurrentUser();
            if (user && user.role !== 'pending' && user.approved) {
                window.location.href = 'admin.html';
                return;
            }
            
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Fechar modal
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', () => {
            closeLoginModalFunc();
        });
    }
    
    // Fechar ao clicar fora
    loginModal.addEventListener('click', (e) => {
        if (e.target.id === 'login-modal') {
            closeLoginModalFunc();
        }
    });
    
    // Submit do formulário
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && loginModal.classList.contains('active')) {
            closeLoginModalFunc();
        }
    });
}

async function checkIfLoggedIn() {
    const user = await getCurrentUser();
    const btnLogin = document.getElementById('btn-login');
    
    if (user && user.role !== 'pending' && user.approved && btnLogin) {
        btnLogin.innerHTML = '👤 Admin';
        btnLogin.title = 'Ir para o painel administrativo';
    }
}

function closeLoginModalFunc() {
    const loginModal = document.getElementById('login-modal');
    loginModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('login-modal-form').reset();
    document.getElementById('login-modal-alert').innerHTML = '';
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '🔄 Entrando...';
    
    try {
        const result = await loginUser(email, password);
        
        if (result.success) {
            // Verificar se está aprovado
            if (result.userData.role === 'pending' || !result.userData.approved) {
                showLoginAlert('⏳ Sua conta ainda não foi aprovada. Aguarde a aprovação de um administrador.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }
            
            showLoginAlert('✅ Login realizado com sucesso! Redirecionando...', 'success');
            
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        } else {
            showLoginAlert(`❌ ${result.error}`, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showLoginAlert('❌ Erro ao fazer login. Tente novamente.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function showLoginAlert(message, type) {
    const alertDiv = document.getElementById('login-modal-alert');
    alertDiv.innerHTML = `<div class="login-alert login-alert-${type}">${message}</div>`;
    
    if (type === 'error') {
        setTimeout(() => {
            alertDiv.innerHTML = '';
        }, 3000);
    }
}

// Modal de Post Completo
function createPostModal() {
    const modalHTML = `
        <div id="post-modal" class="post-modal">
            <div class="post-modal-content">
                <button class="post-modal-close">&times;</button>
                <div id="post-modal-body"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Fechar modal ao clicar fora
    document.getElementById('post-modal').addEventListener('click', (e) => {
        if (e.target.id === 'post-modal') {
            closePostModal();
        }
    });
    
    // Fechar modal com botão
    document.querySelector('.post-modal-close').addEventListener('click', closePostModal);
}

function openPostModal(post) {
    const modal = document.getElementById('post-modal');
    const modalBody = document.getElementById('post-modal-body');
    
    const formattedDate = formatDate(post.date);
    
    let mediaHTML = '';
    if (post.type === 'image' && post.image) {
        mediaHTML = `<img src="${post.image}" alt="${post.title}" class="post-modal-image">`;
    } else if (post.type === 'video' && post.videoId) {
        mediaHTML = `
            <div class="post-modal-video-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${post.videoId}" 
                    title="${post.title}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    }
    
    modalBody.innerHTML = `
        ${mediaHTML}
        <div class="post-modal-text">
            <p class="blog-post-date">${formattedDate}</p>
            <h2 class="post-modal-title">${post.title}</h2>
            <p class="blog-post-author">Por ${post.author}</p>
            <div class="post-modal-content-text">${post.content}</div>
            <div class="post-modal-actions">
                <a href="post.html?id=${post.id}" class="btn-open-full" target="_blank">
                    🔗 Abrir em página completa
                </a>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closePostModal() {
    const modal = document.getElementById('post-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Permitir fechar modal com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePostModal();
    }
});

// Tornar função global
window.openPostModal = openPostModal;
