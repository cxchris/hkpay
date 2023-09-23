import { logger } from '../lib/log.js';

export const webhook = async (req, res) => {
  try {
    const formData = req.body;
    // const name = formData.name;

    console.log(formData)
    logger.info(JSON.stringify(formData));
    // if (!name) {
    //   throw new Error('name cannot be empty');
    // }

    // // 验证签名
    // const isValidSignature = verifySign(formData, key);
    // if (!isValidSignature) {
    //   throw new Error('Invalid signature');
    // }
    
    const result = formData;
    res.success(result);
  } catch (error) {
    res.error(error.message);
  }
};