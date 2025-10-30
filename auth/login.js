// login.js - Funcionalidad del formulario de login
const API_BASE_URL = 'https://recirculate-api.onrender.com/api';

// Verificar si ya está logueado (pero NO redirigir automáticamente)
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        verifyToken().then(isValid => {
            if (isValid) {
                // Mostrar mensaje opcional de que ya está logueado
                showMessage('Ya tienes una sesión activa', 'info');
            } else {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
            }
        });
    }
});

// Manejar envío del formulario

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const loading = document.getElementById('loading');
    const messageDiv = document.getElementById('message');

    // Validaciones básicas
    if (!email || !password) {
        showMessage('Por favor, completa todos los campos', 'error');
        return;
    }

    // Mostrar loading
    loginBtn.disabled = true;
    loading.style.display = 'block';
    messageDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('userData', JSON.stringify(data.data.user));

            // Lista de correos autorizados para el panel de administración
            const adminEmails = [
                'axel@recirculate.com',
                'nicolas@recirculate.com', 
                'loe@recirculate.com',
                'lucho@recirculate.com',
                'gere@recirculate.com',
                'pipo@recirculate.com'
            ];
            const userEmail = data.data.user.email.toLowerCase();
            const isAuthorizedAdmin = adminEmails.includes(userEmail);

            if (isAuthorizedAdmin) {
                showMessage('¡Login exitoso! Accediendo al panel de administración...', 'success');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            } else {
                showMessage('¡Login exitoso! Redirigiendo a la tienda...', 'success');
                setTimeout(() => {
                    window.location.href = '../RecirculateLoe/home/home.html';
                }, 1000);
            }
        } else {
            showMessage(data.message || 'Error en el login', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showMessage('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        loginBtn.disabled = false;
        loading.style.display = 'none';
    }
});

// --- Google Sign-In ---
async function handleGoogleLogin(response) {
    const googleToken = response.credential;
    const loading = document.getElementById('loading');
    const messageDiv = document.getElementById('message');
    if (loading) loading.style.display = 'block';
    try {
        const res = await fetch(`${API_BASE_URL}/auth/google-signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: googleToken })
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('userData', JSON.stringify(data.data.user));
            // Lista de correos autorizados para el panel de administración
            const adminEmails = [
                'axel@recirculate.com',
                'nicolas@recirculate.com', 
                'loe@recirculate.com',
                'lucho@recirculate.com',
                'gere@recirculate.com',
                'pipo@recirculate.com'
            ];
            const userEmail = data.data.user.email.toLowerCase();
            const isAuthorizedAdmin = adminEmails.includes(userEmail);
            if (isAuthorizedAdmin) {
                showMessage('¡Login exitoso con Google! Accediendo al panel de administración...', 'success');
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            } else {
                showMessage('¡Login exitoso con Google! Redirigiendo a la tienda...', 'success');
                setTimeout(() => {
                    window.location.href = '../RecirculateLoe/home/home.html';
                }, 1000);
            }
        } else {
            showMessage(data.message || 'Error en el login con Google', 'error');
        }
    } catch (error) {
        console.error('Error en Google Sign-In:', error);
        showMessage('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

// Función para mostrar mensajes
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="${type}-message">${message}</div>`;
}

// Función para verificar token
async function verifyToken() {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/perfil`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Función para logout (puede ser llamada desde otras páginas)
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'auth/login.html';
}

// Función para obtener datos del usuario
function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

// Función para verificar si el usuario es admin
function isAdmin() {
    const userData = getUserData();
    return userData && userData.rol === 'admin';
}

// Función para obtener el token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Exportar funciones globalmente
window.logout = logout;
window.getUserData = getUserData;
window.isAdmin = isAdmin;
window.getAuthToken = getAuthToken;