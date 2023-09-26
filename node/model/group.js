import model from './model.js';
import { sendMessage,setInlineKeybord } from '../lib/bot.js';

export default class GroupModel extends model { 
    constructor(databasePath,tableName) {
        super(databasePath,tableName);
        // 在构造函数中调用父类构造函数
    }

    async grouplist(chatInfo = {}) {
        // 调用 select 方法
        const where = 'WHERE 1 = ?'; // 查询条件，可以根据需要修改
        const params = [1]; // 参数，可以根据需要修改
        
        const query = await this.select(where, params);
        
        // console.log(query)
        let data = query.map(item => ({
            text: item.group_name,
            callback_data: item.id
        }));

        setInlineKeybord(data,chatInfo);
        return query;
    }

    async get(group_id) {
        // 调用 select 方法
        const where = 'WHERE group_id = ?'; // 查询条件，可以根据需要修改
        const params = [group_id]; // 参数，可以根据需要修改
        
        const query = await this.select(where, params);
        
        return query;
    }

    async groupadd(chatInfo = {}) {
        //首先判断有没有
        const group_id = chatInfo.id.toString()
        
        const group_name = chatInfo.title
        const list = await this.get(group_id)
        let res;
        // console.log(group_id)
        // console.log(list)
        if (list.length === 0) {
            const data = {
                group_name : group_name,
                group_id : group_id
            }
            // console.log(data)
            res = await this.insert(data);
            sendMessage(group_id,'Group configuration successful')
        }
        return res;
    }
}