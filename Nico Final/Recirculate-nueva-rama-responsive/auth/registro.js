// registro.js - Funcionalidad del formulario de registro
const API_BASE_URL = 'https://recirculate-api.onrender.com/api';

// No se necesita inicializar el formulario ya que los campos de cliente son fijos.

// Manejar envío del formulario
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Asignamos el rol fijo de cliente
    const rol = 'cliente'; 
    
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Campos de cliente
    const telefono = document.getElementById('telefono').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const fechaNacimiento = document.getElementById('fechaNacimiento').value;
    
    const registerBtn = document.getElementById('registerBtn');
    const loading = document.getElementById('loading');
    const messageDiv = document.getElementById('message');
    
    // Validaciones básicas (ahora todos los campos son obligatorios)
    if (!nombre || !email || !password || !confirmPassword || !telefono || !direccion || !fechaNacimiento) {
        showMessage('Por favor, completa todos los campos requeridos', 'error');
        return;
    }
    
    // Validación de edad (cliente)
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    if (age < 18) {
        showMessage('Debes ser mayor de 18 años para registrarte', 'error');
        return;
    }
    
    // Resto de validaciones
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
        
        // Preparar datos del formulario (ROL ES FIJO: 'cliente')
        const userData = { 
            nombre, 
            email, 
            password, 
            rol, // rol: 'cliente'
            telefono,
            direccion,
            fechaNacimiento
        };
        
        const response = await fetch(`${API_BASE_URL}/auth/registro`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('¡Cuenta creada exitosamente! Por favor, inicia sesión.', 'success');
            // Opcional: Redirigir a login
            // setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            
        } else {
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