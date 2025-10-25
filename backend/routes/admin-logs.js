const express = require('express');
const router = express.Router();
const AdminLog = require('../models/AdminLog');
const { getConnection } = require('../config/database');

// Récupérer tous les logs des admins établissements
router.get('/', async (req, res) => {
    try {
        const { admin_id, table_name, startDate, endDate, limit = 100 } = req.query;
        
        const connection = getConnection();
        
        let query = `
            SELECT 
                al.*,
                a.nom as admin_nom,
                a.prenom as admin_prenom,
                a.email as admin_email,
                a.role as admin_role,
                e.nometab as etablissement_nom
            FROM admin_logs al
            LEFT JOIN administrateurs a ON al.admin_id = a.id
            LEFT JOIN etablissements e ON a.etablissement_id = e.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (admin_id) {
            query += ' AND al.admin_id = ?';
            params.push(admin_id);
        }
        
        if (table_name) {
            query += ' AND al.table_name = ?';
            params.push(table_name);
        }
        
        if (startDate) {
            query += ' AND al.created_at >= ?';
            params.push(startDate);
        }
        
        if (endDate) {
            query += ' AND al.created_at <= ?';
            params.push(endDate);
        }
        
        query += ' ORDER BY al.created_at DESC LIMIT ?';
        params.push(parseInt(limit));
        
        const [logs] = await connection.execute(query, params);
        
        res.json({
            success: true,
            data: logs,
            total: logs.length
        });
    } catch (error) {
        console.error('Erreur récupération logs admin:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Récupérer les statistiques des actions admin
router.get('/stats', async (req, res) => {
    try {
        const connection = getConnection();
        
        const [stats] = await connection.execute(`
            SELECT 
                COUNT(*) as total_actions,
                COUNT(DISTINCT admin_id) as total_admins,
                COUNT(DISTINCT DATE(created_at)) as jours_actifs,
                action,
                COUNT(*) as count
            FROM admin_logs
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY action
        `);
        
        const [recentActions] = await connection.execute(`
            SELECT 
                al.*,
                a.nom as admin_nom,
                a.prenom as admin_prenom
            FROM admin_logs al
            LEFT JOIN administrateurs a ON al.admin_id = a.id
            ORDER BY al.created_at DESC
            LIMIT 10
        `);
        
        res.json({
            success: true,
            data: {
                stats,
                recentActions
            }
        });
    } catch (error) {
        console.error('Erreur stats logs:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

// Logger une nouvelle action
router.post('/', async (req, res) => {
    try {
        const logData = {
            admin_id: req.body.admin_id,
            action: req.body.action,
            table_name: req.body.table_name,
            record_id: req.body.record_id,
            old_values: req.body.old_values || {},
            new_values: req.body.new_values || {},
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
        };
        
        const log = await AdminLog.create(logData);
        
        res.json({
            success: true,
            data: log
        });
    } catch (error) {
        console.error('Erreur création log:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
});

module.exports = router;
