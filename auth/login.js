// login.js - Funcionalidad del formulario de login
const API_BASE_URL = 'http://localhost:3001/api';

// Verificar si ya está logueado
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Verificar token válido
        verifyToken().then(isValid => {
            if (isValid) {
                window.location.href = '../index.html';
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
            // Guardar token y datos del usuario
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('userData', JSON.stringify(data.data.user));
            
            showMessage('¡Login exitoso! Redirigiendo...', 'success');
            
            // Redirigir después de 1 segundo
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
            
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