import sqlite3 from 'sqlite3';

export class SQLiteDatabase {
    constructor(databasePath) {
        this.db = new sqlite3.Database(databasePath);
    }
  
    async createTable(tableName, columns) {
        const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(', ')})`;

        try {
            await this.run(createTableSQL);
            console.log(`Table ${tableName} created successfully.`);
        } catch (error) {
            console.error(`Error creating table ${tableName}:`, error);
            throw error;
        }
    }

    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                    this.close(); // 自动关闭数据库连接
                }
            });
        });
    }

    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.db.changes, lastID: this.db.lastID });
                    this.close(); // 自动关闭数据库连接
                }
            });
        });
    }

    async close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async select(sql, params = []) {
        try {
            const result = await this.query(sql, params);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

