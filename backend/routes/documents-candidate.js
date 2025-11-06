const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getConnection } = require('../config/database');
const Document = require('../models/Document');
const { sendEmail } = require('../services/emailService');

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/documents');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers PDF, JPG, JPEG et PNG sont acceptés'));
        }
    }
});

// ✅ Remplacer un document rejeté (CANDIDAT uniquement)
router.put('/:id/replace', upload.single('file'), async (req, res) => {
    try {
        const connection = getConnection();
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'Aucun fichier fourni'
            });
        }

        // Récupérer le document actuel
        const [documents] = await connection.execute(
            'SELECT * FROM documents WHERE id = ?',
            [id]
        );

        if (documents.length === 0) {
            fs.unlinkSync(file.path);
            return res.status(404).json({
                success: false,
                message: 'Document non trouvé'
            });
        }

        const document = documents[0];

        //  Vérifier que seuls les documents rejetés peuvent être remplacés
        if (document.statut !== 'rejete') {
            fs.unlinkSync(file.path);
            return res.status(400).json({
                success: false,
                message: 'Seuls les documents rejetés peuvent être remplacés'
            });
        }

        // Supprimer l'ancien fichier
        if (document.nom_fichier) {
            const oldFilePath = path.join(__dirname, '../uploads/documents', document.nom_fichier);
            if (fs.existsSync(oldFilePath)) {
                try {
                    fs.unlinkSync(oldFilePath);
                } catch (err) {
                    console.error('Erreur suppression ancien fichier:', err);
                }
            }
        }

        // Mettre à jour le document
        await connection.execute(
            `UPDATE documents 
             SET nom_fichier = ?, 
                 statut = 'en_attente', 
                 commentaire_validation = 'Document remplacé - en attente de validation',
                 updated_at = NOW()
             WHERE id = ?`,
            [file.filename, id]
        );

        console.log(`✅ Document ${id} remplacé avec succès: ${file.filename}`);

        res.json({
            success: true,
            message: 'Document remplacé avec succès',
            data: {
                id: parseInt(id),
                nom_fichier: file.filename,
                statut: 'en_attente'
            }
        });

    } catch (error) {
        console.error('Erreur remplacement document:', error);
        
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors du remplacement du document'
        });
    }
});

// ✅ Ajouter un nouveau document (max 3 supplémentaires)
router.post('/add', upload.single('file'), async (req, res) => {
    try {
        const connection = getConnection();
        const { nupcan, nomdoc, type } = req.body;
        const file = req.file;
const nipcan = nupcan; // Correction possible du paramètre
        if (!file || !nupcan || !nomdoc) {
            if (file) fs.unlinkSync(file.path);
            return res.status(400).json({
                success: false,
                message: 'Fichier, NUPCAN et nom du document requis'
            });
        }

        // Vérifier le nombre de documents du candidat
        const canAdd = await Document.canAddDocument(nupcan);
        if (!canAdd) {
            fs.unlinkSync(file.path);
            return res.status(400).json({
                success: false,
                message: 'Vous avez atteint le maximum de 6 documents'
            });
        }

        // Créer le document
        const doc = await Document.create({
            nomdoc: nomdoc,
            type: type || 'document',
            nom_fichier: file.filename,
            statut: 'en_attente'
        });

        // Récupérer les infos du candidat pour le lier au dossier
        const [candidats] = await connection.execute(
            'SELECT * FROM candidats WHERE nupcan = ?',
            [nupcan]
        );

        if (candidats.length > 0) {
            const candidat = candidats[0];
            
            // Créer l'entrée dans dossiers
            await connection.execute(
                `INSERT INTO dossiers (candidat_id, concours_id, document_id, nipcan, created_at)
                 VALUES (?, ?, ?, ?, NOW())`,
                [candidat.id, candidat.concours_id, doc.id, nipcan]
            );
        }

        res.json({
            success: true,
            message: 'Document ajouté avec succès',
            data: doc
        });

    } catch (error) {
        console.error('Erreur ajout document:', error);
        
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de l\'ajout du document'
        });
    }
});

// ✅ Vérifier si le candidat peut ajouter un document
router.get('/can-add/:nipcan', async (req, res) => {
    try {
        const { nipcan } = req.params;
        const canAdd = await Document.canAddDocument(nipcan);
        const total = await Document.countByNupcan(nipcan);

        res.json({
            success: true,
            data: {
                canAdd,
                total,
                max: 6
            }
        });
    } catch (error) {
        console.error('Erreur vérification:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
