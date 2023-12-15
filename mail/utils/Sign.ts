import md5 from 'md5';
import { PostData } from './Notice';

export interface Params {
    [key: string]: string | number; // 也可以根据实际情况调整 value 的类型
}
export function getSign(params: PostData, key: string = ''): string {
  const sortedParams: Params = Object.fromEntries(
    Object.entries(params).sort()
  );

  let str = '';

  for (const [paramKey, paramValue] of Object.entries(sortedParams)) {
    if (paramValue !== '') {
      str += `${encodeURIComponent(paramKey)}=${encodeURIComponent(
        paramValue
      )}&`;
    }
  }

  str += `key=${key}`;
  str = decodeURIComponent(str);

  const res: string = md5(str).toUpperCase(); // 假设你有一个 md5 哈希函数
  return res;
}