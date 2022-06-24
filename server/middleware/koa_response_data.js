// 处理业务逻辑的中间件
// 导入路径,因为要用到相对路径
const path = require('path')
// 导入读取文件方法
const fileUtils = require('../utils/file_utils')

module.exports = async (ctx, next) => {
  const url = ctx.request.url  //请求数据的地址 /api/seller   因为存放数据的路径是../data/seller.json
  let filePath = url.replace('/api', '')   //这一步是去掉url里面的/api  然后就变成了 /seller
  filePath = '../data' + filePath + '.json'  //这一步进行拼接,最后拼接成../data/seller.json
  filePath = path.join(__dirname, filePath)
  try {
    const ret = await fileUtils.getFileJsonData(filePath)
    ctx.response.body = ret
  } catch (error) {
    const errorMsg = {
      message: '读取文件内容失败,文件资源不存在',
      status: 404
    }
    ctx.response.body = errorMsg
  }
  // console.log(filePath);  //这时候只要浏览器地址加上/api/seller请求处理后就变成了../data/seller.json
  await next()
}