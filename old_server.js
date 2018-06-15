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
 * 
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
var StaticCache = require('koa-static-cache')



/////////////////////////////////////////////////////////////////////////
// nodejs
const path = require("path");

const UPLOAD_PATH = "upload/image";

// 上传处理
const ImageUploader = Multer({
    dest: UPLOAD_PATH,
});

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

// 签名的cookie key
// app.keys = ['im a newer secret', 'i like turtle'];
// app.keys = new KeyGrip(['im a newer secret', 'i like turtle'], 'sha256');
// ctx.cookies.set('name', 'tobi', { signed: true });

// 全局上下文 app.context
// app.context.db = db();

// ctx.state
// 用来在middleware或前端view中传递的状态数据
// ctx.state.user = await User.find(id);

// 全局的error 处理
// app.on('error', err => {
//   log.error('server error', err)
// });

// app.use(async ctx => {
//   ctx; // is the Context
//   ctx.request; // is a koa Request
//   ctx.response; // is a koa Response
// });
// 注意：ctx.req, ctx.res 是NodeJs的request和response对象

// 以下为MongoClient实现
// function connectDb(callback) {
//     var url = 'mongodb://localhost:27017/house_eva';
//     MongoClient.connect(url, function(err, db) {
//         // assert.equal(null, err);
//         console.log('Connected correctly to server db:house_eva');
//         callback(db);
//        // db.close();
//     });
// }

// function execDb(callback) {
//     connectDb(callback);
// }

// var insertRes = function(db) {
//    db.collection('restaurants').insertOne( {
//       "address" : {
//          "street" : "2 Avenue",
//          "zipcode" : "10075",
//          "building" : "1480",
//          "coord" : [ -73.9557413, 40.7720266 ]
//       },
//       "borough" : "Manhattan",
//       "cuisine" : "Italian",
//       "grades" : [
//          {
//             "date" : new Date("2014-10-01T00:00:00Z"),
//             "grade" : "A",
//             "score" : 11
//          },
//          {
//             "date" : new Date("2014-01-16T00:00:00Z"),
//             "grade" : "B",
//             "score" : 17
//          }
//       ],
//       "name" : "Vella",
//       "restaurant_id" : "41704620"
//    }, function(err, result) {
//         // assert.equal(err, null);
//        console.log("Inserted a document into the restaurants collection.");
//        db.close();
//   });
// };

// var findRes = function(db, callback) {
//     var docs = [];
//    var cursor = db.collection('restaurants').find();
//    cursor.each(function(err, doc) {
//       // ssert.equal(err, null);
//       if (doc !== null) {
//             console.log("cursor each iterate");
//             callback(doc);
//           //docs.push(doc);
//           //console.dir(doc);
//       } else {
//          //callback();
//       }
//    });
//    console.log("after cursor each");
// };

// 以下写法编译不过
// app.use(router(app));
// app.get('/', function *(next) {
//     //我是首页
//     //this 指向请求
// });

// 以下写法 页面直接出NotFound
// router.get('/', function *(next) {
//     console.log(this.request);
//      this.body = "hello my world";
// });

/////////////////////////////////////////////////////////////////////////////
//
// 注册路由
//
/////////////////////////////////////////////////////////////////////////////

// 注册页面型路由

// TODO 注册API路由

// router.get("/", function(ctx, next) {
//     // console.log(ctx);
//     ctx.body = "Hello World!";
// });

// router.get("/mongodb", function(ctx, next) {
//     execDb(insertRes);
//     ctx.body = "insert res to mongdb";
// });

// var User = Mongoose.model("User");

// router.get("/mongodb-query", async (ctx, next) => {
//     // console.log(ctx.req);
//     var result = await User.findOne({ uid: 1 }).exec();
//     console.log("find result: ");
//     console.log(result);
//     if (result) {
//         var count = await User.count({ uid: 1 }).exec();
//         ctx.body = { find: result, count: count };
//     } else {
//         user = new User({
//             uid: 1,
//             username: "aowen",
//             createTime: new Date(),
//             lastLogin: new Date()
//         });
//         var r = await user.save();
//         ctx.body = JSON.stringify(r);
//     }

//     // execDb(function(db) {
//     //     findRes(db, function(docs) {
//     //         console.log("query over, prepare for resoponse---");
//     //         var str = JSON.stringify(docs);
//     //         console.log(str);
//     //         ctx.body = "DXXXXXXXXX";
//     //     })
//     // });
//     // 这里没法等待!!!
// });

