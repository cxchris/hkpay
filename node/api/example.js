import { GroupModel } from '../model/group.js'; // 根据您的项目结构和路径导入

const dbnama = './sqllitedb/database.db';
const table = 'groups';
/**
 * 例子
 * @param {*} req 
 * @param {*} res 
 */
export const test = async (req, res) => {
  try {
    const formData = req.body;
    const name = formData.name;

    // 插入数据示例
    const model = new GroupModel(dbnama,table);
    
    const data = {
      group_name: 'test2',
      group_id: '2'
    }
       
    const query = await model.insert(data);
      console.log(query)
      
    // const model = new GroupModel(dbnama,table);
    
    // // 调用 select 方法
    // const where = 'WHERE group_id = ?'; // 查询条件，可以根据需要修改
    // const params = [1]; // 参数，可以根据需要修改
       
    // const query = await model.select(where,params);


    const result = [];
    res.success(result);
  } catch (error) {
    res.error(error.message);
  }
};