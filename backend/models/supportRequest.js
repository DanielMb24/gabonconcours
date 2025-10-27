const { getConnection } = require('../config/database');

class SupportRequest {
    static async findAll() {
        const connection = await getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM support_requests ORDER BY createdAt DESC'
        );
        return rows;
    }

    static async findById(id) {
        const connection = await getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM support_requests WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    static async create(data) {
        const connection = await getConnection();
        const [result] = await connection.execute(
            'INSERT INTO support_requests (name, email, message, createdAt) VALUES (?, ?, ?, ?)',
            [data.name, data.email, data.message, new Date()]
        );

        return { id: result.insertId, ...data, createdAt: new Date() };
    }
}

module.exports = SupportRequest;
