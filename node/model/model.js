import { SQLiteDatabase } from '../lib/sqllite.js';

export default class model extends SQLiteDatabase { 
    constructor(databasePath, tableName) {
        super(databasePath);
        this.tableName = tableName;
    }

    // 插入数据
    async insert(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);

        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;

        try {
            const result = await this.run(sql, values);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // 查询数据
    async select(where = '', params = []) {
        const sql = `SELECT * FROM ${this.tableName} ${where}`;

        try {
            const result = await this.query(sql, params);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // 更新数据
    async update(data, where = '', params = []) {
        const keys = Object.keys(data);
        const values = Object.values(data);

        const setClause = keys.map((key) => `${key} = ?`).join(', ');
        const sql = `UPDATE ${this.tableName} SET ${setClause} ${where}`;

        try {
            const result = await this.run(sql, [...values, ...params]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // 删除数据
    async delete(where = '', params = []) {
        const sql = `DELETE FROM ${this.tableName} ${where}`;

        try {
            const result = await this.run(sql, params);
            return result;
        } catch (error) {
            throw error;
        }
    }
}