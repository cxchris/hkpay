//接受通知
import { logger } from '../lib/log.js';
import tran from 'translate-google';


const translate = async (req, res) => {
    try {
        const formData = req.body;
        // 验证签名

        const text = "你好!";

        // 指定源语言和目标语言（例如，从英语翻译成中文）
        const options = {
            from: 'zh-cn',
            to: 'en',
        };

        // const translatedText = await tran(text, options);
        
        res.success([options]);
    } catch (error) {
        res.error(error.message);
    }
};

export default translate