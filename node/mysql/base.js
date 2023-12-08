import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
const database = process.env.database;
const username = process.env.user;
const password = process.env.password;
const host = process.env.host;

export default class BaseModel {
  constructor() {
    this.sequelize = new Sequelize(database, username, password, {
      host: host,
      dialect: 'mysql',
    });

    this.defineModel();
  }

  defineModel() {
    throw new Error('You must implement the defineModel method in the child class.');
  }
  
  async insert(data) {
    const model = this.getModel();
    try {
      return await model.create(data);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async select() {
    const model = this.getModel();
    try {
      return await model.findAll();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async find(id) {
    const model = this.getModel();
    try {
      return await model.findByPk(id);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(id, data) {
    const model = this.getModel();
    try {
      const record = await model.findByPk(id);
      if (record) {
        return await record.update(data);
      }
      return null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async delete(id) {
    const model = this.getModel();
    try {
      const record = await model.findByPk(id);
      if (record) {
        return await record.destroy();
      }
      return null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getModel() {
    throw new Error('You must implement the getModel method in the child class.');
  }
}