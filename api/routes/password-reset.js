/**
 * api/routes/password-reset.js
 * Rutas para recuperación de contraseña
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const client = require('../database');
const emailService = require('../services/emailService');

// POST /api/password-reset/request - Solicitar código de recuperación
router.post('/request', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'El email es requerido'
            });
        }

        // Verificar si el usuario existe
        const userResult = await client.query(
            'SELECT id, nombre, email FROM usuarios WHERE email = $1',
            [email.toLowerCase()]
        );

        if (userResult.rows.length === 0) {
            // Por seguridad, no revelar si el email existe o no
            return res.json({
                success: true,
                message: 'Si el email está registrado, recibirás un código de recuperación en breve.'
            });
        }

        const user = userResult.rows[0];

        // Limpiar códigos expirados del usuario
        await client.query(
            'DELETE FROM password_reset_codes WHERE email = $1 AND (expira_en < NOW() OR usado = true)',
            [email.toLowerCase()]
        );

        // Generar nuevo código de 6 dígitos
        const verificationCode = emailService.generateVerificationCode();
        
        // Código expira en 15 minutos
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Guardar código en la base de datos
        await client.query(
            'INSERT INTO password_reset_codes (email, codigo, expira_en) VALUES ($1, $2, $3)',
            [email.toLowerCase(), verificationCode, expiresAt]
        );

        // Enviar email
        const emailResult = await emailService.sendPasswordResetEmail(
            email, 
            verificationCode, 
            user.nombre
        );

        if (!emailResult.success) {
            throw new Error('Error enviando email');
        }

        console.log(`🔐 Código de recuperación generado para: ${email}`);

        res.json({
            success: true,
            message: 'Código de recuperación enviado a tu email. Revisa tu bandeja de entrada.'
        });

    } catch (error) {
        console.error('❌ Error en solicitud de recuperación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// POST /api/password-reset/verify - Verificar código y cambiar contraseña
router.post('/verify', async (req, res) => {
    try {
        const { email, codigo, nuevaPassword } = req.body;

        if (!email || !codigo || !nuevaPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, código y nueva contraseña son requeridos'
            });
        }

        // Validar nueva contraseña
        if (nuevaPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(nuevaPassword)) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe contener al menos una letra y un número'
            });
        }

        // Verificar código
        const codeResult = await client.query(
            'SELECT * FROM password_reset_codes WHERE email = $1 AND codigo = $2 AND expira_en > NOW() AND usado = false',
            [email.toLowerCase(), codigo]
        );

        if (codeResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Código inválido, expirado o ya utilizado'
            });
        }

        // Verificar que el usuario existe
        const userResult = await client.query(
            'SELECT id FROM usuarios WHERE email = $1',
            [email.toLowerCase()]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const userId = userResult.rows[0].id;

        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

        // Actualizar contraseña del usuario
        await client.query(
            'UPDATE usuarios SET password = $1 WHERE id = $2',
            [hashedPassword, userId]
        );

        // Marcar código como usado
        await client.query(
            'UPDATE password_reset_codes SET usado = true WHERE email = $1 AND codigo = $2',
            [email.toLowerCase(), codigo]
        );

        console.log(`✅ Contraseña actualizada para: ${email}`);

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
        });

    } catch (error) {
        console.error('❌ Error verificando código:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// GET /api/password-reset/validate-code - Solo validar código sin cambiar contraseña
router.post('/validate-code', async (req, res) => {
    try {
        const { email, codigo } = req.body;

        if (!email || !codigo) {
            return res.status(400).json({
                success: false,
                message: 'Email y código son requeridos'
            });
        }

        // Verificar código
        const codeResult = await client.query(
            'SELECT expira_en FROM password_reset_codes WHERE email = $1 AND codigo = $2 AND expira_en > NOW() AND usado = false',
            [email.toLowerCase(), codigo]
        );

        if (codeResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Código inválido, expirado o ya utilizado'
            });
        }

        const expiresAt = new Date(codeResult.rows[0].expira_en);
        const timeLeft = Math.ceil((expiresAt - new Date()) / 1000 / 60); // minutos restantes

        res.json({
            success: true,
            message: 'Código válido',
            timeLeft: timeLeft
        });

    } catch (error) {
        console.error('❌ Error validando código:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;