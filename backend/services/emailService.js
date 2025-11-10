const nodemailer = require('nodemailer');
const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

class EmailService {

    // Méthode générique pour envoyer un email via Brevo API
    async sendTransactionalEmail({ to, subject, htmlContent, attachments = [] }) {
        try {
            const sendSmtpEmail = {
                sender: { name: 'GABConcours', email: process.env.EMAIL_FROM },
                to: [{ email: to }],
                subject,
                htmlContent,
                attachment: attachments.length > 0 ? attachments : undefined
            };
            const response = await tranEmailApi.sendTransacEmail(sendSmtpEmail);
            console.log(`📩 Email envoyé à ${to} | ID: ${response.messageId}`);
            return { success: true, messageId: response.messageId };
        } catch (error) {
            console.error('❌ Erreur envoi email via Brevo API:', error.response?.body || error.message);
            return { success: false, message: error.message };
        }
    }

    // Envoi des identifiants à un nouvel admin
    async sendAdminCredentials(adminData) {
        return this.sendTransactionalEmail({
            to: adminData.email,
            subject: 'Vos identifiants administrateur - Plateforme Concours',
            htmlContent: `
                <h2>Bienvenue sur la plateforme de gestion des concours</h2>
                <p>Bonjour ${adminData.prenom} ${adminData.nom},</p>
                <p>Votre compte administrateur a été créé avec succès :</p>
                <ul>
                    <li><strong>Email :</strong> ${adminData.email}</li>
                    <li><strong>Mot de passe temporaire :</strong> ${adminData.temp_password}</li>
                    <li><strong>Établissement :</strong> ${adminData.etablissement_nom || 'À définir'}</li>
                </ul>
                <p><strong>Important :</strong> Changez votre mot de passe lors de votre première connexion.</p>
                <p><a href="${process.env.FRONTEND_URL}/admin/login">Connexion Admin</a></p>
            `
        });
    }

    // Envoi des identifiants sub-admin
    async sendSubAdminCredentials({ to, nom, prenom, tempPassword, etablissement, role }) {
        return this.sendTransactionalEmail({
            to,
            subject: 'Vos identifiants d\'accès - GabConcours',
            htmlContent: `
                <h2>Bonjour ${prenom} ${nom}</h2>
                <p>Vous avez été ajouté en tant que sous-administrateur pour l'établissement <strong>${etablissement}</strong>.</p>
                <ul>
                    <li><strong>Email :</strong> ${to}</li>
                    <li><strong>Mot de passe temporaire :</strong> ${tempPassword}</li>
                    <li><strong>Rôle :</strong> ${role === 'notes' ? 'Gestion des Notes' : 'Gestion des Documents'}</li>
                </ul>
                <p>Veuillez changer votre mot de passe à la première connexion.</p>
                <p><a href="${process.env.APP_URL}/admin/login">Se connecter</a></p>
            `
        });
    }

    // Confirmation inscription candidat
    async sendRegistrationConfirmation(candidat) {
        return this.sendTransactionalEmail({
            to: candidat.maican,
            subject: 'Confirmation d\'inscription - Plateforme Concours',
            htmlContent: `
                <h2>Bonjour ${candidat.prncan} ${candidat.nomcan}</h2>
                <p>Votre candidature a été créée avec succès. Continuez le téléversement des documents.</p>
                <ul>
                    <li><strong>Email :</strong> ${candidat.maican}</li>
                    <li><strong>NUPCAN :</strong> ${candidat.nupcan}</li>
                </ul>
            `
        });
    }

    // Envoi reçu PDF / image
    async sendReceiptEmail(candidatData, type = 'pdf') {
        const attachments = type === 'image' && candidatData.imageData ? [{
            filename: `recu-${candidatData.nupcan}.png`,
            content: candidatData.imageData,
            encoding: 'base64',
            contentType: 'image/png'
        }] : [];

        return this.sendTransactionalEmail({
            to: candidatData.maican,
            subject: `Reçu de candidature - ${candidatData.nupcan}`,
            htmlContent: `
                <h2>Reçu de candidature</h2>
                <p>Bonjour ${candidatData.prncan} ${candidatData.nomcan},</p>
                <ul>
                    <li><strong>NUPCAN :</strong> ${candidatData.nupcan}</li>
                    <li><strong>Concours :</strong> ${candidatData.libcnc || 'À sélectionner'}</li>
                    <li><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
                </ul>
                <p>Conservez ce reçu précieusement.</p>
            `,
            attachments
        });
    }

    // Notification validation/rejet document
    async sendDocumentValidation(candidat, document, statut, commentaire) {
        const isApproved = statut === 'valide';
        const color = isApproved ? '#059669' : '#dc2626';
        return this.sendTransactionalEmail({
            to: candidat.maican,
            subject: `Document ${isApproved ? 'Validé' : 'Rejeté'} - GabConcours`,
            htmlContent: `
                <h2 style="color:${color}">Document ${isApproved ? 'Validé' : 'Rejeté'}</h2>
                <p>Bonjour ${candidat.prncan} ${candidat.nomcan},</p>
                <p>Votre document <strong>${document.nomdoc}</strong> a été ${isApproved ? 'validé' : 'rejeté'}.</p>
                ${commentaire ? `<p><strong>Commentaire :</strong> ${commentaire}</p>` : ''}
                ${!isApproved ? `<p style="color:#dc2626">Veuillez soumettre un document corrigé.</p>` : ''}
            `
        });
    }

    // Confirmation paiement
    async sendPaymentConfirmation(candidat, paiement) {
        return this.sendTransactionalEmail({
            to: candidat.maican,
            subject: 'Confirmation de paiement - GabConcours',
            htmlContent: `
                <h2>Paiement Confirmé</h2>
                <p>Bonjour ${candidat.prncan} ${candidat.nomcan},</p>
                <ul>
                    <li><strong>Montant :</strong> ${paiement.montant} FCFA</li>
                    <li><strong>Méthode :</strong> ${paiement.methode}</li>
                    <li><strong>Référence :</strong> ${paiement.reference_paiement}</li>
                    <li><strong>Date :</strong> ${new Date(paiement.created_at).toLocaleString('fr-FR')}</li>
                </ul>
                <p>Votre candidature est maintenant complète.</p>
            `
        });
    }

    // Candidature validée
    async sendCandidatureValidated(candidat) {
        return this.sendTransactionalEmail({
            to: candidat.maican,
            subject: '🎉 Candidature validée - GabConcours',
            htmlContent: `
                <h2>Félicitations ${candidat.prncan} ${candidat.nomcan} !</h2>
                <p>Votre candidature a été entièrement validée.</p>
                <ul>
                    <li>Statut : VALIDE</li>
                    <li>Consultez votre dashboard pour suivre les étapes suivantes</li>
                </ul>
                <p><a href="${process.env.APP_URL}/dashboard/${candidat.nupcan}">Accéder à mon dashboard</a></p>
            `
        });
    }
}

module.exports = new EmailService();
