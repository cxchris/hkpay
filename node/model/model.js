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
        console.log(values)

        try {
            const result = await this.run(sql, values);
            return result;
        } catch (error) {
            throw error;
        }
    }
    /**
     * 通用查询
     * @param {*} filter 
     * @returns 
     */
    async get(filter) {
        // 构建查询条件和参数
        let where = 'WHERE 1'; // 默认条件，始终为真，以允许构建更多的条件
        const params = [];

        // 根据传入的过滤条件构建查询条件和参数
        if (filter) {
            for (const key in filter) {
                if (filter.hasOwnProperty(key)) {
                    where += ` AND ${key} = ?`;
                    params.push(filter[key]);
                }
            }
        }

        // 在查询语句中添加 LIMIT 1
        where += ' LIMIT 1';

        const query = await this.select(where, params);

        // 检查查询结果是否存在并返回第一项
        if (query.length > 0) {
            return query[0];
        }

        return []; // 如果查询结果为空，返回 []
    }

    // 查询数据
    async select(filters = {}) {
        let where = '';
        const params = [];

        if (Object.keys(filters).length > 0) {
            const fields = Object.keys(filters);
            const conditions = fields.map(field => `${field} = ?`);
            where = `WHERE ${conditions.join(' AND ')}`;
            params.push(...Object.values(filters));
        }

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
    async delete(filters = {}) {
        const fields = Object.keys(filters);
        const params = Object.values(filters);

        if (fields.length === 0) {
            throw new Error('请提供要删除的字段和值');
        }

        const where = fields.map(field => `${field} = ?`).join(' AND ');
        const sql = `DELETE FROM ${this.tableName} WHERE ${where}`;

        try {
            const result = await this.run(sql, params);
            return result;
        } catch (error) {
            throw error;
        }
    }

}