// assets/user-menu.js - Sistema de menú de usuario y historial de visitas

class UserMenuManager {
    constructor() {
        this.userMenu = null;
        this.isLoggedIn = false;
        this.currentUser = null;
        this.visitHistory = [];
        this.maxHistoryItems = 5;
        
        this.init();
    }

    init() {
        // Verificar si el usuario está logueado
        this.checkLoginStatus();
        
        if (this.isLoggedIn) {
            // Crear el menú de usuario
            this.createUserMenu();
            // Cargar historial desde localStorage
            this.loadVisitHistory();
            // Configurar event listeners
            this.setupEventListeners();
        }
    }

    checkLoginStatus() {
        // Verificar token JWT en localStorage
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
            try {
                // Verificar que el token no haya expirado
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Date.now() / 1000;
                
                if (payload.exp > currentTime) {
                    this.isLoggedIn = true;
                    this.currentUser = JSON.parse(userData);
                    return;
                }
            } catch (error) {
                console.error('Error verificando token:', error);
            }
        }
        
        // Si llegamos aquí, no está logueado o el token expiró
        this.isLoggedIn = false;
        this.clearUserData();
    }

    createUserMenu() {
        // Encontrar el ícono de usuario
        const userIcon = document.querySelector('.user-icon');
        if (!userIcon) return;

        // Cambiar el ícono y remover el link de login
        userIcon.href = 'javascript:void(0);';
        userIcon.setAttribute('data-tooltip', 'MI CUENTA');
        
        // Crear el menú desplegable
        const menuHTML = `
            <div class="user-menu-dropdown" id="userMenuDropdown">
                <div class="user-menu-header">
                    <h3>¡Hola, ${this.currentUser?.nombre || 'Usuario'}!</h3>
                </div>
                
                <div class="user-menu-options">
                    <a href="../../home/home.html" class="user-menu-option">
                        <i class="fas fa-home"></i>
                        Volver al Inicio
                    </a>
                    <button class="user-menu-option" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        Cerrar Sesión
                    </button>
                </div>
                
                <div class="user-history-section">
                    <h4 class="user-history-title">Historial de Visitas</h4>
                    <div class="history-carousel" id="historyCarousel">
                        <!-- Los productos del historial se cargarán aquí -->
                    </div>
                </div>
            </div>
        `;

        // Agregar el menú al DOM
        const headerRight = userIcon.parentElement;
        headerRight.insertAdjacentHTML('beforeend', menuHTML);
        
        this.userMenu = document.getElementById('userMenuDropdown');
        
        // Actualizar el historial visual
        this.renderVisitHistory();
    }

    setupEventListeners() {
        const userIcon = document.querySelector('.user-icon');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (userIcon) {
            // Toggle del menú al hacer click en el ícono
            userIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleUserMenu();
            });
        }
        
        if (logoutBtn) {
            // Cerrar sesión
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
        
        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (this.userMenu && !this.userMenu.contains(e.target) && !userIcon.contains(e.target)) {
                this.closeUserMenu();
            }
        });
        
        // Cerrar menú con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.userMenu?.classList.contains('active')) {
                this.closeUserMenu();
            }
        });
    }

    toggleUserMenu() {
        if (!this.userMenu) return;
        
        if (this.userMenu.classList.contains('active')) {
            this.closeUserMenu();
        } else {
            this.openUserMenu();
        }
    }

    openUserMenu() {
        if (!this.userMenu) return;
        this.userMenu.classList.add('active');
        // Actualizar historial cada vez que se abre el menú
        this.renderVisitHistory();
    }

    closeUserMenu() {
        if (!this.userMenu) return;
        this.userMenu.classList.remove('active');
    }

    logout() {
        // Limpiar datos del usuario
        this.clearUserData();
        
        // Mostrar mensaje de confirmación
        alert('Has cerrado sesión exitosamente');
        
        // Redirigir al login
        window.location.href = '../../auth/login.html';
    }

    clearUserData() {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('visitHistory');
        this.isLoggedIn = false;
        this.currentUser = null;
        this.visitHistory = [];
    }

    // Métodos para manejo del historial de visitas
    addToVisitHistory(product) {
        if (!this.isLoggedIn || !product) return;
        
        // Remover el producto si ya existe para evitar duplicados
        this.visitHistory = this.visitHistory.filter(item => item.id !== product.id);
        
        // Agregar al inicio del array
        this.visitHistory.unshift({
            id: product.id,
            nombre: product.nombre,
            imagen_url: product.imagen_url,
            precio: product.precio,
            categoria: product.categoria,
            visitedAt: new Date().toISOString()
        });
        
        // Mantener solo los últimos 5 elementos
        if (this.visitHistory.length > this.maxHistoryItems) {
            this.visitHistory = this.visitHistory.slice(0, this.maxHistoryItems);
        }
        
        // Guardar en localStorage
        this.saveVisitHistory();
        
        // Actualizar la visualización si el menú está abierto
        if (this.userMenu?.classList.contains('active')) {
            this.renderVisitHistory();
        }
    }

    loadVisitHistory() {
        if (!this.isLoggedIn) return;
        
        try {
            const saved = localStorage.getItem('visitHistory');
            if (saved) {
                this.visitHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error cargando historial:', error);
            this.visitHistory = [];
        }
    }

    saveVisitHistory() {
        if (!this.isLoggedIn) return;
        
        try {
            localStorage.setItem('visitHistory', JSON.stringify(this.visitHistory));
        } catch (error) {
            console.error('Error guardando historial:', error);
        }
    }

    renderVisitHistory() {
        const carousel = document.getElementById('historyCarousel');
        if (!carousel) return;
        
        if (this.visitHistory.length === 0) {
            carousel.innerHTML = `
                <div class="history-empty">
                    No has visitado productos aún
                </div>
            `;
            return;
        }
        
        carousel.innerHTML = this.visitHistory.map(item => `
            <a href="#" class="history-item" onclick="userMenuManager.goToProduct('${item.id}', '${item.categoria}')">
                <img src="${item.imagen_url}" alt="${item.nombre}" class="history-item-image">
                <div class="history-item-name">${item.nombre}</div>
                <div class="history-item-price">$${item.precio?.toLocaleString('es-AR')} ARS</div>
            </a>
        `).join('');
    }

    goToProduct(productId, categoria) {
        // Cerrar el menú
        this.closeUserMenu();
        
        // Navegar al producto (esto dependerá de cómo estén estructurados los URLs de productos)
        const productUrl = `../productos/${categoria}/${productId}.html`;
        window.location.href = productUrl;
    }

    // Método público para que otras páginas puedan registrar visitas
    trackProductVisit(product) {
        this.addToVisitHistory(product);
    }
}

// Inicializar el manager cuando el DOM esté listo
let userMenuManager;

document.addEventListener('DOMContentLoaded', function() {
    userMenuManager = new UserMenuManager();
});

// Hacer disponible globalmente para uso en otras páginas
window.userMenuManager = userMenuManager;

// Función de prueba para simular login (solo para testing)
window.testLogin = function() {
    // Simular datos de usuario y token
    const testUser = {
        id: 1,
        nombre: 'Usuario Prueba',
        email: 'test@recirculate.com'
    };
    
    // Crear un token fake (solo para testing)
    const testToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJyZWNpcmN1bGF0ZSIsImlhdCI6MTYzNTQ2NzYwMCwiZXhwIjoyMDAwMDAwMDAwLCJhdWQiOiJyZWNpcmN1bGF0ZS5jb20iLCJzdWIiOiJ0ZXN0QHJlY2lyY3VsYXRlLmNvbSJ9';
    
    // Guardar en localStorage
    localStorage.setItem('token', testToken);
    localStorage.setItem('userData', JSON.stringify(testUser));
    
    // Reinicializar el menú
    location.reload();
};

window.testLogout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('visitHistory');
    location.reload();
};