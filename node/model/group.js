import model from './model.js';

export default class GroupModel extends model { 
    constructor(databasePath,tableName) {
        super(databasePath,tableName);
        // 在构造函数中调用父类构造函数
    }

    async grouplist() {
        // 调用 select 方法
        const where = 'WHERE 1 = ?'; // 查询条件，可以根据需要修改
        const params = [1]; // 参数，可以根据需要修改
        
        const query = await this.select(where, params);
        
        return query;
    }

    async get(group_id) {
        // 调用 select 方法
        const where = 'WHERE group_id = ?'; // 查询条件，可以根据需要修改
        const params = [group_id]; // 参数，可以根据需要修改
        
        const query = await this.select(where, params);
        
        return query;
    }

    async groupadd(group_id) {
        //首先判断有没有
        const list = await this.get(group_id)
        console.log(list)
        if (!list) {
            
        }
        // return this.insert(data)
    }
}