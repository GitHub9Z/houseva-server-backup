/**
 * 
 * 基于koa 2.X
 * 
    常用koa 组件
    koa-router --- for router and work with koa-multer
    koa-multer --- for upload file
    koa-bodyparser --- for parse json and form
    koa-send --- for download file
    koa-session-minimal & koa-redis --- for session
    koa-sslify --- forced change to https
    koa-favicon
    koa-logger
    koa-static
    koa-ejs
    koa-convert
    koa-json ?
    koa-onerror
 * 
 * 阿里云部署：https://help.aliyun.com/document_detail/50775.html
 * 入门文章：http://www.jianshu.com/p/6b816c609669
 */

// koa相关
const Koa = require("koa");
// koa-router 7文档：https://github.com/alexmingoia/koa-router/tree/master/
// https://www.npmjs.com/package/koa-router
const Router = require("koa-router");
// request/response的json相关解析
const BodyParser = require("koa-bodyparser");
const Logger = require("koa-logger");
const Static = require("koa-static");
// 目录管理
const Mount = require('koa-mount');
// 附件上传(如图片)
const Multer = require("koa-multer");
// 模板的封装
const Views = require('koa-views');
const Nunjucks = require('nunjucks');
// 压缩
const Compress = require('koa-compress');
// 静态缓存
const StaticCache = require('koa-static-cache');

const favicon = require('koa-favicon');

/////////////////////////////////////////////////////////////////////////
// nodejs
const path = require("path");

const UPLOAD_PATH = "upload/image";

// 全局常量
const router = new Router();
const app = new Koa();

const Main = require('./app/main.js')

/////////////////////////////////////////////////////////////////////////////
//
// 初始化
//
/////////////////////////////////////////////////////////////////////////////

Main.init(router);

/*
通用环境配置
app.env defaulting to the NODE_ENV or "development"
app.proxy when true proxy header fields will be trusted
app.subdomainOffset offset of .subdomains to ignore [2]
*/
 
// 公用middleware
// x-response-time
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set("X-Response-Time", `${ms}ms`);
    // console.log(ctx.body);
});

// gzip 压缩
app.use(Compress({
    // 使用demo中的filter有问题，对于js无法正确采用gzip处理
    // filter: function (content_type) {
    //       return /text/i.test(content_type)
    // },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH, 
}));


// logger
// app.use(async (ctx, next) => {
//     const start = Date.now();
//     await next();
//     const ms = Date.now() - start;
//     console.log(`${ctx.method} ${ctx.url} - ${ms}`);
// });

// 一定注意选用模板(目前选了nunjucks)的路径配置
var templateViewPath = path.join(__dirname, '/app/public/dist/view');
const NunjucksEnv = new Nunjucks.Environment(
    new Nunjucks.FileSystemLoader(templateViewPath)
)
app.use(Views(templateViewPath, {
    options: {
        nunjucksEnv: NunjucksEnv,
    },
    map: {
        html: 'nunjucks'
    }
}));


/**
 * 静态缓存配置
 * 注意路径的Mount, 如url中需要带上路径前缀，则需要mount url(如$HOST/update/image/xxxx)
 * staticcache 包含了Static配置，因此前面的use Static可以注释掉
 * 静态缓存配置(必须在route之前)
 * 目前的问题： 1.新增资源无法立即访问到，需要重新部署 2.被include的模板修改无法生效
 */
var files = {}
// 静态文件 serve files from ./public
// what ? 不需要使用static 也可以
// app.use(Static(path.join(__dirname, "/app/public")));
// app.use(Static(path.join(__dirname, "/upload/image")));
app.use(StaticCache(path.join(__dirname, '/app/public/dist'), {
    maxAge: 30 * 24 * 60 * 60,
    dynamic: true,
}, files));

// 用户上传的图片 如果设置成静态资源，则无法更新!!!!
// app.use(Mount('/upload/image', Static(path.join(__dirname, "/upload/image"))));
app.use(Mount('/upload/image', StaticCache(path.join(__dirname, '/upload/image'), {
    maxAge: 30 * 24 * 60 * 60,
    dynamic: true, // 如果菲静态资源，则无法缓存，真操蛋.必须增加dynamic参数
}, files)));

app.use(Logger());
app.use(BodyParser());
// 注意顺序，必须body parser在前, router在后
app.use(router.routes());

// favicon
app.use(favicon(path.join(__dirname, '/app/public/favicon.ico')));

// /**
//  * 统一的error处理
//  */
// app.on('error', function(err,ctx){
//     if (process.env.NODE_ENV != 'test') {
//         console.log(err.message);
//         console.log(err);
//     }
// });
// app.use(function *(){
//     console.log(this.request);
//     this.body = new Date();
// });


// 接入gulp后，有变更后需要重新编译
// cmd: gulp
 
if (app.env == 'development') {
    // dev环境
    // 启动mongdb server：mongod -f mongo.config
    // 启动koa web server：npm start
    app.listen(3000);
} else {
    // production环境
    // 启动脚本：npm run-script deploy (注意：deploy是切换到sudo执行forever)
    // 停止脚本：sudo forever stopall
    // 重启脚本：sudo forever restartall (如果当前没有进程在跑，要先执行一下 deploy命令)
    // 查看任务脚本：sudo forever list 
    // 其他问题看看node脚本：ps aux | grep node
    app.listen(80);
}