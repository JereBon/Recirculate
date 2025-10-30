# CONFIGURACIÓN PARA RENDER - Variables de Entorno Requeridas
# ============================================================

# 🔄 COPIAR ESTAS VARIABLES EN RENDER:
# Dashboard → Tu servicio → Environment → Environment Variables

# 📦 VARIABLES EXISTENTES (MANTENER):
# DATABASE_URL=postgresql://usuario:password@host:5432/database_name
# JWT_SECRET=tu_jwt_secret_actual
# CLOUDINARY_CLOUD_NAME=dxbnsejc3
# CLOUDINARY_API_KEY=828735447394297
# CLOUDINARY_API_SECRET=OckFF-q-tzi-5vUvo3_3fc4OONI
# NODE_ENV=production
# PORT=3001

# 💳 NUEVAS VARIABLES DE MERCADOPAGO:
MERCADOPAGO_PUBLICKEY=APP_USR-22363873-f02f-4d5a-a5e1-ec7469d0a729
MP_ACCESS_TOKEN=APP_USR-4632063194064994-101418-1f4b1074d524fe00457d0a3a3dc02df3-2926020563

# 🌐 URLs DE RETORNO (ACTUALIZAR CON TU DOMINIO DE RENDER):
MP_SUCCESS_URL=https://TU-DOMINIO.onrender.com/success
MP_FAILURE_URL=https://TU-DOMINIO.onrender.com/failure
MP_PENDING_URL=https://TU-DOMINIO.onrender.com/pending

# 📝 INSTRUCCIONES:
# 1. Ve a Render Dashboard → Tu servicio → Environment
# 2. Agrega cada variable con su valor
# 3. Reemplaza "TU-DOMINIO" con tu URL real de Render
# 4. Haz Deploy manual para aplicar cambios

# ✅ FUNCIONALIDADES INCLUIDAS:
# - Sistema de autenticación completo (6 admins)
# - Gestión de productos con proveedor
# - Sistema de pagos MercadoPago
# - Gestión de ventas y gastos
# - Base de datos PostgreSQL optimizada