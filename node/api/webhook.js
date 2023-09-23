import { logger } from '../lib/log.js';

export const webhook = async (req, res) => {
  try {
    const formData = req.body;
    // console.log(formData)
    // logger.info(JSON.stringify(formData));

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