const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/database');

// Lier une filière à une matière
router.post('/', async (req, res) => {
    try {
        const { filiere_id, matiere_id, coefficient, obligatoire } = req.body;
        
        if (!filiere_id || !matiere_id) {
            return res.status(400).json({
                success: false,
                message: 'filiere_id et matiere_id requis'
            });
        }
        
        const connection = getConnection();
        
        const [result] = await connection.execute(
            `INSERT INTO filiere_matieres (filiere_id, matiere_id, coefficient, obligatoire)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE coefficient = ?, obligatoire = ?`,
            [
                filiere_id, 
                matiere_id, 
                coefficient || 1.0, 
                obligatoire !== undefined ? obligatoire : true,
                coefficient || 1.0,
                obligatoire !== undefined ? obligatoire : true
            ]
        );
        
        res.json({
            success: true,
            message: 'Liaison créée avec succès',
            data: { id: result.insertId }
        });
    } catch (error) {
        console.error('Erreur création liaison:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Récupérer toutes les matières d'une filière
router.get('/filiere/:filiereId', async (req, res) => {
    try {
        const connection = getConnection();
        
        const [rows] = await connection.execute(
            `SELECT fm.*, m.nom_matiere, m.description as matiere_description
             FROM filiere_matieres fm
             JOIN matieres m ON fm.matiere_id = m.id
             WHERE fm.filiere_id = ?
             ORDER BY fm.obligatoire DESC, m.nom_matiere`,
            [req.params.filiereId]
        );
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Erreur récupération matières:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Récupérer toutes les filières d'une matière
router.get('/matiere/:matiereId', async (req, res) => {
    try {
        const connection = getConnection();
        
        const [rows] = await connection.execute(
            `SELECT fm.*, f.nomfil, f.description as filiere_description
             FROM filiere_matieres fm
             JOIN filieres f ON fm.filiere_id = f.id
             WHERE fm.matiere_id = ?
             ORDER BY f.nomfil`,
            [req.params.matiereId]
        );
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Erreur récupération filières:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Supprimer une liaison
router.delete('/:id', async (req, res) => {
    try {
        const connection = getConnection();
        
        await connection.execute(
            'DELETE FROM filiere_matieres WHERE id = ?',
            [req.params.id]
        );
        
        res.json({
            success: true,
            message: 'Liaison supprimée avec succès'
        });
    } catch (error) {
        console.error('Erreur suppression liaison:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Mettre à jour une liaison
router.put('/:id', async (req, res) => {
    try {
        const { coefficient, obligatoire } = req.body;
        const connection = getConnection();
        
        const updates = [];
        const params = [];
        
        if (coefficient !== undefined) {
            updates.push('coefficient = ?');
            params.push(coefficient);
        }
        
        if (obligatoire !== undefined) {
            updates.push('obligatoire = ?');
            params.push(obligatoire);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Aucune donnée à mettre à jour'
            });
        }
        
        params.push(req.params.id);
        
        await connection.execute(
            `UPDATE filiere_matieres SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
        
        res.json({
            success: true,
            message: 'Mise à jour effectuée avec succès'
        });
    } catch (error) {
        console.error('Erreur mise à jour:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
