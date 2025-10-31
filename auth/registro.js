// registro.js - Funcionalidad del formulario de registro avanzada con UX mejorada
const API_BASE_URL = 'https://recirculate-api.onrender.com/api';

// Inicializar formulario y lógica de roles
document.addEventListener('DOMContentLoaded', () => {
    // Manejar cambio de rol
    const rolSelect = document.getElementById('rol');
    const adminNote = document.getElementById('adminNote');
    const tokenGroup = document.getElementById('tokenGroup');
    const adminTokenInput = document.getElementById('adminToken');
    const clientFields = document.querySelectorAll('[id^="clientFields"]');
    const telefonoInput = document.getElementById('telefono');
    const direccionInput = document.getElementById('direccion');
    const fechaNacimientoInput = document.getElementById('fechaNacimiento');

    rolSelect.addEventListener('change', () => {
        if (rolSelect.value === 'admin') {
            adminNote.style.display = 'block';
            tokenGroup.style.display = 'block';
            adminTokenInput.required = true;
            // Ocultar campos de cliente para admin
            clientFields.forEach(field => field.style.display = 'none');
            telefonoInput.required = false;
            direccionInput.required = false;
            fechaNacimientoInput.required = false;
        } else {
            adminNote.style.display = 'none';
            tokenGroup.style.display = 'none';
            adminTokenInput.required = false;
            adminTokenInput.value = '';
            // Mostrar campos de cliente
            clientFields.forEach(field => field.style.display = 'block');
            telefonoInput.required = true;
            direccionInput.required = true;
            fechaNacimientoInput.required = true;
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
    const adminToken = document.getElementById('adminToken').value;
    const telefono = document.getElementById('telefono').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const fechaNacimiento = document.getElementById('fechaNacimiento').value;
    const registerBtn = document.getElementById('registerBtn');
    const loading = document.getElementById('loading');
    const messageDiv = document.getElementById('message');

    // Validaciones básicas
    if (!nombre || !email || !password || !confirmPassword) {
        showMessage('Por favor, completa todos los campos', 'error');
        return;
    }
    // Validaciones específicas para clientes
    if (rol === 'cliente') {
        if (!telefono || !direccion || !fechaNacimiento) {
            showMessage('Por favor, completa todos los campos de cliente', 'error');
            return;
        }
        // Validar que sea mayor de 18 años
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
    }
    // Validación del token de administrador
    if (rol === 'admin') {
        if (!adminToken) {
            showMessage('Se requiere el token de administrador', 'error');
            return;
        }
        if (adminToken !== '676767') {
            showMessage('Sin el token no se puede registrar como administrador', 'error');
            return;
        }
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
        // Preparar datos del formulario
        const userData = { nombre, email, password, rol };
        if (rol === 'cliente') {
            userData.telefono = telefono;
            userData.direccion = direccion;
            userData.fechaNacimiento = fechaNacimiento;
        }
        if (rol === 'admin') {
            userData.adminToken = adminToken;
        }
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