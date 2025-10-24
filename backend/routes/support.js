const express = require('express');
const router = express.Router();
const SupportRequest = require('../models/SupportRequest');
const { sendEmail } = require('../services/emailService');

// Créer une demande de support
router.post('/requests', async (req, res) => {
    try {
        const { candidat_nupcan, email, nom, sujet, message, priorite } = req.body;
        
        if (!email || !nom || !sujet || !message) {
            return res.status(400).json({
                success: false,
                message: 'Email, nom, sujet et message requis'
            });
        }
        
        const request = await SupportRequest.create({
            candidat_nupcan,
            email,
            nom,
            sujet,
            message,
            priorite: priorite || 'normale'
        });
        
        // Envoyer email de confirmation au client
        try {
            await sendEmail(
                email,
                'Votre demande de support a été reçue',
                `
                <h2>Demande de support reçue</h2>
                <p>Bonjour ${nom},</p>
                <p>Nous avons bien reçu votre demande de support concernant:</p>
                <p><strong>${sujet}</strong></p>
                <p>Notre équipe va traiter votre demande dans les plus brefs délais.</p>
                <p>Numéro de référence: #${request.id}</p>
                <p>Cordialement,<br>L'équipe GabConcours</p>
                `
            );
        } catch (emailError) {
            console.error('Erreur envoi email confirmation:', emailError);
        }
        
        // Notifier les super admins
        try {
            await sendEmail(
                process.env.SMTP_USER || 'admin@gabconcours.ga',
                `Nouvelle demande de support #${request.id}`,
                `
                <h2>Nouvelle demande de support</h2>
                <p><strong>De:</strong> ${nom} (${email})</p>
                <p><strong>Sujet:</strong> ${sujet}</p>
                <p><strong>Priorité:</strong> ${priorite || 'normale'}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <p><a href="${process.env.APP_URL || 'http://localhost:3001'}/super-admin/support/${request.id}">Voir la demande</a></p>
                `
            );
        } catch (emailError) {
            console.error('Erreur notification admin:', emailError);
        }
        
        res.json({
            success: true,
            message: 'Demande de support créée avec succès',
            data: request
        });
    } catch (error) {
        console.error('Erreur création demande support:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Récupérer toutes les demandes (super admin)
router.get('/requests', async (req, res) => {
    try {
        const filters = {
            statut: req.query.statut,
            priorite: req.query.priorite,
            assigned_to: req.query.assigned_to
        };
        
        const requests = await SupportRequest.findAll(filters);
        
        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Erreur récupération demandes:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Récupérer une demande spécifique
router.get('/requests/:id', async (req, res) => {
    try {
        const request = await SupportRequest.findById(req.params.id);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Demande non trouvée'
            });
        }
        
        const responses = await SupportRequest.getResponses(req.params.id);
        
        res.json({
            success: true,
            data: {
                ...request,
                responses
            }
        });
    } catch (error) {
        console.error('Erreur récupération demande:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Mettre à jour une demande
router.put('/requests/:id', async (req, res) => {
    try {
        const { statut, priorite, assigned_to } = req.body;
        
        const request = await SupportRequest.update(req.params.id, {
            statut,
            priorite,
            assigned_to
        });
        
        res.json({
            success: true,
            message: 'Demande mise à jour avec succès',
            data: request
        });
    } catch (error) {
        console.error('Erreur mise à jour demande:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Répondre à une demande
router.post('/requests/:id/responses', async (req, res) => {
    try {
        const { admin_id, message, is_internal_note } = req.body;
        
        if (!admin_id || !message) {
            return res.status(400).json({
                success: false,
                message: 'admin_id et message requis'
            });
        }
        
        const request = await SupportRequest.findById(req.params.id);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Demande non trouvée'
            });
        }
        
        const response = await SupportRequest.addResponse({
            support_request_id: req.params.id,
            admin_id,
            message,
            is_internal_note: is_internal_note || false
        });
        
        // Si ce n'est pas une note interne, envoyer email au client
        if (!is_internal_note) {
            try {
                await sendEmail(
                    request.email,
                    `Réponse à votre demande #${request.id}`,
                    `
                    <h2>Nouvelle réponse à votre demande</h2>
                    <p>Bonjour ${request.nom},</p>
                    <p>Vous avez reçu une réponse concernant votre demande:</p>
                    <p><strong>Sujet:</strong> ${request.sujet}</p>
                    <p><strong>Réponse:</strong></p>
                    <p>${message}</p>
                    <p>Numéro de référence: #${request.id}</p>
                    <p>Cordialement,<br>L'équipe GabConcours</p>
                    `
                );
            } catch (emailError) {
                console.error('Erreur envoi email:', emailError);
            }
        }
        
        // Mettre à jour le statut
        await SupportRequest.update(req.params.id, { statut: 'en_cours' });
        
        res.json({
            success: true,
            message: 'Réponse ajoutée avec succès',
            data: response
        });
    } catch (error) {
        console.error('Erreur ajout réponse:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Récupérer les réponses d'une demande
router.get('/requests/:id/responses', async (req, res) => {
    try {
        const responses = await SupportRequest.getResponses(req.params.id);
        
        res.json({
            success: true,
            data: responses
        });
    } catch (error) {
        console.error('Erreur récupération réponses:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
