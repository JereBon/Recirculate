// models/MercadoPago.js - Modelos de MercadoPago para PostgreSQL
const { client } = require('../database');

class MPPreference {
  // Crear nueva preferencia
  static async create(preferenceData) {
    try {
      const {
        preference_id,
        items,
        sandbox_init_point,
        usuario_id
      } = preferenceData;

      const query = `
        INSERT INTO mp_preferencias (
          preference_id, items, sandbox_init_point, usuario_id
        ) VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const values = [preference_id, JSON.stringify(items), sandbox_init_point, usuario_id];
      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creando preferencia MP:', error);
      throw error;
    }
  }

  // Obtener preferencia por ID
  static async findByPreferenceId(preference_id) {
    try {
      const result = await client.query(
        'SELECT * FROM mp_preferencias WHERE preference_id = $1', 
        [preference_id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error obteniendo preferencia MP:', error);
      throw error;
    }
  }

  // Actualizar status de preferencia
  static async updateStatus(preference_id, status) {
    try {
      const query = `
        UPDATE mp_preferencias 
        SET status = $2, fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE preference_id = $1
        RETURNING *
      `;

      const result = await client.query(query, [preference_id, status]);
      return result.rows[0];
    } catch (error) {
      console.error('Error actualizando preferencia MP:', error);
      throw error;
    }
  }

  // Obtener todas las preferencias de un usuario
  static async findByUserId(usuario_id) {
    try {
      const result = await client.query(
        'SELECT * FROM mp_preferencias WHERE usuario_id = $1 ORDER BY fecha_creacion DESC',
        [usuario_id]
      );
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo preferencias de usuario:', error);
      throw error;
    }
  }
}

class MPPayment {
  // Crear nuevo pago
  static async create(paymentData) {
    try {
      const {
        payment_id,
        preference_id,
        status,
        status_detail,
        payment_type,
        payment_method,
        amount,
        currency,
        payer_email,
        external_reference,
        notification_data,
        fecha_pago
      } = paymentData;

      const query = `
        INSERT INTO mp_pagos (
          payment_id, preference_id, status, status_detail, payment_type,
          payment_method, amount, currency, payer_email, external_reference,
          notification_data, fecha_pago
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const values = [
        payment_id, preference_id, status, status_detail, payment_type,
        payment_method, amount, currency, payer_email, external_reference,
        JSON.stringify(notification_data), fecha_pago
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creando pago MP:', error);
      throw error;
    }
  }

  // Obtener pago por ID
  static async findByPaymentId(payment_id) {
    try {
      const result = await client.query(
        'SELECT * FROM mp_pagos WHERE payment_id = $1',
        [payment_id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error obteniendo pago MP:', error);
      throw error;
    }
  }

  // Obtener pagos por preferencia
  static async findByPreferenceId(preference_id) {
    try {
      const result = await client.query(
        'SELECT * FROM mp_pagos WHERE preference_id = $1 ORDER BY fecha_creacion DESC',
        [preference_id]
      );
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo pagos de preferencia:', error);
      throw error;
    }
  }

  // Actualizar status del pago
  static async updateStatus(payment_id, status, status_detail = null) {
    try {
      const query = `
        UPDATE mp_pagos 
        SET status = $2, status_detail = $3
        WHERE payment_id = $1
        RETURNING *
      `;

      const result = await client.query(query, [payment_id, status, status_detail]);
      return result.rows[0];
    } catch (error) {
      console.error('Error actualizando pago MP:', error);
      throw error;
    }
  }

  // Obtener todos los pagos aprobados
  static async findApproved() {
    try {
      const result = await client.query(
        "SELECT * FROM mp_pagos WHERE status = 'approved' ORDER BY fecha_pago DESC"
      );
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo pagos aprobados:', error);
      throw error;
    }
  }
}

module.exports = {
  MPPreference,
  MPPayment
};