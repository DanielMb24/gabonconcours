const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/database');

// Lier un concours à une filière
router.post('/', async (req, res) => {
    try {
        const { concours_id, filiere_id, places_disponibles } = req.body;
        
        if (!concours_id || !filiere_id) {
            return res.status(400).json({
                success: false,
                message: 'concours_id et filiere_id requis'
            });
        }
        
        const connection = getConnection();
        
        const [result] = await connection.execute(
            `INSERT INTO concours_filieres (concours_id, filiere_id, places_disponibles)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE places_disponibles = ?`,
            [concours_id, filiere_id, places_disponibles || 0, places_disponibles || 0]
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

// Récupérer toutes les filières d'un concours
router.get('/concours/:concoursId', async (req, res) => {
    try {
        const connection = getConnection();
        
        const [rows] = await connection.execute(
            `SELECT cf.*, f.nomfil, f.description as filiere_description
             FROM concours_filieres cf
             JOIN filieres f ON cf.filiere_id = f.id
             WHERE cf.concours_id = ?
             ORDER BY f.nomfil`,
            [req.params.concoursId]
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

// Récupérer tous les concours d'une filière
router.get('/filiere/:filiereId', async (req, res) => {
    try {
        const connection = getConnection();
        
        const [rows] = await connection.execute(
            `SELECT cf.*, c.libcnc, c.datcnc
             FROM concours_filieres cf
             JOIN concours c ON cf.concours_id = c.id
             WHERE cf.filiere_id = ?
             ORDER BY c.datcnc DESC`,
            [req.params.filiereId]
        );
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Erreur récupération concours:', error);
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
            'DELETE FROM concours_filieres WHERE id = ?',
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

// Mettre à jour le nombre de places
router.put('/:id', async (req, res) => {
    try {
        const { places_disponibles } = req.body;
        const connection = getConnection();
        
        await connection.execute(
            'UPDATE concours_filieres SET places_disponibles = ? WHERE id = ?',
            [places_disponibles, req.params.id]
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
