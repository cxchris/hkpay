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

        const query = await this.select(where, params);

        return query;
    }

    // 查询数据
    async select(where = '', params = []) {
        const sql = `SELECT * FROM ${this.tableName} ${where}`;
        // console.log(params)

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