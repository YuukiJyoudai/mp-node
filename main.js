const Koa = require('koa')
const encryption = require('./util')
const config = require('./config')
const xmlParser = require('koa-xml-body')
const app = new Koa()
const {port, token} = config

app.use(xmlParser())
app.use(async (ctx, next) => {
    const {method} = ctx
    let { signature = '', timestamp = '', nonce = '', echostr = '' } = ctx.query
    // 将token、timestamp、nouce 进行字典排序
    let str = [token, timestamp, nonce].sort().join('')
    // 将3个参数字符串拼接成字符串进行sha1加密
    const shaStr = encryption.sha1(str)
    if (method === 'GET') {
        if (shaStr === signature) {
            // ctx.body = echostr
            ctx.body = `
                <xml>
                <CreateTime>${new Date().getTime()}</CreateTime>
                <MsgType><![CDATA[text]]></MsgType>
                <Content><![CDATA[get测试]]></Content>
                </xml>
            `
        } else {
            ctx.body = '服务器验证失败'
        }
    } else if (method === 'POST') {
        console.log('用户输入', ctx.request.body)
        // 打印用户当前输入的内容是什么
        const xmlObj = ctx.request.body && ctx.request.body.xml && ctx.request.body.xml
        const msgType = xmlObj.MsgType[0]
        const msgContent = xmlObj.Content[0]
        const msgId = xmlObj.MsgId[0]
        const to = xmlObj.ToUserName[0]
        const from = xmlObj.FromUserName[0]
        console.log('用户发送了如下信息:', msgContent)
        ctx.body = `
            <xml>
                <ToUserName><![CDATA[${from}]]></ToUserName>
                <FromUserName><![CDATA[${to}]]></FromUserName>
                <CreateTime>${new Date().getTime()}</CreateTime>
                <MsgType><![CDATA[${msgType}]]></MsgType>
                <Content><![CDATA[欢迎来到我的公众号]]></Content>
            </xml>
        `
        console.log('看一下返回的结果', ctx.body)
    }
})


app.listen(port, () => {
    console.log(`正在监听服务器:${port}`)
})