import { success, error, successMiddleware, errorMiddleware, verifySign } from '../lib/utils.js'
import dotenv from 'dotenv';
import GroupModel from '../model/group.js'; // 根据您的项目结构和路径导入
dotenv.config();

const key = process.env.user;
const dbnama = './sqllitedb/database.db';
const table = 'groups';

//监听丢单并推送至飞机群bot
export const lostOder = async (req, res) => {
  try {
    const formData = req.body;
    console.log(formData)
    const name = formData.name;
    // if (!name) {
    //   throw new Error('name cannot be empty');
    // }

    // // 验证签名
    // const isValidSignature = verifySign(formData, key);
    // if (!isValidSignature) {
    //   throw new Error('Invalid signature');
    // }



    // db.select('SELECT * FROM users WHERE age > ?', [18])
    // .then((rows) => {
    //   console.log('Query result:', rows);
    // })
    // .catch((error) => {
    //   console.error('Error:', error);
    // });

    // 查询数据示例
    const model = new GroupModel(dbnama,table);
    
    // 调用 select 方法
    const where = 'WHERE group_id = ?'; // 查询条件，可以根据需要修改
    const params = [1]; // 参数，可以根据需要修改
       
    const query = await model.select(where,params);
    // console.log(query)


    const result = query;
    res.success(result);
  } catch (error) {
    res.error(error.message);
  }
};