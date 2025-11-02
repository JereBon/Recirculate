// login.js - Funcionalidad del formulario de login
const API_BASE_URL = 'https://recirculate-api.onrender.com/api';

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
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const email = emailInput.value;
    const password = passwordInput.value;
    const loginBtn = document.getElementById('loginBtn');
    const loading = document.getElementById('loading');
    const messageDiv = document.getElementById('message');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    
    // Limpiar estados de error previos
    emailInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');
    forgotPasswordLink.classList.remove('show');
    
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
            
            // Redirigir según el rol del usuario
            setTimeout(() => {
                if (data.data.user.rol === 'admin') {
                    // Si es admin, ir al panel de administración
                    window.location.href = '../index.html';
                } else {
                    // Si es cliente, ir a la tienda pública
                    window.location.href = '../RecirculateLoe/home/home.html';
                }
            }, 1000);
            
        } else {
            // Error de credenciales: activar estados de error
            emailInput.classList.add('input-error');
            passwordInput.classList.add('input-error');
            forgotPasswordLink.classList.add('show');
            showMessage(data.message || 'Credenciales incorrectas', 'error');
        }
        
    } catch (error) {
        console.error('Error en login:', error);
        // También mostrar error visual en caso de fallo de conexión
        emailInput.classList.add('input-error');
        passwordInput.classList.add('input-error');
        showMessage('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        loginBtn.disabled = false;
        loading.style.display = 'none';
    }
});

// Manejar clic en "¿Olvidaste tu contraseña?"
document.getElementById('forgotPasswordBtn').addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    
    if (!email) {
        showMessage('Por favor, ingresa tu correo electrónico primero', 'error');
        return;
    }
    
    // Por ahora solo mostramos un mensaje, luego integraremos con n8n
    showMessage('Funcionalidad de recuperación de contraseña en desarrollo. Próximamente disponible.', 'success');
    
    // TODO: Aquí se integrará con n8n para enviar el email de recuperación
    // sendPasswordResetEmail(email);
});

/**
* 4. FUNCIÓN CALLBACK DE GOOGLE
* Esta función es llamada por el script de Google cuando el usuario inicia sesión.
*/
async function handleGoogleLogin(response) {
    const googleToken = response.credential; // Este es el ID Token de Google
    
    // Muestra "Iniciando sesión..."
    const loading = document.getElementById('loading');
    const messageDiv = document.getElementById('message');
    if (loading) loading.style.display = 'block';
    
    try {
        // Envía el token de Google a tu backend para verificación
        const res = await fetch(`${API_BASE_URL}/auth/google-signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: googleToken })
        });

        const data = await res.json();

        if (data.success) {
            // ¡Éxito! El backend verificó a Google y te dio su PROPIO token
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('userData', JSON.stringify(data.data.user));
            
            showMessage('¡Login exitoso! Redirigiendo...', 'success');
            
            setTimeout(() => {
                if (data.data.user.rol === 'admin') {
                    // Si es admin, ir al panel de administración
                    window.location.href = '../index.html';
                } else {
                    // Si es cliente, ir a la tienda pública
                    window.location.href = '../RecirculateLoe/home/home.html';
                }
            }, 1000);
            
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

// TODO: Función para enviar email de recuperación de contraseña (implementar con n8n)
async function sendPasswordResetEmail(email) {
    try {
        // Endpoint que se conectará con n8n para enviar el email
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Se ha enviado un correo para restablecer tu contraseña', 'success');
        } else {
            showMessage(data.message || 'Error al enviar el correo', 'error');
        }
    } catch (error) {
        console.error('Error enviando email de recuperación:', error);
        showMessage('Error al enviar el correo de recuperación', 'error');
    }
}

// Exportar funciones globalmente
window.logout = logout;
window.getUserData = getUserData;
window.isAdmin = isAdmin;
window.getAuthToken = getAuthToken;