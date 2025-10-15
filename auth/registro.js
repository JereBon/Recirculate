// registro.js - Funcionalidad del formulario de registro
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
    
    // Manejar cambio de rol
    const rolSelect = document.getElementById('rol');
    const adminNote = document.getElementById('adminNote');
    
    rolSelect.addEventListener('change', () => {
        if (rolSelect.value === 'admin') {
            adminNote.style.display = 'block';
        } else {
            adminNote.style.display = 'none';
        }
    });
});

// Manejar envío del formulario
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const rol = document.getElementById('rol').value;
    
    const registerBtn = document.getElementById('registerBtn');
    const loading = document.getElementById('loading');
    const messageDiv = document.getElementById('message');
    
    // Validaciones básicas
    if (!nombre || !email || !password || !confirmPassword) {
        showMessage('Por favor, completa todos los campos', 'error');
        return;
    }
    
    if (nombre.length < 2 || nombre.length > 50) {
        showMessage('El nombre debe tener entre 2 y 50 caracteres', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
        showMessage('La contraseña debe contener al menos una letra y un número', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Por favor, ingresa un email válido', 'error');
        return;
    }
    
    // Mostrar loading
    registerBtn.disabled = true;
    loading.style.display = 'block';
    messageDiv.innerHTML = '';
    
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Si intenta crear admin, incluir token si existe
        if (rol === 'admin') {
            const token = localStorage.getItem('authToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        const response = await fetch(`${API_BASE_URL}/auth/registro`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ 
                nombre, 
                email, 
                password, 
                rol 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar token y datos del usuario
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('userData', JSON.stringify(data.data.user));
            
            showMessage('¡Cuenta creada exitosamente! Redirigiendo...', 'success');
            
            // Redirigir después de 1.5 segundos
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
            
        } else {
            // Mostrar errores específicos
            if (data.errors && data.errors.length > 0) {
                const errorMessages = data.errors.map(err => err.msg).join('<br>');
                showMessage(errorMessages, 'error');
            } else {
                showMessage(data.message || 'Error al crear la cuenta', 'error');
            }
        }
        
    } catch (error) {
        console.error('Error en registro:', error);
        showMessage('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        registerBtn.disabled = false;
        loading.style.display = 'none';
    }
});

// Función para mostrar mensajes
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="${type}-message">${message}</div>`;
}

// Función para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

// Validación en tiempo real de coincidencia de contraseñas
document.getElementById('confirmPassword').addEventListener('input', () => {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword && password !== confirmPassword) {
        confirmInput.style.borderColor = '#c33';
    } else {
        confirmInput.style.borderColor = '#ddd';
    }
});