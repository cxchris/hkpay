import { model } from './model.js';

export class GroupModel extends model { 
    constructor(databasePath,tableName) {
        super(databasePath,tableName);
        // 在构造函数中调用父类构造函数
    }
}