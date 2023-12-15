import { readEmailListener, Econfig } from '../utils/EmailListener';
import Logger from '../utils/Logger';
import getfilename from '../utils/GetFileName';
const _name = getfilename(__filename)

const logger = new Logger(_name);
const config: Econfig = {
    "user": "chris1991@zohomail.com",
    "password": "4L5Q8N03ZVTV",
    "host": "imap.zoho.com",
    "port": 993,
    "tls": true,
    "tlsOptions": {
        "rejectUnauthorized": false
    }
};

// console.log('配置文件内容:', config);
try {
    readEmailListener(config,_name);
} catch (err) {
    logger.error('运行mail listener出错:' + err);
}