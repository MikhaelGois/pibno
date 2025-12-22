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
    ref,
    uploadBytes,
    getDownloadURL
} from './firebase-config.js';

// ========== AUTENTICAÇÃO ==========

export async function registerUser(email, password, userData) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Salvar dados adicionais do usuário no Firestore
        await setDoc(doc(db, 'users', user.uid), {
            ...userData,
            email: email,
            uid: user.uid,
            role: 'pending',
            approved: false,
            createdAt: new Date().toISOString()
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
        const pendingQuery = query(
            collection(db, 'users'), 
            where('role', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(pendingQuery);
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
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
        const postsQuery = query(collection(db, 'posts'), orderBy('date', 'desc'));
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

// ========== STORAGE ==========

export async function uploadImage(file, path) {
    try {
        const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return { success: true, url: downloadURL };
    } catch (error) {
        console.error('Erro ao fazer upload:', error);
        return { success: false, error: error.message };
    }
}
