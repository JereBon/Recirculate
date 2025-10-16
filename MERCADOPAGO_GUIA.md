/* 
Como funciona mp

1. CREAR PREFERENCIA DE PAGO:
-----------------------------
POST /api/pagos/preferencia
Headers: Authorization: Bearer [JWT_TOKEN]

Body:
{
  "items": [
    {
      "title": "Remera Nike",
      "quantity": 1,
      "unit_price": 25000,
      "currency_id": "ARS"
    }
  ],
  "external_reference": "orden_12345"
}

Response:
{
  "preference_id": "123456789-abc123-def456",
  "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789-abc123-def456"
}

2. OBTENER ESTADO DE PAGO:
--------------------------
GET /api/pagos/{payment_id}
Headers: Authorization: Bearer [JWT_TOKEN]

3. OBTENER HISTORIAL DE PAGOS DEL USUARIO:
------------------------------------------
GET /api/pagos/usuario/historial  
Headers: Authorization: Bearer [JWT_TOKEN]

4. WEBHOOKS (AUTOMÁTICO):
------------------------
POST /api/pagos/notificaciones
- MercadoPago envía notificaciones automáticamente
- Se guardan en las tablas mp_preferencias y mp_pagos

5. PÁGINAS DE RESULTADO:
-----------------------
- /success - Pago exitoso
- /failure - Pago fallido  
- /pending - Pago pendiente

6. ESTRUCTURA DE BASE DE DATOS:
------------------------------
- mp_preferencias: Almacena las preferencias creadas
- mp_pagos: Almacena los pagos procesados con detalles completos

7. VARIABLES DE ENTORNO NECESARIAS:
----------------------------------
- MERCADOPAGO_PUBLICKEY: Clave pública de MP (frontend)
- MP_ACCESS_TOKEN: Token de acceso de MP (backend)
- MP_SUCCESS_URL, MP_FAILURE_URL, MP_PENDING_URL: URLs de retorno
*/