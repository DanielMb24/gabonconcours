const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const Candidat = require('../models/Candidat');
const {getConnection} = require('../config/database');

// PUT /api/document-validation/:id - Valider/Rejeter un document avec notification
router.put('/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const {statut, commentaire, admin_id} = req.body;

        console.log('📋 Validation document ID:', id, 'Statut:', statut, 'Commentaire:', commentaire);

        // Valider le statut
        if (!['valide', 'rejete'].includes(statut)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide. Utilisez "valide" ou "rejete"'
            });
        }

        const connection = getConnection();

        // Récupérer le document avec les infos du candidat
        const [documentRows] = await connection.execute(`
      SELECT d.*, dos.nipcan, c.nomcan, c.prncan, c.maican, c.nupcan
      FROM documents d
      LEFT JOIN dossiers dos ON d.id = dos.document_id
      LEFT JOIN candidats c ON dos.nipcan = c.nupcan
      WHERE d.id = ?
    `, [id]);

        if (documentRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Document non trouvé'
            });
        }

        const document = documentRows[0];
        console.log('📄 Document trouvé:', document.nomdoc);

        // Mettre à jour le statut du document avec commentaire
        await connection.execute(`
      UPDATE documents 
      SET statut = ?, 
          commentaire_validation = ?,
          updated_at = NOW()
      WHERE id = ?
    `, [statut, commentaire || null, id]);

        // Créer une notification pour le candidat si on a les infos du candidat
        if (document.nupcan) {
            const notificationMessage = statut === 'valide'
                ? `Votre document "${document.nomdoc}" a été validé avec succès.`
                : `Votre document "${document.nomdoc}" a été rejeté. ${commentaire ? `Motif: ${commentaire}` : 'Veuillez le corriger et le soumettre à nouveau.'}`;

            try {
                await connection.execute(`
          INSERT INTO notifications (candidat_nupcan, type, titre, message, statut, created_at)
          VALUES (?, ?, ?, ?, ?, NOW())
        `, [
                    document.nupcan,
                    'document_validation',
                    statut === 'valide' ? 'Document validé' : 'Document rejeté',
                    notificationMessage,
                    'non_lu'
                ]);
            } catch (notifError) {
                console.log('Erreur création notification (table peut-être inexistante):', notifError.message);
            }
        }

        res.json({
            success: true,
            message: `Document ${statut} avec succès`,
            data: {
                document_id: id,
                statut: statut,
                candidat_nupcan: document.nupcan,
                notification_sent: !!document.nupcan
            }
        });

    } catch (error) {
        console.error('Erreur validation document:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la validation du document',
            errors: [error.message]
        });
    }
});

// GET /api/document-validation/notifications/:nupcan - Récupérer les notifications d'un candidat
router.get('/notifications/:nupcan', async (req, res) => {
    try {
        const {nupcan} = req.params;
        const connection = getConnection();

        try {
            const [notifications] = await connection.execute(`
        SELECT * FROM notifications 
        WHERE candidat_nupcan = ? 
        ORDER BY created_at DESC
      `, [nupcan]);

            res.json({
                success: true,
                data: notifications
            });
        } catch (dbError) {
            console.log('Table notifications peut-être inexistante:', dbError.message);
            res.json({
                success: true,
                data: []
            });
        }

    } catch (error) {
        console.error('Erreur récupération notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des notifications'
        });
    }
});

// PUT /api/document-validation/notifications/:id/read - Marquer une notification comme lue
router.put('/notifications/:id/read', async (req, res) => {
    try {
        const {id} = req.params;
        const connection = getConnection();

        try {
            await connection.execute(`
        UPDATE notifications 
        SET statut = 'lu', updated_at = NOW()
        WHERE id = ?
      `, [id]);

            res.json({
                success: true,
                message: 'Notification marquée comme lue'
            });
        } catch (dbError) {
            console.log('Table notifications peut-être inexistante:', dbError.message);
            res.json({
                success: true,
                message: 'Notification marquée comme lue'
            });
        }

    } catch (error) {
        console.error('Erreur mise à jour notification:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la notification'
        });
    }
});

module.exports = router;
