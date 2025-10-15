// assets/auth-utils.js - Utilidades de autenticación para todas las páginas
const API_BASE_URL = 'http://localhost:3001/api';

// Verificar autenticación y redirigir si no está logueado
function requireAuth(redirectToLogin = true) {
    const token = localStorage.getItem('authToken');
    if (!token && redirectToLogin) {
        window.location.href = './auth/login.html';
        return false;
    }
    return !!token;
}

// Verificar si es administrador
function requireAdmin(redirectToLogin = true) {
    if (!requireAuth(redirectToLogin)) {
        return false;
    }
    
    const userData = getUserData();
    if (!userData || userData.rol !== 'admin') {
        if (redirectToLogin) {
            alert('Necesitas permisos de administrador para acceder a esta función.');
            window.location.href = './auth/login.html';
        }
        return false;
    }
    return true;
}

// Obtener datos del usuario
function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

// Obtener token de autorización
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Verificar si el usuario es admin
function isAdmin() {
    const userData = getUserData();
    return userData && userData.rol === 'admin';
}

// Función de logout
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = './auth/login.html';
}

// Hacer petición autenticada
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error('No hay token de autenticación');
    }
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };
    
    const response = await fetch(url, config);
    
    // Si el token expiró, redirigir al login
    if (response.status === 401) {
        logout();
        return;
    }
    
    return response;
}

// Verificar token válido
async function verifyToken() {
    const token = getAuthToken();
    if (!token) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/perfil`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            // Token inválido, limpiar localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error verificando token:', error);
        return false;
    }
}

// Inicializar autenticación en la página
async function initAuth() {
    const isValidToken = await verifyToken();
    
    if (!isValidToken) {
        // Solo redirigir si estamos en una página protegida
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('/auth/');
        const isIndexPage = currentPath.endsWith('/') || currentPath.endsWith('/index.html');
        
        if (!isAuthPage && !isIndexPage) {
            window.location.href = '../auth/login.html';
        }
        return false;
    }
    
    return true;
}

// Mostrar/ocultar elementos según autenticación
function updateUIForAuth() {
    const userData = getUserData();
    const isLoggedIn = !!userData;
    const isUserAdmin = isAdmin();
    
    // Elementos que solo se muestran si está logueado
    const loggedInElements = document.querySelectorAll('[data-auth="logged-in"]');
    loggedInElements.forEach(el => {
        el.style.display = isLoggedIn ? 'block' : 'none';
    });
    
    // Elementos que solo se muestran si NO está logueado
    const loggedOutElements = document.querySelectorAll('[data-auth="logged-out"]');
    loggedOutElements.forEach(el => {
        el.style.display = isLoggedIn ? 'none' : 'block';
    });
    
    // Elementos que solo se muestran para admin
    const adminElements = document.querySelectorAll('[data-auth="admin"]');
    adminElements.forEach(el => {
        el.style.display = isUserAdmin ? 'block' : 'none';
    });
    
    // Mostrar nombre del usuario
    const userNameElements = document.querySelectorAll('[data-user="name"]');
    userNameElements.forEach(el => {
        el.textContent = userData ? userData.nombre : '';
    });
    
    // Mostrar rol del usuario
    const userRoleElements = document.querySelectorAll('[data-user="role"]');
    userRoleElements.forEach(el => {
        el.textContent = userData ? userData.rol : '';
    });
}

// Exportar funciones globalmente
window.requireAuth = requireAuth;
window.requireAdmin = requireAdmin;
window.getUserData = getUserData;
window.getAuthToken = getAuthToken;
window.isAdmin = isAdmin;
window.logout = logout;
window.authenticatedFetch = authenticatedFetch;
window.verifyToken = verifyToken;
window.initAuth = initAuth;
window.updateUIForAuth = updateUIForAuth;