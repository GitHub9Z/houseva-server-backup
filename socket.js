// 基于koa-websocket实现的即时通讯
// 把下面的这个几个模块安装一下
// 这只是功能模块完成，后期肯定要连接数据库保存数据
const Koa = require('koa')
// 路由
const route = require('koa-route')
const fs = require('fs');

// koa封装的websocket这是官网（很简单有时间去看一下https://www.npmjs.com/package/koa-websocket）
const websockify = require('koa-websocket')
const Mongoose = require("mongoose");

require("./app/model/wp_interact_model.js");
require("./app/model/wp_real_estate_model.js");
require("./app/model/wp_user_model.js");
require("./app/model/wp_tag_model.js");

const Util = require("./app/module/util.js");
const WpInteractModel = Mongoose.model("WpInteractModel")
const WpRealEstateModel = Mongoose.model("WpRealEstateModel")
const WpUserModel = Mongoose.model("WpUserModel")
const WpTagModel = Mongoose.model("WpTagModel")


Mongoose.connect("mongodb://localhost:27017/house_eva")

var options = {
    key: fs.readFileSync('./ssl/215081659990674.key'),
    cert: fs.readFileSync('./ssl/215081659990674.pem')
}

const app = websockify(new Koa(), {}, options)
let ctxs = []
app.ws.use(function (ctx, next) {
    return next(ctx)
})
app.ws.use(route.all('/', async function (ctx) {
    let item = {
        ctx: ctx,
        user_id: ''
    }
    ctxs.push(item)
    // console.log(ctx.request)
    // console.log(ctx.req)
    // ctx.websocket.send(JSON.stringify(ctx.request))

    ctx.websocket.on('message', async function (message) {
        // 返回给前端的数据
        let msg = JSON.parse(message)
        if (msg.hasOwnProperty('status') && msg.status === 'connect') {
            ctxs.forEach((v, i, a) => {
                if (v.user_id === msg.user_id) {
                    ctxs.splice(i, 1)
                    console.log('close_died_connect')
                }
            })
            item.user_id = msg.user_id
            console.log('user_connect:', msg.user_id)
            console.log('user_num:', ctxs.length)
            return
        }
        let temp = await WpInteractModel.findOne({ id: msg.to_interact_id }).lean().exec()
        let tag = await WpTagModel.findOne({ id: temp.tag_id }).lean().exec()
        let user = await WpUserModel.findOne({ id: temp.user_id }).lean().exec()
        let realEstate = await WpRealEstateModel.findOne({ id: tag.real_estate_id }).lean().exec()
        msg.real_estate_name = realEstate.real_estate_name
        msg.user = user

        ctxs.forEach((v, i, a) => {
            if (v.user_id === temp.user_id) {
                console.log(msg.user_id, ' send_message_to ', temp.user_id, ' : ', msg.interact_content)
                v.ctx.websocket.send(JSON.stringify(msg))
            }
        })
        // setInterval(() => { ctx.websocket.send(message) },2000); 
    })

    ctx.websocket.on('close', function (evt) {
        ctxs.forEach((v, i, a) => {
            if (v.user_id === item.user_id) {
                ctxs.splice(i, 1)
                console.log('close_one_connect')
            }
        })
    })
}))
app.listen(443)
// 会默认打开127.0.0.1:3000这个端口号