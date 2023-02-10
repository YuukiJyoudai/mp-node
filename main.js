const Koa = require('koa')
const encryption = require('./util')
const config = require('./config')
const app = new Koa()
const {port, token} = config

console.log('encryption', encryption)
app.use(async (ctx, next) => {
    const {method} = ctx
    let { signature = '', timestamp = '', nonce = '', echostr = '' } = ctx.query
    // 将token、timestamp、nouce 进行字典排序
    let str = [token, timestamp, nonce].sort().join('')
    // 将3个参数字符串拼接成字符串进行sha1加密
    const shaStr = encryption.sha1(str)
    console.log('method', method)
    if (method === 'GET') {
        if (shaStr === signature) {
            ctx.body = echostr
        } else {
            ctx.body = '服务器验证失败'
        }
    }
})


app.listen(port, () => {
    console.log(`正在监听服务器:${port}`)
})