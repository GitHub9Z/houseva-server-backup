/**
 * 主流程js
 */
var pageController = require("./controller/page_controller.js");
var apiController = require("./controller/api_controller.js");
var postApiController = require("./controller/post_api_controller.js");
var adminController = require("./admin/admin_controller.js");

// 第三方
const moment = require("moment");
// mongoose文档： http://www.nodeclass.com/api/mongoose.html#guide_queries
const Mongoose = require("mongoose");
const path = require('path');
const tinify = require('tinify');
tinify.key = "L3x8KZw8Fi8BKmd9HFiYbMu9DlZSnfzq";

var Main = {};

// 上传处理
const Multer = require("koa-multer");
const UPLOAD_PATH = "upload/image";

// 存储位置
var storage = Multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_PATH);
    },
    filename: function (req, file, cb) {
        //cb(null, Date.now() + '_' + makeid(6) + path.extname(file.originalname));
        cb(null, file.originalname)
    }
});

const ImageUploader = Multer({
    //dest: UPLOAD_PATH,
    storage: storage,
});


// /**
//  * @deprecated
//  */
// function generateThumb(options) {
//     var src = options.src;
//     var dest = options.dest;
//     sharp(src)
//         .resize(120).toFile(dest, (err, info) => {
//             console.log("sharp generte thumb: ", err, info);
//             if (options.callback) {
//                 options.callback();
//             }
//     });
// }

/**
 * web 路由
 * @param {*} router 
 */
function createRouteMap(router) {
    // 页面map
    // 根据object key自动map, 不需要手工编辑
    router.get("/", pageController.index);
    // 自动遍历建立map(无需每次手动建立, 容易遗漏)
    for (var key in pageController) {
        router.get("/" + key + ".html", pageController[key]);
    }

    // api接口(get/post如何区分?)
    for (var key in apiController) {
        router.get("/api/" + key, apiController[key]);
    }

    // api接口(get/post如何区分?)
    for (var key in postApiController) {
        router.post("/api/" + key, postApiController[key]);
    }

    // 图片上传接口
    // 特殊接口，由于依赖Muler, 必须单独定义
    router.post("/api/uploadImage", ImageUploader.single("pic"), async (ctx, next) => {
        // single时req.file有值
        var origin = ctx.req.file.originalname;
        // 获取后缀
        var ext = path.extname(origin);
        var fileName = ctx.req.file.filename;
        var url = '/' + UPLOAD_PATH + '/' + ctx.req.file.filename;

        console.log(ctx.req.file.path)
        var source = tinify.fromFile(ctx.req.file.path);
        source.toFile(ctx.req.file.path + "_optimized.jpg");

        ctx.body = {
            // 最终生成的url
            'originName' :ctx.req.file.originalname,
            'newName': ctx.req.file.filename,
            // 'thumbnail': '/' + UPLOAD_PATH + '/' + thumbnailName,
            url: url, //返回文件名
        };
    });
}
 

/**
 * test路由
 * @deprecated
 */
function createTestRouterMap(router) {
    // test api
    router.get("/mongodb", function(ctx, next) {
        execDb(insertRes);
        ctx.body = "insert res to mongdb";
    });

    var User = Mongoose.model("User");
    router.get("/mongodb-query", async (ctx, next) => {
        var result = await User.findOne({ uid: 1 }).exec();
        console.log("find result: ");
        console.log(result);
        if (result) {
            var count = await User.count({ uid: 1 }).exec();
            ctx.body = { find: result, count: count };
        } else {
            user = new User({
                uid: 1,
                username: "aowen",
                createTime: new Date(),
                lastLogin: new Date(),
            });
            var r = await user.save();
            ctx.body = JSON.stringify(r);
        }
    });
}


/**
 * 后台路由(存在get/post混用，暂时未想到自动映射方法解决，先手动改)
 */
function createAdminRouterMap(router) {
    router.get("/admin/api/search", adminController.search);
    
    router.get("/admin/api/get_real_estate_list", adminController.getRealEstateList);
    router.get("/admin/api/get_ad_list", adminController.getAdList);
    router.post("/admin/api/get_real_estate_units", adminController.getRealEstateUnits);
    router.post("/admin/api/save_ad_list", adminController.saveAdList);

    router.post("/admin/api/save_real_estate", adminController.saveRealEstate);
    router.post("/admin/api/publish_real_estate", adminController.publishRealEstate);

    router.post("/admin/api/save_light_site_plan", adminController.saveLightSitePlan);
    router.post("/admin/api/save_light_elevation_plans", adminController.saveLightElevationPlans);
    router.post("/admin/api/save_light_floors", adminController.saveLightFloors);
    // router.post("/admin/api/save_light_window", adminController.saveLightWindow);

    router.post("/admin/api/save_unit_basic_info", adminController.saveUnitBasicInfo);
    router.post("/admin/api/save_unit_room_area", adminController.saveUnitRoomArea);
    router.post("/admin/api/save_unit_region_flow", adminController.saveUnitRegionFlow);
    router.post("/admin/api/save_unit_window_ventilate", adminController.saveUnitWindowVentilate);
    router.post("/admin/api/save_unit_detail", adminController.saveUnitDetail);

    router.post('/admin/api/delete_unit', adminController.deleteUnit);
}


function makeid(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


Main.init = function(router) {
    // 初始化mongodb
    // db如果没有启动的话会报失败, 是否应该加个判断db是否启动的逻辑？
    // 启动mongdb命令：mongod -f mongo.config
    Mongoose.connect("mongodb://localhost:27017/house_eva");
    // 线上db
    // Mongoose.connect("mongodb://106.14.2.213:27017/house_eva");

    createRouteMap(router);

    createTestRouterMap(router);

    createAdminRouterMap(router);
};
 

 
module.exports = Main;