// router.post("/login", async (ctx, next) => {
//     // console.log("ctx.request: ", JSON.stringify(ctx.request));
//     let passwd = ctx.request.body["passwd"];
//     let loginId = ctx.request.body["loginId"];
//     var result = await findUserByLoginId(loginId);
//     console.log("find result: ", result);
//     if (result) {
//         if (result.passwd == passwd) {
//             // TODO generate token
//             ctx.body = { success: true, code: 0, data: {} };
//         } else {
//             ctx.body = { success: false, code: 0, resultView: "password is wrong", data: {} };
//         }
//     } else {
//         ctx.body = { success: false, code: 101, resultView: "cannot find user" };
//     }
//     console.log("response: ", ctx.body);
// });

// router.post("/register", async (ctx, next) => {
//     let loginId = ctx.request.body["loginId"];
//     let passwd = ctx.request.body["passwd"];
//     // 基本校验
//     if (!loginId || !passwd) {
//         ctx.body = { success: false, code: 103, resultView: "参数错误，请填写用户名和密码" };
//         return;
//     }
//     var result = await findUserByLoginId(loginId);
//     if (result) {
//         ctx.body = { success: false, code: 102, resultView: "用户已经注册，使用其他登陆名", data: {} };
//     } else {
//         // TODO 用户名未注册，进行校验逻辑

//         // 创建用户
//         let user = new User({
//             loginId: loginId,
//             passwd: passwd,
//             createTime: new Date(),
//             lastLogin: new Date()
//         });
//         let r = await user.save();
//         ctx.body = { success: true, code: 0, data: r };
//     }
//     console.log("response: ", ctx.body);
// });

/*
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
var upload = multer({ storage: storage })
*/

// 图片上传接口 (koa 2的方式，问题是如何定制?)

// router.post('/api/uploadImage', ImageUploader.any());



// 图片上传没有路由的吗?
// router.post('/api/uploadImage', async (ctx, next) => {
//     // ignore non-POSTs
//     // if ("POST" != ctx.method) {
//     //     return await next();
//     // }
//     // 文件body中的file

//     if (!ctx.request.body || !ctx.request.body.files) {
//         console.warn("body or file is empty");
//         ctx.body = { success: false, code: 3, data: 'body or file is empty' };
//         return;
//     }

//     const file = ctx.request.body.files.file;
//     const reader = fs.createReadStream(file.path);
//     const stream = fs.createWriteStream(path.join(os.tmpdir(), Math.random().toString()));
//     reader.pipe(stream);
//     console.log("uploading %s -> %s", file.name, stream.path);
//     // 应该返回新的图片地址才对
//     // ctx.redirect("/");
// });

// router.get("/date", function(ctx, next) {
//     ctx.body = new Date();
// });


// 公用middleware
// x-response-time
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set("X-Response-Time", `${ms}ms`);
    console.log(ctx.body);
});

// gzip 压缩
app.use(Compress({
    // 使用demo中的filter有问题，对于js无法正确采用gzip处理
    // filter: function (content_type) {
    //       return /text/i.test(content_type)
    // },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
}));


// logger
// app.use(async (ctx, next) => {
//     const start = Date.now();
//     await next();
//     const ms = Date.now() - start;
//     console.log(`${ctx.method} ${ctx.url} - ${ms}`);
// });


// 一定注意选用模板(目前选了nunjucks)的路径配置
var templateViewPath = path.join(__dirname, '/app/public/view');
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


// 静态文件 serve files from ./public
// what ? 不需要使用static 也可以房屋
// app.use(Static(path.join(__dirname, "/app/public")));
// app.use(Static(path.join(__dirname, "/upload/image")));
// app.use(Mount('/upload/image', Static(path.join(__dirname, "/upload/image"))));

/**
 * 静态缓存配置
 * 
 * 注意路径的Mount, 如url中需要带上路径前缀，则需要mount url(如$HOST/update/image/xxxx)
 * staticcache 包含了Static配置，因此前面的use Static可以注释掉
 * 静态缓存配置(必须在route之前)
 */
var files = {}
app.use(StaticCache(path.join(__dirname, '/app/public'), {
    maxAge: 30 * 24 * 60 * 60,
}, files));
app.use(Mount('/upload/image', StaticCache(path.join(__dirname, '/upload/image'), {
    maxAge: 30 * 24 * 60 * 60,
}, files)));


app.use(Logger());
app.use(BodyParser());
// 注意顺序，必须body parser在前, router在后
app.use(router.routes());

// app.use(router.allowedMethods());

async function findUserByLoginId(loginId) {
    var result = await User.findOne({ loginId: loginId }).exec();
    console.log("findUserByLoginId result: ", result);
    return result;
}

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

// 为什么要监听到IP地址？ 让手机访问？
if (app.env == 'development') {
    app.listen(3000);
} else {
    app.listen(80);
}

// app.listen(3000, '192.168.1.102');
// 启动顺序：
// 启动mongdb server：mongod -f mongo.config
// 启动koa web server：npm start