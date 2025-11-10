const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

// Configuration API Brevo
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Envoi d'un email via Brevo API
 * @param {string} to - destinataire
 * @param {string} subject - objet
 * @param {string} htmlContent - contenu HTML
 */
async function sendEmail(to, subject, htmlContent) {
    try {
        const sendSmtpEmail = {
            sender: { name: 'GABConcours', email: process.env.EMAIL_FROM },
            to: [{ email: to }],
            subject,
            htmlContent
        };

        const response = await tranEmailApi.sendTransacEmail(sendSmtpEmail);
        console.log(`📩 Email envoyé à ${to} | ID: ${response.messageId}`);
        return { success: true, messageId: response.messageId };
    } catch (error) {
        console.error('❌ Erreur envoi email via API Brevo:', error.response?.body || error.message);
        return { success: false, message: error.message };
    }
}

module.exports = { sendEmail };
