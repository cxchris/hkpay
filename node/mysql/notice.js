import { DataTypes } from 'sequelize';
import BaseModel from './base.js';
const tableName = 'yd_notice_num'; //表名
export const TYPE_1 = 1; //1-丢单通知数值
export const TYPE_2 = 2; //2-收到提现通知的数值

export class Notice extends BaseModel {
  defineModel() {
    this.model = this.sequelize.define(tableName, {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.TINYINT, // 根据实际类型调整
        allowNull: false,
      },
      num: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    }, {
      // 额外的模型配置，可根据需求设置
      tableName: tableName, // 完整表名，包括前缀
      timestamps: false, // 禁用默认的时间戳字段
    });
  }

  /**
   * 插入通知消息,先判断数据库中是否有初始值，没有就先插入，有就num自增1,
   * @param {*} type 1-丢单通知数值,2-收到提现通知的数值
   * @returns 
   */
  async addNotice(type = 1) {
    const whereCondition = { type };

    // 查找或创建记录
    const [result, created] = await this.model.findOrCreate({
      where: whereCondition,
      defaults: { num: 1 }, // 设置默认值
    });

    // 如果记录已存在，则将 num 自增 1
    if (!created) {
      // 使用 increment 方法递增 num 字段
      await this.model.increment('num', { where: whereCondition });
    }

    // 再次查询记录以获取自增后的结果
    const res = await this.getSumByType();
    return res;
  }

  async searchSum(whereCondition = {}) {
    const totalSum = await this.model.sum('num', {
      where: whereCondition,
    });
    return totalSum;
  }

  async getSumByType() {
    const result = await this.model.findAll({
      attributes: ['type', [this.sequelize.fn('SUM', this.sequelize.col('num')), 'total']],
      group: ['type'],
    });
    const groupArr = result.map(item => item.toJSON());
    const arr = {}
    if (groupArr) {
        groupArr.forEach(item => {
          const type = item.type;
          const total = parseInt(item.total, 10); // 将字符串转换为整数
          if (type == TYPE_1) {
            arr.lost_num = total
          } else if(type == TYPE_2){
            arr.receive_num = total
          } else {
            arr.other_num = total
          }
        });
    }

    return arr;
  }

  getModel() {
    return this.model;
  }
}