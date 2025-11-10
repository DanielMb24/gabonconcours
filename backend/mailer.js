const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true', // false pour 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Erreur connexion SMTP:', error.message);
    } else {
        console.log('✅ SMTP prêt à envoyer les emails via Brevo.');
    }
});

async function sendEmail(to, subject, htmlContent, attachments = []) {
    try {
        const mailOptions = {
            from: {
                name: 'GABConcours',
                address: process.env.EMAIL_FROM
            },
            to,
            subject,
            html: htmlContent,
            attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📩 Email envoyé à ${to} | MessageID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Erreur envoi email:', error.message);
        return { success: false, message: error.message };
    }
}

module.exports = { sendEmail };
