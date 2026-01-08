import { getCurrentUser, getUserData, uploadImage, updateUserProfile, logoutUser, onAuthChange } from './firebase-service.js';

let currentUser = null;
let selectedAvatarFile = null;
let imageEditorState = {
    zoom: 100,
    // offsets in pixels relative to the centered position
    offsetX: 0,
    offsetY: 0,
    imageUrl: null
};

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
    
    // Image Editor Modal listeners
    setupImageEditor();
});

function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Simple client-side limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showAlert('Arquivo muito grande. Use até 5MB.', 'error');
        e.target.value = '';
        return;
    }

    // Keep the original raw file until user confirms crop/transform
    imageEditorState.originalFile = file;
    const reader = new FileReader();
    reader.onload = () => {
        imageEditorState.imageUrl = reader.result;
        openImageEditor(reader.result);
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

// Image Editor Functions
function setupImageEditor() {
    const modal = document.getElementById('image-editor-modal');
    const confirmBtn = document.getElementById('confirm-image-btn');
    const cancelBtn = document.getElementById('cancel-image-btn');
    const previewImage = document.getElementById('preview-image');
    const previewArea = document.querySelector('.preview-area');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const resetBtn = document.getElementById('reset-btn');

    // Drag-to-pan state
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let startOffsetX = 0;
    let startOffsetY = 0;

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    // Initialize cursor
    previewImage.style.cursor = 'grab';

    // Mouse events for drag
    previewImage.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        startOffsetX = imageEditorState.offsetX;
        startOffsetY = imageEditorState.offsetY;
        previewImage.style.cursor = 'grabbing';
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = previewArea.getBoundingClientRect();
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        // compute display sizes to clamp correctly
        const { displayW, displayH } = computeDisplaySizes();
        const previewW = rect.width;
        const previewH = rect.height;

        let minOffsetX, maxOffsetX, minOffsetY, maxOffsetY;
        if (displayW <= previewW) {
            // image narrower than preview: disable horizontal panning
            minOffsetX = maxOffsetX = 0;
        } else {
            const centerLeft = (previewW - displayW) / 2;
            minOffsetX = centerLeft; // allow offset from centerLeft to -centerLeft
            maxOffsetX = -centerLeft;
        }

        if (displayH <= previewH) {
            minOffsetY = maxOffsetY = 0;
        } else {
            const centerTop = (previewH - displayH) / 2;
            minOffsetY = centerTop;
            maxOffsetY = -centerTop;
        }

        imageEditorState.offsetX = clamp(startOffsetX + dx, minOffsetX, maxOffsetX);
        imageEditorState.offsetY = clamp(startOffsetY + dy, minOffsetY, maxOffsetY);
        updatePreview();
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        previewImage.style.cursor = 'grab';
    });

    // Touch support
    previewImage.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        isDragging = true;
        dragStartX = t.clientX;
        dragStartY = t.clientY;
        startOffsetX = imageEditorState.offsetX;
        startOffsetY = imageEditorState.offsetY;
    }, { passive: true });

    previewImage.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const t = e.touches[0];
        const rect = previewArea.getBoundingClientRect();
        const dx = t.clientX - dragStartX;
        const dy = t.clientY - dragStartY;
        const { displayW, displayH } = computeDisplaySizes();
        const previewW = rect.width;
        const previewH = rect.height;

        let minOffsetX, maxOffsetX, minOffsetY, maxOffsetY;
        if (displayW <= previewW) {
            minOffsetX = maxOffsetX = 0;
        } else {
            const centerLeft = (previewW - displayW) / 2;
            minOffsetX = centerLeft;
            maxOffsetX = -centerLeft;
        }

        if (displayH <= previewH) {
            minOffsetY = maxOffsetY = 0;
        } else {
            const centerTop = (previewH - displayH) / 2;
            minOffsetY = centerTop;
            maxOffsetY = -centerTop;
        }

        imageEditorState.offsetX = clamp(startOffsetX + dx, minOffsetX, maxOffsetX);
        imageEditorState.offsetY = clamp(startOffsetY + dy, minOffsetY, maxOffsetY);
        updatePreview();
    }, { passive: true });

    previewImage.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Wheel for zoom
    previewArea.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = previewArea.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const old = computeDisplaySizes();
        const oldZoom = imageEditorState.zoom;
        const delta = e.deltaY > 0 ? -5 : 5;
        imageEditorState.zoom = clamp(imageEditorState.zoom + delta, 50, 200);
        document.getElementById('zoom-value').textContent = imageEditorState.zoom + '%';

        // adjust offsets to keep mouse point stable
        const now = computeDisplaySizes();
        const dx = (mouseX - rect.width / 2) * (now.displayW / old.displayW - 1);
        const dy = (mouseY - rect.height / 2) * (now.displayH / old.displayH - 1);
        imageEditorState.offsetX = imageEditorState.offsetX - dx;
        imageEditorState.offsetY = imageEditorState.offsetY - dy;

        updatePreview();
    }, { passive: false });

    // Zoom buttons
    const changeZoom = (delta) => {
        imageEditorState.zoom = clamp(imageEditorState.zoom + delta, 50, 200);
        document.getElementById('zoom-value').textContent = imageEditorState.zoom + '%';
        updatePreview();
    };

    zoomInBtn?.addEventListener('click', () => changeZoom(5));
    zoomOutBtn?.addEventListener('click', () => changeZoom(-5));
    resetBtn?.addEventListener('click', () => {
        imageEditorState.zoom = 100;
        imageEditorState.offsetX = 0;
        imageEditorState.offsetY = 0;
        document.getElementById('zoom-value').textContent = imageEditorState.zoom + '%';
        updatePreview();
    });

    confirmBtn.addEventListener('click', async () => {
        // Render the transformed/cropped image into a canvas and create a compressed Blob/File
        try {
            const previewArea = document.querySelector('.preview-area');
            const previewSize = previewArea ? previewArea.clientWidth : 300; // PX as in the modal preview-area
            const finalSize = 720; // output size for upload (higher = better quality)

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = imageEditorState.imageUrl;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = resolve;
            });

            const zoom = imageEditorState.zoom;
            const natW = imageEditorState.naturalWidth || img.naturalWidth;
            const natH = imageEditorState.naturalHeight || img.naturalHeight;

            const { displayW, displayH } = computeDisplaySizes();

            // position of displayed image relative to preview area
            const centerLeft = (previewSize - displayW) / 2;
            const centerTop = (previewSize - displayH) / 2;
            // Use same clamping as updatePreview: left/top between (previewSize - display) and 0
            const left = Math.max(previewSize - displayW, Math.min(0, centerLeft + imageEditorState.offsetX));
            const top = Math.max(previewSize - displayH, Math.min(0, centerTop + imageEditorState.offsetY));

            // Compute source rectangle in the natural image that maps to the preview area
            const startXDisplay = Math.max(0, -left);
            const startYDisplay = Math.max(0, -top);
            const widthDisplay = Math.min(previewSize, displayW - startXDisplay);
            const heightDisplay = Math.min(previewSize, displayH - startYDisplay);

            const srcX = (startXDisplay / displayW) * natW;
            const srcY = (startYDisplay / displayH) * natH;
            const srcW = (widthDisplay / displayW) * natW;
            const srcH = (heightDisplay / displayH) * natH;

            const canvas = document.createElement('canvas');
            canvas.width = finalSize;
            canvas.height = finalSize;
            const ctx = canvas.getContext('2d');
            // white background for JPEG
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the selected source area scaled to finalSize
            ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, finalSize, finalSize);

            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
            if (!blob) throw new Error('Falha ao processar imagem');

            const filename = `avatar_${Date.now()}.jpg`;
            selectedAvatarFile = new File([blob], filename, { type: 'image/jpeg' });

            // Update preview and state
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            imageEditorState.imageUrl = dataUrl;
            document.getElementById('avatar-img').src = dataUrl;

            // Show generated file size to the user
            try {
                const sizeEl = document.getElementById('generated-size');
                const infoEl = document.getElementById('generated-info');
                if (sizeEl && infoEl && selectedAvatarFile) {
                    sizeEl.textContent = formatBytes(selectedAvatarFile.size);
                    infoEl.style.display = 'block';
                }
            } catch (e) {
                // ignore UI update failures
            }
        } catch (err) {
            console.error('Erro ao aplicar transformação da imagem:', err);
            showAlert('Erro ao processar a imagem.', 'error');
        } finally {
            modal.classList.remove('active');
            // clear raw input value so re-selecting same file will trigger change
            document.getElementById('avatar-input').value = '';
        }
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.getElementById('avatar-input').value = '';
    });
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.getElementById('avatar-input').value = '';
        }
    });
}

