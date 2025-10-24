const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { getConnection } = require('../config/database');
const Document = require('../models/Document');

// 📂 Dossier de stockage
const uploadDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ⚙️ Config multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `doc-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});
const upload = multer({ storage });

/* =====================================================
   🔹 ROUTES DOCUMENTS CRUD DE BASE
===================================================== */

// ➕ Ajouter un document
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const { nomdoc, type } = req.body;
        const file = req.file;
        if (!file) return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });

        const documentData = {
            nomdoc: nomdoc || file.originalname,
            type: type || file.mimetype.includes('pdf') ? 'pdf' : 'image',
            nom_fichier: file.filename,
            statut: 'en_attente'
        };

        const newDoc = await Document.create(documentData);
        res.json({ success: true, message: 'Document créé', data: newDoc });
    } catch (error) {
        console.error('Erreur création document:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// 📄 Récupérer tous les documents
router.get('/', async (req, res) => {
    try {
        const documents = await Document.findAll();
        res.json({ success: true, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// 📄 Récupérer un document par ID
router.get('/:id', async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document introuvable' });
        res.json({ success: true, data: doc });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

/* =====================================================
   ✏️ MODIFICATION ET STATUT
===================================================== */

// 🔄 Modifier les infos d’un document
router.put('/:id', async (req, res) => {
    try {
        const { nomdoc, type, statut, commentaire } = req.body;
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document introuvable' });

        const updated = await Document.updateStatus(req.params.id, statut || doc.statut, commentaire);
        res.json({ success: true, message: 'Document mis à jour', data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur mise à jour' });
    }
});

// 🟢 Modifier uniquement le statut (admin)
router.put('/:id/statut', async (req, res) => {
    try {
        const { statut, commentaire } = req.body;
        if (!['en_attente', 'valide', 'rejete'].includes(statut)) {
            return res.status(400).json({ success: false, message: 'Statut invalide' });
        }

        const updated = await Document.updateStatus(req.params.id, statut, commentaire);
        res.json({ success: true, message: 'Statut modifié', data: updated });
    } catch (error) {
        console.error('Erreur update statut:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

/* =====================================================
   🧾 REMPLACEMENT DE DOCUMENT
===================================================== */

// 🔁 Remplacer un document rejeté
router.put('/:id/replace', upload.single('file'), async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;
        if (!file) return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });

        const doc = await Document.findById(id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document introuvable' });

        if (doc.statut !== 'rejete') {
            fs.unlinkSync(file.path);
            return res.status(400).json({ success: false, message: 'Seuls les documents rejetés peuvent être remplacés' });
        }

        const oldPath = path.join(uploadDir, doc.nom_fichier);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

        const newFileName = file.filename;
        const updatedDoc = await Document.replace(id, newFileName);

        res.json({ success: true, message: 'Document remplacé avec succès', data: updatedDoc });
    } catch (error) {
        console.error('Erreur remplacement document:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

/* =====================================================
   ❌ SUPPRESSION
===================================================== */

router.delete('/:id', async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document introuvable' });

        const filePath = path.join(uploadDir, doc.nom_fichier);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await Document.deleteById(req.params.id);
        res.json({ success: true, message: 'Document supprimé' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur suppression' });
    }
});

module.exports = router;
