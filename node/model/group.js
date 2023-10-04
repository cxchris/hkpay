import model from './model.js';
import error from '../lib/error.js';
import { sendMessage, setInlineKeybord, getChatAdmins } from '../lib/bot.js';

const permissionId = [5256774376]; //被允许私人访问的
const commandList = [
    'start',
    'grouplist',
    'groupadd'
];

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


    async groupadd(chatInfo = {}) {
        //首先判断有没有
        const group_id = chatInfo.id.toString()
        
        const group_name = chatInfo.title
        const filter = { group_id }
        const list = await this.get(filter)
        let res;
        // console.log(group_id)
        // console.log(list)
        if (!list) {
            const data = {
                group_name : group_name,
                group_id : group_id
            }
            // console.log(data)
            res = await this.insert(data);
            sendMessage(group_id,'Group configuration successful')
        } else {
            sendMessage(group_id,'aleady use')
        }
        return res;
    }

    //消息类型管理,获取基本数据
    async getBaseMessageData(formData = {}) {
        let res = {}
        if (formData.message) {
            res = {
                chatType : formData.message.chat.type, //聊天类型，private-私聊，group-群组
                text : formData.message.text,
                fromid : formData.message.from.id,
                chatInfo: formData.message.chat,
                callback_data: '',
                formType : 'message'
            }
        } else if(formData.callback_query){
            // console.log(2)
            res = {
                chatType : '',
                text : formData.callback_query.message.text,
                fromid : formData.callback_query.message.from.id,
                chatInfo: formData.callback_query.message.chat,
                callback_data : formData.callback_query.data,
                formType : 'callback_query'
            }
        } else {
            //未知的类型
            throw error[406];
        }

        return res;
    }

    //处理消息
    async handleMessage(text, chatInfo, chatType, fromid) {
        const chatId = chatInfo.id;
        //处理text，获得指令
        let command = text.replace(/@.*$/, '');
        command = command.replace('/', '');
        console.log(command)

        if (command == 'start') {
            //处理开始处理完就不走后面的
            sendMessage(chatId, 'welcome!');
            return true;
        }

        //首先判断是私聊还是群聊，私聊就只能指定用户才能有权限操作，群聊就判断群聊管理员，先获取管理员
        if (chatType == 'private') {
            if (!permissionId.includes(fromid)) {
                throw error[402];
            }
            //私聊不允许访问groupadd
            if (command == 'groupadd') {
                throw error[405];
            }
        } else if (chatType == 'group') {
            // 获取群组的管理员列表
            const administrators = await getChatAdmins(chatId);
            if (!administrators.includes(fromid)) {
                throw error[402];
            }
            //群聊不允许访问grouplist
            if (command == 'grouplist') {
                throw error[405];
            }
        } else {
            throw error[403];
        }

        //根据指令来判断操作
        if (commandList.includes(command)) {
            if (typeof this[command] === 'function') { 
                await this[command](chatInfo);
            }
        }

        return true;
    }

    //处理callback
    async callbackQuery(data, chatId) {
        const filter = { id : data }
        const list = await this.get(filter)
        console.log(list)
        // 在这里根据用户的响应执行相应的操作
        if (data == list.id) {
            sendMessage(chatId, `你点击了按钮${list.id}`);
        } else {
            sendMessage(chatId, '异常');
        }
    }
}