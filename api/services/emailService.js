/**
 * api/services/emailService.js
 * Servicio para envío de emails (recuperación de contraseña)
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        // Configuración para Gmail
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // tu-email@gmail.com
                pass: process.env.EMAIL_APP_PASSWORD // Contraseña de aplicación de Gmail
            }
        });
    }

    // Generar código de verificación de 6 dígitos
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Enviar email de recuperación de contraseña
    async sendPasswordResetEmail(email, verificationCode, userName) {
        const mailOptions = {
            from: {
                name: 'Recirculate',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: '🔐 Recuperación de Contraseña - Recirculate',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #ffd84d; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .code-box { background: white; padding: 20px; margin: 20px 0; text-align: center; border: 2px solid #ffd84d; border-radius: 8px; }
                        .code { font-size: 32px; font-weight: bold; color: #333; letter-spacing: 4px; }
                        .warning { background: #fff3cd; border: 1px solid #ffd84d; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0; color: #333;">🔐 Recuperación de Contraseña</h1>
                            <p style="margin: 10px 0 0 0; color: #555;">Recirculate</p>
                        </div>
                        
                        <div class="content">
                            <h2>Hola ${userName},</h2>
                            
                            <p>Recibimos una solicitud para restablecer tu contraseña. Si fuiste tú, usa el siguiente código:</p>
                            
                            <div class="code-box">
                                <div class="code">${verificationCode}</div>
                                <p style="margin: 10px 0 0 0; color: #666;">Código de verificación</p>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Importante:</strong>
                                <ul style="margin: 10px 0 0 0;">
                                    <li>Este código expira en <strong>15 minutos</strong></li>
                                    <li>Solo funciona una vez</li>
                                    <li>No lo compartas con nadie</li>
                                </ul>
                            </div>
                            
                            <p><strong>¿No fuiste tú?</strong><br>
                            Si no solicitaste este cambio, ignora este email. Tu contraseña permanecerá segura.</p>
                            
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                            
                            <p>
                                <strong>¿Necesitas ayuda?</strong><br>
                                Contáctanos en <a href="mailto:soporte@recirculate.com">soporte@recirculate.com</a>
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} Recirculate - Tienda de Ropa Sustentable</p>
                            <p>Este es un email automático, por favor no respondas.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email de recuperación enviado a: ${email}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error enviando email:', error);
            return { success: false, error: error.message };
        }
    }

    // Enviar email de bienvenida (opcional)
    async sendWelcomeEmail(email, userName) {
        const mailOptions = {
            from: {
                name: 'Recirculate',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: '🎉 ¡Bienvenido a Recirculate!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: #ffd84d; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0; color: #333;">¡Bienvenido a Recirculate! 🎉</h1>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2>Hola ${userName},</h2>
                        <p>Tu cuenta ha sido creada exitosamente. ¡Ya puedes comenzar a explorar nuestra tienda de ropa sustentable!</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://recirculate.onrender.com/RecirculateLoe/home/home.html" 
                               style="background: #ffd84d; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                                🛒 Explorar Tienda
                            </a>
                        </div>
                        
                        <p>Gracias por unirte a nuestra comunidad sustentable.</p>
                        <p><strong>El equipo de Recirculate</strong></p>
                    </div>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email de bienvenida enviado a: ${email}`);
        } catch (error) {
            console.error('❌ Error enviando email de bienvenida:', error);
        }
    }
}

module.exports = new EmailService();