// Helper: compute display sizes (px) of the image in the preview area based on current zoom
function computeDisplaySizes() {
    const previewArea = document.querySelector('.preview-area');
    const previewSize = previewArea ? previewArea.clientWidth : 300;
    const imgEl = document.getElementById('preview-image');
    // fallback if no image loaded
    let natW = imageEditorState.naturalWidth || imgEl.naturalWidth || previewSize;
    let natH = imageEditorState.naturalHeight || imgEl.naturalHeight || previewSize;
    if (!natW || !natH) { natW = previewSize; natH = previewSize; }
    const scaleCover = Math.max(previewSize / natW, previewSize / natH) * (imageEditorState.zoom / 100);
    const displayW = natW * scaleCover;
    const displayH = natH * scaleCover;
    return { displayW, displayH };
}

function openImageEditor(imageUrl) {
    const modal = document.getElementById('image-editor-modal');
    const previewImage = document.getElementById('preview-image');

    // Reset editor state
    imageEditorState.zoom = 100;
    imageEditorState.offsetX = 0;
    imageEditorState.offsetY = 0;
    document.getElementById('zoom-value').textContent = '100%';

    previewImage.src = imageUrl;
    // capture natural size when loaded
    previewImage.onload = () => {
        imageEditorState.naturalWidth = previewImage.naturalWidth;
        imageEditorState.naturalHeight = previewImage.naturalHeight;
        // reset offsets to center
        imageEditorState.offsetX = 0;
        imageEditorState.offsetY = 0;
        updatePreview();
    };

    modal.classList.add('active');
}

