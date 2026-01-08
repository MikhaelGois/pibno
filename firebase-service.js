// Firebase Service - Abstração para operações do Firebase
import { 
    auth, 
    db,
    storage,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    getDoc,
    setDoc,
    serverTimestamp,
    limit,
    ref,
    uploadBytes,
    getDownloadURL
} from './firebase-config.js';

// ========== AUTENTICAÇÃO ==========

export async function registerUser(email, password, userData) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Definir valores padrão se não fornecidos
        const role = userData.role || 'pending';
        const approved = userData.approved !== undefined ? userData.approved : false;
        
        // Salvar dados adicionais do usuário no Firestore
        await setDoc(doc(db, 'users', user.uid), {
            ...userData,
            email: email,
            uid: user.uid,
            role: role,
            approved: approved,
            createdAt: serverTimestamp()
        });
        
        return { success: true, user };
    } catch (error) {
        console.error('Erro no registro:', error);
        return { success: false, error: error.message };
    }
}

export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Buscar dados completos do usuário
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            return { success: true, user, userData };
        }
        
        return { success: false, error: 'Dados do usuário não encontrados' };
    } catch (error) {
        console.error('Erro no login:', error);
        return { success: false, error: error.message };
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Erro no logout:', error);
        return { success: false, error: error.message };
    }
}

export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

export async function getCurrentUser() {
    try {
        const user = auth.currentUser;
        if (!user) return null;
        
        // Buscar dados completos do usuário
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            return { id: user.uid, ...userDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar usuário atual:', error);
        return null;
    }
}

// ========== USUÁRIOS ==========

export async function getUserData(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
        }
        return { success: false, error: 'Usuário não encontrado' };
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return { success: false, error: error.message };
    }
}

export async function updateUserProfile(uid, profileData) {
    try {
        // Remover chaves undefined
        const dataToUpdate = {};
        Object.keys(profileData).forEach(key => {
            if (profileData[key] !== undefined) dataToUpdate[key] = profileData[key];
        });

        await updateDoc(doc(db, 'users', uid), {
            ...dataToUpdate,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar perfil do usuário:', error);
        return { success: false, error: error.message };
    }
}

export async function getUserByUsername(username) {
    try {
        const usersQuery = query(
            collection(db, 'users'),
            where('username', '==', username),
            limit(1)
        );
        const querySnapshot = await getDocs(usersQuery);
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        if (users.length > 0) return { success: true, data: users[0] };
        return { success: false, error: 'Usuário não encontrado' };
    } catch (error) {
        console.error('Erro ao buscar usuário por username:', error);
        return { success: false, error: error.message };
    }
}

export async function getAllUsers() {
    try {
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(usersQuery);
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, users };
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return { success: false, error: error.message };
    }
}

export async function getPendingUsers() {
    try {
        // Tentar com orderBy
        let pendingQuery = query(
            collection(db, 'users'), 
            where('role', '==', 'pending')
        );
        
        try {
            pendingQuery = query(
                collection(db, 'users'), 
                where('role', '==', 'pending'),
                orderBy('createdAt', 'desc')
            );
        } catch (e) {
            console.log('Usando query sem orderBy:', e);
        }
        
        const querySnapshot = await getDocs(pendingQuery);
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        
        // Ordenar manualmente se não tiver createdAt
        users.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
        });
        
        return { success: true, users };
    } catch (error) {
        console.error('Erro ao buscar usuários pendentes:', error);
        return { success: false, error: error.message };
    }
}

