import path from 'path';

/**
 * 去除后缀的文件名
 * @param currentFileUrl 
 * @returns 
 */
function getfilename(currentFileUrl: string) {
  const currentFileName = path.parse(currentFileUrl).name;
  return currentFileName;
}
export default getfilename;