function updatePreview() {
    const previewImage = document.getElementById('preview-image');
    const previewArea = document.querySelector('.preview-area');
    const previewSize = previewArea.clientWidth; // square

    if (!imageEditorState.naturalWidth || !imageEditorState.naturalHeight) return;

    const { displayW, displayH } = computeDisplaySizes();

    // center position
    const centerLeft = (previewSize - displayW) / 2;
    const centerTop = (previewSize - displayH) / 2;

    const left = Math.max(previewSize - displayW, Math.min(0, centerLeft + imageEditorState.offsetX));
    const top = Math.max(previewSize - displayH, Math.min(0, centerTop + imageEditorState.offsetY));

    previewImage.style.width = Math.round(displayW) + 'px';
    previewImage.style.height = Math.round(displayH) + 'px';
    previewImage.style.left = Math.round(left) + 'px';
    previewImage.style.top = Math.round(top) + 'px';
    previewImage.style.transform = '';
}

function applyImageTransform(imgElement) {
    const zoomPercent = imageEditorState.zoom;
    const offsetX = imageEditorState.offsetX;
    const offsetY = imageEditorState.offsetY;
    
    imgElement.style.transform = `scale(${zoomPercent / 100}) translate(${offsetX}%, ${offsetY}%)`;
    imgElement.style.transformOrigin = 'center center';
}

function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