export async function updateUserRole(uid, role) {
    try {
        await updateDoc(doc(db, 'users', uid), {
            role: role,
            approved: true,
            approvedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar função:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteUser(uid) {
    try {
        await deleteDoc(doc(db, 'users', uid));
        return { success: true };
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        return { success: false, error: error.message };
    }
}

// ========== POSTS ==========

export async function createPost(postData) {
    try {
        // Tentar anexar dados do autor se usuário autenticado
        try {
            const current = await getCurrentUser();
            if (current) {
                postData.authorId = postData.authorId || current.id;
                postData.authorUsername = postData.authorUsername || current.username || '';
                postData.author = postData.author || current.name || current.email || '';
            }
        } catch (e) {
            console.log('Não foi possível obter usuário atual ao criar post:', e.message);
        }

        const docRef = await addDoc(collection(db, 'posts'), {
            ...postData,
            createdAt: new Date().toISOString()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Erro ao criar post:', error);
        return { success: false, error: error.message };
    }
}

export async function getAllPosts() {
    try {
        const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(postsQuery);
        const posts = [];
        querySnapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, posts };
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        return { success: false, error: error.message };
    }
}

export async function getPostsPage(limitCount = 10, lastCreatedAt = null) {
    try {
        let postsQuery;

        if (lastCreatedAt) {
            // Consulta paginada: posts com createdAt < lastCreatedAt
            try {
                postsQuery = query(
                    collection(db, 'posts'),
                    where('createdAt', '<', lastCreatedAt),
                    orderBy('createdAt', 'desc'),
                    limit(limitCount)
                );
            } catch (e) {
                // Fallback: sem where, apenas orderBy+limit
                postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(limitCount));
            }
        } else {
            postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(limitCount));
        }

        const querySnapshot = await getDocs(postsQuery);
        const posts = [];
        querySnapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, posts };
    } catch (error) {
        console.error('Erro ao buscar página de posts:', error);
        return { success: false, error: error.message };
    }
}

export async function updatePost(postId, postData) {
    try {
        await updateDoc(doc(db, 'posts', postId), {
            ...postData,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar post:', error);
        return { success: false, error: error.message };
    }
}

export async function deletePost(postId) {
    try {
        await deleteDoc(doc(db, 'posts', postId));
        return { success: true };
    } catch (error) {
        console.error('Erro ao excluir post:', error);
        return { success: false, error: error.message };
    }
}

// ========== COMMENTS ==========

export async function addComment(postId, commentData) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Usuário não autenticado' };
        }
        
        const commentRef = await addDoc(collection(db, 'comments'), {
            postId,
            userId: user.uid,
            userName: user.name || user.email,
            content: commentData.content,
            createdAt: serverTimestamp()
        });
        
        return { success: true, commentId: commentRef.id };
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        return { success: false, error: error.message };
    }
}

export async function getCommentsByPost(postId) {
    try {
        // Tentar primeiro com orderBy
        try {
            const commentsQuery = query(
                collection(db, 'comments'), 
                where('postId', '==', postId),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(commentsQuery);
            const comments = [];
            querySnapshot.forEach((doc) => {
                comments.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, comments };
        } catch (indexError) {
            // Se falhar por falta de índice, tentar sem orderBy
            console.log('⚠️ Índice ainda não disponível, carregando sem ordenação:', indexError.message);
            const commentsQuery = query(
                collection(db, 'comments'), 
                where('postId', '==', postId)
            );
            const querySnapshot = await getDocs(commentsQuery);
            const comments = [];
            querySnapshot.forEach((doc) => {
                comments.push({ id: doc.id, ...doc.data() });
            });
            // Ordenar manualmente
            comments.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });
            return { success: true, comments };
        }
    } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        return { success: false, error: error.message, comments: [] };
    }
}

export async function deleteComment(commentId) {
    try {
        await deleteDoc(doc(db, 'comments', commentId));
        return { success: true };
    } catch (error) {
        console.error('Erro ao excluir comentário:', error);
        return { success: false, error: error.message };
    }
}

export async function getPostsByAuthor(author, limit = 3, excludePostId = null) {
    try {
        const postsQuery = query(
            collection(db, 'posts'),
            where('author', '==', author),
            orderBy('createdAt', 'desc'),
            limit(limit + 1)
        );
        const querySnapshot = await getDocs(postsQuery);
        const posts = [];
        querySnapshot.forEach((doc) => {
            if (doc.id !== excludePostId) {
                posts.push({ id: doc.id, ...doc.data() });
            }
        });
        return { success: true, posts: posts.slice(0, limit) };
    } catch (error) {
        console.error('Erro ao buscar posts do autor:', error);
        return { success: false, posts: [] };
    }
}

// ========== STORAGE ==========

export async function uploadImage(file, path) {
    try {
        // Require authenticated user for uploads (storage rules expect auth.uid)
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'Usuário não autenticado' };
        }

        // Enforce avatars path to use the authenticated user's uid
        let finalPath = path || '';
        if (finalPath.startsWith('avatars')) {
            const parts = finalPath.split('/').filter(Boolean);
            if (parts.length === 1) {
                finalPath = `avatars/${user.uid}`;
            } else if (parts[1] !== user.uid) {
                // Force write into the authenticated user's avatar folder
                finalPath = `avatars/${user.uid}`;
            }
        }

        // Get auth token for REST API
        const token = await user.getIdToken();
        const bucket = "pibno-3aff5.firebasestorage.app";
        const filename = `${Date.now()}_${file.name}`;
        const fullPath = `${finalPath}/${filename}`;
        
        // Use Firebase Storage REST API (no CORS issues)
        const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=${encodeURIComponent(fullPath)}`;
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': file.type || 'application/octet-stream'
            },
            body: file
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Upload failed: ${response.status}`);
        }

        // Get download URL
        const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(fullPath)}?alt=media`;
        return { success: true, url: downloadUrl };
    } catch (error) {
        console.error('Erro ao fazer upload:', error);
        return { success: false, error: error.message };
    }
}
