////////////////////////////////////////////////////////
//
// api controller 
// 用来处理 api接口 
//
////////////////////////////////////////////////////////

require("../model/real_estate_model.js");
require("../model/light_site_plan_model.js");
require("../model/light_elevation_plan_model.js");
require("../model/light_floor_model.js");
require("../model/light_window_model.js");

require("../model/unit_basic_info.js");
require("../model/unit_detail.js");
require("../model/unit_region_flow.js");
require("../model/unit_room_area.js");
require("../model/unit_window_ventilate.js");
require("../model/unit_zan.js");

require("../model/wp_interact_model.js");
require("../model/wp_real_estate_model.js");
require("../model/wp_record_model.js");
require("../model/wp_tag_model.js");
require("../model/wp_user_model.js");

const Mongoose = require("mongoose");
const Constant = require("../module/constant.js");
const Util = require("../module/util.js");
const AdminController=require("../admin/admin_controller.js");
// 模型定义
var UnitZanNumber = Mongoose.model("UnitZanNumber");
var RealEstate = Mongoose.model("RealEstate");
var LightSitePlan = Mongoose.model("LightSitePlan");
var LightElevationPlan = Mongoose.model("LightElevationPlan");
var LightFloor = Mongoose.model("LightFloor");
var LightWindow = Mongoose.model("LightWindow");
var UnitBasicInfo = Mongoose.model("UnitBasicInfo");
var UnitRoomArea = Mongoose.model("UnitRoomArea");
var UnitRegionFlow = Mongoose.model("UnitRegionFlow");
var UnitWindowVentilate = Mongoose.model("UnitWindowVentilate");
var UnitDetail = Mongoose.model("UnitDetail");
var WpInteractModel = Mongoose.model("WpInteractModel");
var WpRealEstateModel = Mongoose.model("WpRealEstateModel");
var WpRecordModel = Mongoose.model("WpRecordModel");
var WpTagModel = Mongoose.model("WpTagModel");
var WpUserModel = Mongoose.model("WpUserModel");


// 用户Auth
var Auth = require("../module/auth.js");
const request = require("request");
var ApiController = {}

/**
 * @deprecated
 * @param {*} list 
 */
function filterDeleteUnitList(list) {
    var result = [];
    if (list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].delete_flag != 1) {
                result.push(list[i]);
            }
        }
    }
    return result;
}
//...

async function batchQueryLightSitePlan(realEstateList) {
    if (!realEstateList ||realEstateList.length <= 0) {
        return;
    }
    // 查询每个楼盘对应的总图分析/立面日照分析, 楼层日照分析(参考项目?)
    var ids = [];
    for (var i in realEstateList) {
        var item = realEstateList[i];
        ids.push(item._id);
    }

    var result = [];
    // 批量查询总图评测
    var lightSitePlans = await LightSitePlan.find({ real_estate_id: {'$in': ids} }).lean().exec();
    if (lightSitePlans && lightSitePlans.length > 0) {
        // console.log('lightSitePlans:', lightSitePlans);
        for (var i = 0; i < realEstateList.length; i++) {
            var rItem = realEstateList[i];
            var hasLigthSitePlan = false;
            for (var j in lightSitePlans) { 
                var lightItem = lightSitePlans[j];
                // 过滤掉无效日照数据
                if (lightItem.real_estate_id == rItem._id && lightItem.score && 
                    lightItem.score != 'NaN') {
                    hasLigthSitePlan = true;
                    rItem.lightSitePlan = lightItem;
                    break;
                }
            }
            if (hasLigthSitePlan) {
                result.push(rItem);
            }
        }
    }  
    return result;
}


/**
 * 查询户型评测数据(取户型基本信息数据) 查询户型评测数据(取户型基本信息数据)
 */
async function batchQueryUnitIndexList(realEstateList, size) {
    var ids = [];
    for (var i in realEstateList) {
        var item = realEstateList[i];
        ids.push(item._id);
    }
   
    var list = await UnitBasicInfo.find({ 
        'delete_flag': 0, 
        'real_estate_id': {'$in': ids}
    }).sort({'update_time': -1}).limit(size).lean().exec();

    // 存在只有日照无户型的楼盘，再补充户型数据
    if (list && list.length < ids.length) {  
        var addSize = ids.length - list.length;
        var addList = await UnitBasicInfo.find({ 
            'delete_flag': 0, 
            'real_estate_id': {'$nin': ids}
        }).sort({'update_time': -1}).limit(addSize).lean().exec();
        addList = await filterUnPublishedUnitList(addList);
        if (addList) {
            list = list.concat(addList);
        }
    }
    return list;
}



/**
 * 过滤掉未发布的楼盘-户型数据
 * @deprecated
 * @param {*} list 
 */
async function filterUnPublishedUnitList(list) {
    var ids = [];
    for (var i in list) {
        var item = list[i];
        ids.push(item.real_estate_id);
    }
    var realEstateList = await RealEstate.find({ _id: {'$in': ids}, status: 1 }).lean().exec();
    // console.log("filterUnPublishedUnitList: ", list, realEstateList);
    
    var result = [];
    for (var i in list) {
        for (var j in realEstateList) {
            if (realEstateList[j]._id == list[i].real_estate_id) {
                result.push(list[i]);
                break;
            }
        }
    }
    return result;
}


/**
 * 首页聚合接口
 * 查询楼盘和户型, 目前按照最新排序
 */
ApiController.queryIndex = async function(ctx) {
    var reqData = Util.getRequestData(ctx);
    var size = reqData.size;
    var defaultSize = 10;
    if (!size) {
        size = defaultSize;
    } else {
        size = parseInt(size);
        if (size < 0) {
            size = defaultSize;
        }
    }
    // console.log('lastSize:', size);
    // lean() 将结果转化为js object格式
    var result = await RealEstate.find({ status: 1 }).sort({'update_time': -1}).limit(size).lean().exec();
    if (result && result.length > 0) {
        var lightList = await batchQueryLightSitePlan(result); // 查总图
        var unitList = await batchQueryUnitIndexList(result, size);
        ctx.body = { success: true, data: {light: lightList, unit: unitList} }; 
    } else {
        ctx.body = { success: false,  code: Constant.RESPONSE_EMPTY_DATA, msg: '无楼盘数据'}; 
    }
}


/**
 * 查询FILE
 * 
 */
ApiController.getFileList = async function(ctx) {
    var result = [
        'ad1',
        'ad2',
        'ad3',
        'ew1',
        'ew2',
        'main1',
        'main2',
        'main3',
        'main4',
        'main5'
    ]
    if (result) {
        ctx.body = { success: true, data: result }; 
    } 
}


/**
 * 查询API
 * 
 */
ApiController.getApiList = async function(ctx) {
    var result = [
        {
            '接口函数名': 'getApiList',
            '协议类型': 'GET',
            '参数': '[nil]',
            '返回值': '[{接口函数名,协议类型,参数,返回值}...]',
        },
        {
            '接口函数名': 'deleteFile',
            '协议类型': 'GET',
            '参数': '{delid}',
            '返回值': '"result"'
        },
        {
            '接口函数名': 'submitFile',
            '协议类型': 'GET',
            '参数': '{id,name,fath,kind,url}',
            '返回值': '{msg}'
        },
    ]
    if (result) {
        ctx.body = { success: true, data: result }; 
    } 
}


/**
 * 查询DBList
 * 
 */
ApiController.getDBList = async function(ctx) {
    let result = {}
    result.list = [
        'WpTagModel',
        'WpInteractModel',
        'WpRealEstateModel',
        'WpRecordModel',
        'WpUserModel'
    ]
    result.items = {
        'WpTagModel': {
            id: '',
            real_estate_id: '', 
            user_id: '',
            tag_name: '',
            tag_content_id: '',
            views_num: '',
            tag_status: '',
            create_time: '',
            update_time: '',
        },
        'WpInteractModel': {
            id: '',
            tag_id: '', 
            interact_type: '',
            user_type: '',
            user_id: '',
            to_interact_id: '',
            interact_content: '',
            interact_status: '',
            msg_status: '',
            create_time: '',
            update_time: '',
        },
        'WpRealEstateModel': {
            id: '', 
            real_estate_area:'',
            real_estate_name: '',
            views_num: '',
            create_time: '',
            update_time: '',
        },
        'WpRecordModel': {
            id: '',
            tag_id: '', 
            record_type: '',
            user_id: '',
            create_time: '',
            update_time: '',
        },
        'WpUserModel': {
            id: '', 
            open_id: '', 
            user_name: '', 
            user_type: '',
            head_url: '',
            create_time: '',
            update_time: '',
        }
    }
    /*
    let dataModel = WpRealEstateModel
    let item = {
        'id': '',
        'real_estate_area': '绿城',
        'real_estate_name': '丽江公寓',
        'views_num': 1246
    }
    for (let index in result) {
        dataModel = eval(result[index])
        let list = await dataModel.find({}).lean().exec()
        let newItem = new dataModel();
        // console.log(JSON.stringify(newItem))
        if (list.length === 0) {
            let newItem = new dataModel();
            // console.log(JSON.stringify(newItem))
            let r = await newItem.save();
        }
    } */
    if (result) {
        ctx.body = { success: true, data: result }
    } 
} 


ApiController.wxGetOpenID = async function(ctx, code) {
    let p = new Promise((resolve,reject) => {
        request('https://api.weixin.qq.com/sns/jscode2session?grant_type=authorization_code&appid=wx0a31a8ee5d7edfa7&secret=fc3cf9a9ac5f343662e14c1cfa0071fd&js_code=' + code,(err, response, data) => {
            if (response.statusCode === 200) {
                resolve(data)
            }
        })
    })
    return p
}

ApiController.wxCheckMsg = async function(form) {
    let p = new Promise((resolve,reject) => {
        request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx0a31a8ee5d7edfa7&secret=fc3cf9a9ac5f343662e14c1cfa0071fd',(err, response, data) => {
            if (response.statusCode === 200) {
                resolve(data)
            }
        })
    })
    let res = await p
    let option = {
        url: 'https://api.weixin.qq.com/wxa/msg_sec_check?access_token=' + JSON.parse(res).access_token,
        method: "POST",
        json: true,
        headers:{
            "Content-type": "application/json; charset=UTF-8",
            "Accept": "application/json; charset=UTF-8",
        },
        body: form
    }
    let pt = new Promise((resolve,reject) => {
        request(option,(err, response, data) => {
            if (response.statusCode === 200) {
                resolve(data)
            }
        })
    })
    return (await pt).errcode
}

/**
 * 获取OpenId
 * 
 */
ApiController.getUser = async function(ctx) {
    var reqData = Util.getRequestData(ctx);
    let code = reqData.code
    
    let grant_type = 'authorization_code'
    let appid = 'wx0a31a8ee5d7edfa7'
    let secret = 'fc3cf9a9ac5f343662e14c1cfa0071fd'

    let reqItem = {
        grant_type: grant_type, 
        appid: appid, 
        secret: secret, 
        js_code: code
    }

    let data = await ApiController.wxGetOpenID(ctx, code)
    // console.log("[openid]", JSON.parse(data).openid)
    // console.log("[session_key]", JSON.parse(data).session_key)
    let res = await WpUserModel.find({open_id: JSON.parse(data).openid}).lean().exec()
    if (res.length > 0) {
        ctx.body = { success: true, msg: 'have data', data: res}
    }  else {
        ctx.body = { success: true, msg: 'no data', data: data}
    }
    /* request('https://api.weixin.qq.com/sns/jscode2session?grant_type=authorization_code&appid=wx9a50157194dab24e&secret=86b50a6296181a37c4e8db2df1cdb354&js_code=' + code/*{ 
        /*
      uri: 'https://api.weixin.qq.com/sns/jscode2session&#039', 
      json: true, 
      qs: { 
        grant_type: 'authorization_code', 
        appid: 'wx9a50157194dab24e', 
        secret: 'ca4c3331c1b365476d2378ff7097c329', 
        js_code: code 
      }
      method:"GET",
      url: 'https://api.weixin.qq.com/sns/jscode2session', 
      body: JSON.stringify(reqItem),
      headers: {
        "content-type": "application/json",
      },
      json:true 
    },(err, response, data) => {
        if (response.statusCode === 200) {
            // console.log("[openid]", data.openid)
            // console.log("[session_key]", data.session_key)
            // console.log(JSON.stringify(reqItem))
            // console.log(data)
            // let res = await WpUserModel.find({open_id: data.openid}).lean().exec()
            if (res.length > 0) {
                ctx.body = { success: true, msg: 'yes', data: res}
            } else {
                ctx.body = { success: false, msg: 'no'}
                /*
                var opts = {
                    method: 'GET',
                    url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET',
                    header: {
                      'content-type': 'application/json' // 默认值
                    }
                  }
                  // 获取access_token接口
                  url.get(opts).then(function (res) {
                    code = JSON.parse(res);
                    if (code.access_token != null)
                      data.accessToken = code.access_token;
                    else {
                      // console.log('job error:' + res);
                    }
                  }).catch(function (err) {
                    // console.log(err);
                  })
            }
        }
    }) */
    // console.log("exit")
}

/**
 * WebSocket
 * 
 */
ApiController.listen = async function(ctx) {
    ctx.websocket.on("message", (message) => {
        // console.log(message);
        for(let i = 0; i < ctxs.length; i++) {
            if (ctx == ctxs[i]) continue;
            ctxs[i].websocket.send(message);
        }
    });
    ctx.websocket.on("close", (message) => {
        /* 连接关闭时, 清理 上下文数组, 防止报错 */
        let index = ctxs.indexOf(ctx);
        ctxs.splice(index, 1);
    });
}
/**
 * 提交功能
 * 
 */
ApiController.update = async function(ctx) {
    var reqData = Util.getRequestData(ctx);
    let promptModel = reqData.model;
    let item = JSON.parse(reqData.item)
    // console.log(item)
    let items = JSON.parse(reqData.items)
    let db = reqData.db;
    let keys = []
    for (let key in item) {
        if (key !== '_id') keys.push(key)
    }
    if (item.hasOwnProperty('interact_type') && item['interact_type'] === '点踩') {
        var result = await WpInteractModel.find({ to_interact_id : item['to_interact_id'], interact_type : '点踩'}).lean().exec()
        if (result.length === 10) {
            let tag = await WpTagModel.findOne({ id : item['tag_id']}).lean().exec()
            if (tag['tag_content_id'] === item['id']) {
                tag.tag_status = 'ERROR'
                ctx.request.body = tag
                await AdminController.commonSaveData(ctx,{
                    dataModel: WpTagModel,
                    findKeys: ['id'], 
                    newDataKeys: ['tag_status'],
                    resultCallback: function() {
                        ctx.body = { success: true, msg: 'yes' };
                    }
                });
            }
            let temp = await WpInteractModel.findOne({ id : item['to_interact_id']}).lean().exec()
            temp.interact_status = 'ERROR'
            ctx.request.body = temp
            await AdminController.commonSaveData(ctx,{
                dataModel: WpInteractModel,
                findKeys: ['id'], 
                newDataKeys: ['interact_status'],
                resultCallback: function() {
                    ctx.body = { success: true, msg: 'yes' };
                }
            });
        }
    }
    if (item.hasOwnProperty('interact_type') && item['interact_type'] === '点赞') {
        let temp = await WpInteractModel.findOne({ id : item['to_interact_id']}).lean().exec()
        temp.interact_status = (Number(temp.interact_status) + 1) + ''
        ctx.request.body = temp
        await AdminController.commonSaveData(ctx,{
            dataModel: WpInteractModel,
            findKeys: ['_id'], 
            newDataKeys: ['interact_status'],
            resultCallback: function() {
                ctx.body = { success: true, msg: 'yes' };
            }
        });
    } else if (item['interact_type'] === '取消赞') {
        // console.log('取消赞')
        let temp = await WpInteractModel.findOne({ id : item['to_interact_id']}).lean().exec()
        if (Number(temp.interact_status) > 0) temp.interact_status = (Number(temp.interact_status) - 1) + ''
        ctx.request.body = temp
        await AdminController.commonSaveData(ctx,{
            dataModel: WpInteractModel,
            findKeys: ['id'], 
            newDataKeys: ['interact_status'],
            resultCallback: function() {
                ctx.body = { success: true, msg: 'yes' };
            }
        });
    }
    if (promptModel === 'edit') {
        for (let index in item) {
            let checkResult = await ApiController.wxCheckMsg({content: item[index]})
            if (checkResult === 87014) {
                ctx.body = { success: false, msg: 'invalid msg' };
                return
            }
        }
        ctx.request.body = item
        if (!item.hasOwnProperty('id')||item['id'] === '') {
            let rndNum = n => {
                var rnd = ''
                for (var i = 0; i < n; i++) {
                  rnd += Math.floor(Math.random() * 10)
                }
                return rnd
            }
            keys.push('id')
            item['id'] = rndNum(6)
        }
        if (!item.hasOwnProperty('_id')||item['_id'] === '') {
            await AdminController.commonSaveData(ctx,{
                dataModel: eval(db),
                findKeys: ['id'], 
                newDataKeys: keys,
                resultCallback: function() {
                    ctx.body = { success: true, msg: 'yes', data:item};
                }
            });
        } else {
            await AdminController.commonSaveData(ctx,{
                dataModel: eval(db),
                findKeys: ['_id'], 
                newDataKeys: keys,
                resultCallback: function() {
                    ctx.body = { success: true, msg: 'yes', data:item};
                }
            });
        }
    } else if (promptModel === 'multiEdit') {
        for (let index in items) {
            for (let key in item) {
                if(item[key] === 'DEFAULT+10000000' && !isNaN(Number((items[index])[key]))) (items[index])[key] = Number((items[index])[key]) + 10000000 + ''
                else if(item[key] !== 'DEFAULT' && item[key] !== 'DEFAULT+10000000') (items[index])[key] = item[key]
            }
            ctx.request.body = items[index]
            await AdminController.commonSaveData(ctx,{
                dataModel: eval(db),
                findKeys: ['_id'], 
                newDataKeys: keys,
                resultCallback: function() {
                    ctx.body = { success: true, msg: 'yes' };
                }
            });
        }
    } else {
        ctx.request.body = item
        if (item['_id'] === ''||!item.hasOwnProperty('_id')) {
            if (item['id'] === ''||!item.hasOwnProperty('id')) {
                let rndNum = n => {
                    var rnd = ''
                    for (var i = 0; i < n; i++) {
                      rnd += Math.floor(Math.random() * 10)
                    }
                    return rnd
                }
                item['id'] = rndNum(6)
            }
            await AdminController.commonSaveData(ctx,{
                dataModel: eval(db),
                findKeys: ['id'], 
                newDataKeys: keys,
                resultCallback: function() {
                    ctx.body = { success: true, msg: 'yes' };
                }
            });
        } else {
            await AdminController.commonSaveData(ctx,{
                dataModel: eval(db),
                findKeys: ['_id'], 
                newDataKeys: keys,
                resultCallback: function() {
                    ctx.body = { success: true, msg: 'yes' };
                }
            });
        }
    }
}



/**
 * 删除功能
 * 
 */
ApiController.delete = async function(ctx) {
    let reqData = Util.getRequestData(ctx);
    let db = reqData.db;
    let items = JSON.parse(reqData.items);
    for (let index in items) {
        let result = await eval(db).remove({_id:items[index]._id}).exec();
    }
    let result = {
        msg: 'success'
    }
    ctx.body = { success: true, data: result }; 
}


/**
 * 查询DB
 * 
 */
ApiController.getDB = async function(ctx) {
    var reqData = Util.getRequestData(ctx)
    let db = reqData.dataContent
    var result = await eval(db).find({}).sort({'create_time': -1}).lean().exec()
    if (result) {
        ctx.body = { success: true, data: result }
    }
}


/**
 * 点赞功能
 * 查询点赞次数
 */
ApiController.queryZan = async function(ctx) {
    var reqData = Util.getRequestData(ctx);
    var id = reqData['real_estate_id'];

    var result = await UnitZanNumber.findOne({ real_estate_id: id }).lean().exec();
    
    if (result) {
        ctx.body = { success: true, data: result }; 
    } else {
        ctx.body = { success: false,  code: Constant.RESPONSE_EMPTY_DATA, msg: '查询出错，无数据'}; 
    }
}


/**
 * 点赞功能
 * 根据楼盘id进行点赞数统计
 */
ApiController.zan = async function(ctx) {
    var reqData = Util.getRequestData(ctx);

    //var reqData = ctx.request.body;
    var dataModel= UnitZanNumber;

    if (!reqData['real_estate_id']) {
        ctx.body = { success: false, msg: '无效参数：参数不能为空' };
        return;
    }

    await AdminController.commonSaveZanData(ctx, {
        dataModel: dataModel,
        findKeys: ["real_estate_id"], 
        newDataKeys: ['real_estate_id', 'zan_number'],
        resultCallback: function() {
            ctx.body = { success: true, msg: 'yes' };
        }
    });
}


/**
 * 查询楼盘列表
 * 楼盘列表
 */
ApiController.queryRealEstateList = async function(ctx) {
    var reqData = Util.getRequestData(ctx);

    var result = await WpRealEstateModel.find({}).sort({'create_time': -1}).lean().exec();
    for (index in result) {
        let list = await WpTagModel.find({
            real_estate_id: result[index].id, tag_status: { $nin: ['ERROR', 'DELETE'] }
        }).sort({'update_time': -1}).lean().exec();
        result[index].tagList = list
    }
    
    if (result) {
        ctx.body = { success: true, data: result }; 
    } else {
        ctx.body = { success: false, code: Constant.RESPONSE_EMPTY_DATA, msg: '查询出错，无数据'}; 
    }
}


/**
 * 查询指定楼盘标签
 * 标签列表
 */
ApiController.queryRealEstateDetail = async function(ctx) {
    var reqData = Util.getRequestData(ctx);
    var id = reqData.real_estate_id;
    var result = {};

    var realEstate = await WpRealEstateModel.findOne({ id: id }).lean().exec();
    if (realEstate) {
        result.realEstate = realEstate;
    }

    // 获取标签列表
    let list = await WpTagModel.find({
        real_estate_id: id, tag_status: { $nin: ['ERROR', 'DELETE'] }
    }).sort({'update_time': -1}).lean().exec();
    let errorList = await WpTagModel.find({ real_estate_id: id, tag_status: 'ERROR' }).lean().exec()
    result.realEstate.errNum = errorList.length
    console.log(result.realEstate.errNum)
    

    if (list && list.length > 0) {
        // 获取浏览量前三标签列表
        let topList = await WpTagModel.find({
            real_estate_id: id, tag_status: { $nin: ['ERROR', 'DELETE'] }
        }).sort({'tag_status': -1}).limit(3).lean().exec();
        let length = list.length
        if (list && list.length > 0) {
            for (let index = 0;index < length;index ++) {
                for (iindex in topList) {
                    if (list[index].id === topList[iindex].id) {
                        list.splice(index, 1)
                        index --
                        length --
                        break
                    }
                }
            }        
        }
        result.tagList = topList.concat(list)
        for (let index in result.tagList) {
            if (result.tagList[index].hasOwnProperty('tag_content_id')) {
                let user = await WpUserModel.findOne({ id: result.tagList[index].user_id }).lean().exec();
                let temp = await WpInteractModel.findOne({ id: result.tagList[index].tag_content_id }).lean().exec();
                if (temp['user_type'] === '匿名') {
                    let nuser = {}
                    nuser.user_name = '匿名用户' + user.id
                    nuser.head_url = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1539347217298&di=d615dcf0abe0435389f7ae26add037f3&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201705%2F07%2F20170507160711_uU3Zy.jpeg'
                    temp['user'] = nuser
                } else temp['user'] = user
                let tempList = await WpInteractModel.find({ to_interact_id : temp['id'], interact_type : '点踩'}).lean().exec()
                let commentList = await WpInteractModel.find({ tag_id : result.tagList[index]['id'], interact_type : { $in: ['评论', '回复'] }}).lean().exec()
                let commentGrade = commentList.length
                temp['cnum'] = tempList.length
                result.tagList[index].interact = temp
                let timeStr = result.tagList[index].create_time.split(' ')[0].split('-')
                let nowStr = Util.nowDateTime().split(' ')[0].split('-')
                let timeGrade

                if (timeStr[0] === nowStr[0] && timeStr[1] === nowStr[1] && (Number(nowStr[2]) - Number(timeStr[2])) < 7) timeGrade = (Number(nowStr[2]) - Number(timeStr[2]))
                else timeGrade = 7
                let consoleObject = {
                    '标签名': result.tagList[index].tag_name,
                    '浏览量得分': result.tagList[index].views_num,
                    '评论得分': commentGrade,
                    '时间扣分': timeGrade,
                    '点赞数得分': temp.interact_status,
                    '点踩数得分': temp.cnum
                }
                // console.log('评分机制', timeGrade)
                let grade = 5 + result.tagList[index].views_num - timeGrade * 6 + Number(temp.interact_status) * 2 - temp.cnum * 2 +commentGrade * 3
                if (grade >= 0) {
                    result.tagList[index].tag_status = grade + ''
                    let textLength = 6 - result.tagList[index].tag_status.length
                    for (let i = 0; i <= textLength; i++) result.tagList[index].tag_status = '0' + result.tagList[index].tag_status
                } else result.tagList[index].tag_status = 'ERROR'
                ctx.request.body = result.tagList[index]
                await AdminController.commonSaveData(ctx,{
                    dataModel: WpTagModel,
                    findKeys: ['_id'], 
                    newDataKeys: ['tag_status'],
                    resultCallback: function() {
                        ctx.body = { success: true, msg: 'yes' }
                    }
                })
                result.tagList[index].comment_num = commentGrade
            }
        }
    }

    // 增加该楼盘浏览量
    ApiController.addViews(id, 'WpRealEstateModel', ctx)

    if (result && result.realEstate) {
        ctx.body = { success: true, data: result }; 
    } else {
        ctx.body = { success: false, code: Constant.RESPONSE_EMPTY_DATA, msg: '查询出错，无数据'}; 
    }
}


/**
 * 查询指定标签
 * 交互列表
 */
ApiController.queryTagDetail = async function(ctx) {
    var reqData = Util.getRequestData(ctx);
    var id = reqData.tag_id;
    var result = {};
    var tag = await WpTagModel.findOne({ id: id }).lean().exec();
    if (!tag) {
    } else {
        result.tag = tag;
    }

    let list = await WpInteractModel.find({
        tag_id: id, interact_type: { $nin: ['点赞','点踩','取消赞','取消踩'] }
    }).sort({'create_time': -1}).lean().exec();

    let errorList = await WpInteractModel.find({
        tag_id: id, interact_status: 'ERROR'
    }).lean().exec();
    result.tag.errNum = errorList.length

    if (list && list.length > 0) {
        let topList = await WpInteractModel.find({
            tag_id: id, interact_status: { $nin: ['ERROR', '0']}, interact_type: { $nin: ['回复','点赞','点踩','取消赞','取消踩'] }
        }).sort({'interact_status': -1}).limit(3).lean().exec();
        let length = list.length
        let index = 0
        if (topList) {
            for (let iindex in topList) {
                if (tag.tag_content_id === topList[iindex].id) {
                    topList.splice(iindex, 1)
                    break
                }
            }
            for (index = 0; index < length; index ++) {
                if (list[index].id === tag.tag_content_id) topList = [list[index]].concat(topList)
                for (let iindex in topList) {
                    if (list[index].id === topList[iindex].id) {
                        list.splice(index, 1)
                        index --
                        length --
                        break
                    }
                }
            }        
        }
        result.interactList = topList.concat(list)

        for (let index in result.interactList) {
            result.interactList[index]['update_time'] = result.interactList[index]['update_time'].replace(/\-/g,'/')
            if (result.interactList[index]['interact_type'] === '回复') {
                result.interactList[index].to_interact = await WpInteractModel.findOne({ id: result.interactList[index].to_interact_id }).lean().exec();
                let user = await WpUserModel.findOne({ id: result.interactList[index].to_interact.user_id }).lean().exec();
                if (result.interactList[index].to_interact['user_type'] === '匿名') {
                    let nuser = {}
                    nuser.user_name = '匿名用户' + user.id
                    nuser.head_url = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1539347217298&di=d615dcf0abe0435389f7ae26add037f3&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201705%2F07%2F20170507160711_uU3Zy.jpeg'
                    result.interactList[index].to_interact['user'] = nuser
                } else result.interactList[index].to_interact['user'] = user
            }
            let user = await WpUserModel.findOne({ id: result.interactList[index].user_id }).lean().exec();
            if (result.interactList[index]['user_type'] === '匿名') {
                let nuser = {}
                nuser.user_name = '匿名用户' + user.id
                nuser.head_url = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1539347217298&di=d615dcf0abe0435389f7ae26add037f3&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201705%2F07%2F20170507160711_uU3Zy.jpeg'
                result.interactList[index]['user'] = nuser
            } else result.interactList[index]['user'] = user
            let temp = await WpInteractModel.find({ to_interact_id : result.interactList[index]['id'], interact_type : '点踩'}).lean().exec()
            result.interactList[index]['cnum'] = temp.length
        }
    }

    // 增加该楼盘浏览量
    ApiController.addViews(id, 'WpTagModel', ctx)

    if (!result) {
        ctx.body = { success: false,  code: Constant.RESPONSE_EMPTY_DATA, msg: '查询出错，无数据'}; 
    } else {
        ctx.body = { success: true, data: result }; 
    }
}

/**
 * 查询历史记录和阅读记录和消息记录
 * 指定用户
 */
ApiController.queryUserDetail = async function(ctx) {
    var reqData = Util.getRequestData(ctx);
    var id = reqData.user_id;
    var result = {};

    var user = await WpUserModel.findOne({ id: id }).lean().exec();
    if (user) {
        result.user = user;
    }

    var recordList = await WpRecordModel.find({ user_id: id, record_type: '收藏记录' }).sort({'create_time': -1}).lean().exec()
    if (recordList) {
        let length = recordList.length
        let index = 0
        for (index = 0; index < length; index++) {
            recordList[index].tag = await WpTagModel.findOne({ id: recordList[index].tag_id }).lean().exec()
            if (!recordList[index].tag) continue 
            if (recordList[index].tag.tag_status === 'DELETE') {
                recordList.splice(index, 1)
                length --
                index --
                continue
            }
            recordList[index].realEstate = await WpRealEstateModel.findOne({ id: recordList[index].tag.real_estate_id }).lean().exec()
        }
        result.recordList = recordList
    }
 
    // 获取交互列表
    var list = await WpInteractModel.find({ user_id: id, interact_type: { $nin: ['取消赞', '取消踩'] } }).lean().exec();
    var intlist = await WpInteractModel.find({ user_id: id, interact_type: { $nin: ['评论','回复','取消赞', '取消踩'] } }).lean().exec();

    if (intlist) {
        result.interactList = intlist;
    }

    // 获取话题列表
    var tagList = await WpTagModel.find({ user_id: id, tag_status: { $nin: ['ERROR', 'DELETE'] } }).lean().exec();
    if (tagList) {
        for (let index in tagList) {
            tagList[index].realEstate = await WpRealEstateModel.findOne({ id: tagList[index].real_estate_id }).lean().exec()
        }
        result.tagList = tagList;
    }

    // 获取消息列表
    let userArr = {}
    let idArr = []
    for (let index in list) idArr.push(list[index].id)
    let msgList = await WpInteractModel.find({ to_interact_id: { $in: idArr }, interact_type: { $nin: ['取消赞', '取消踩'] } }).sort({'create_time': 1}).lean().exec();
    for (let iindex in msgList) {
        msgList[iindex]['update_time'] = msgList[iindex]['update_time'].replace(/\-/g,'/')
        if (msgList[iindex]['user_type'] === '匿名') msgList[iindex]['user_id'] = '匿名用户' + msgList[iindex]['user_id']
        if (!(userArr.hasOwnProperty(msgList[iindex].user_id))) {
            if (msgList[iindex]['user_type'] === '匿名') {
                let nuser = {}
                nuser.user_name = msgList[iindex]['user_id']
                nuser.head_url = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1539347217298&di=d615dcf0abe0435389f7ae26add037f3&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201705%2F07%2F20170507160711_uU3Zy.jpeg'
                userArr[msgList[iindex].user_id] = nuser
            } else userArr[msgList[iindex].user_id] = await WpUserModel.findOne({ id: msgList[iindex].user_id }).lean().exec()
        }
        let tag = await WpTagModel.findOne({ id: msgList[iindex].tag_id }).lean().exec()
        if (tag) {
            let realEstate = await WpRealEstateModel.findOne({ id: tag.real_estate_id }).lean().exec()
            if (!realEstate) continue 
            msgList[iindex].real_estate_name = realEstate.real_estate_name
        }
    }
    result.msgList = msgList;
    result.userList = userArr;

    if (result) {
        ctx.body = { success: true, data: result }; 
    } else {
        ctx.body = { success: false,  code: Constant.RESPONSE_EMPTY_DATA, msg: '查询出错，无数据'}; 
    }
}


/**
 * 浏览功能
 * 增加浏览量
 */
ApiController.addViews = async function(id, kind, ctx) {
    let item
    let dataModel
    switch(kind) {
        case 'WpRealEstateModel':
            dataModel= WpRealEstateModel
            break
        case 'WpTagModel':
            dataModel= WpTagModel
            break
        default:
    }

    item = await dataModel.findOne({ id: id }).lean().exec()
    item['views_num'] += 1
    ctx.request.body = item
    await AdminController.commonSaveData(ctx, {
        dataModel: dataModel,
        findKeys: ["id"], 
        newDataKeys: ['views_num'],
        resultCallback: function() {
            ctx.body = { success: true, msg: 'yes' };
        }
    });
}


/**
 * 查询 楼盘日照分析详情
 */
ApiController.queryEvaluateLightDetail = async function(ctx) {
    var reqData = Util.getRequestData(ctx);
    var id = reqData.id;
    // TODO 先采用合并数据的方式，后面再看实际点击及用户反馈 改为点击tab再请求
    // 查询总图数据
    // console.log(reqData);
    // console.log(id);
    var result = {};
    var lightSitePlan = await LightSitePlan.findOne({ real_estate_id: id }).lean().exec();
    if (lightSitePlan) {
        result.lightSitePlan = lightSitePlan;
    }

    // 立面光照分析(列表格式，可能有多个)
    var list = await LightElevationPlan.find({
        real_estate_id: id,
    }).lean().exec();
    if (list && list.length > 0) {
        result.lightElevationPlans = list;
    }

    // 楼层日照分析
    var floorList = await LightFloor.find({
        real_estate_id: id,
    }).lean().exec();
    if (floorList && floorList.length > 0) {
        result.lightFloors = floorList;
    }

    // @deprecated
    // 楼层窗户日照分析(列表格式，可能有多个)
    // var lightWindowList = await LightWindow.find({
    //     real_estate_id: id,
    // }).lean().exec();
    // if (lightWindowList && lightWindowList.length > 0) {
    //     result.lightWindow = lightWindowList;
    // }
 
    if (result && result.lightSitePlan) {
        ctx.body = { success: true, data: result }; 
    } else {
        ctx.body = { success: false,  code: Constant.RESPONSE_EMPTY_DATA, msg: '查询出错，无数据'}; 
    }
}


/**
 * 查询楼盘户型分析详情
 * (查询多个户型数据)
 */
ApiController.queryEvaluateUnitDetail = async function(ctx) {
    var reqData = Util.getRequestData(ctx);
    var realEstateId = reqData.id;

    var units = {};

    var queryAndSet = async function(dataModel, unitNos, key) {
        var list = await dataModel.find({
            'real_estate_id': realEstateId ,
            'unit_no': unitNos,
        }).lean().exec();
        // console.log(unitNos[i]);
        if (list && list.length > 0) {
            for (var i in unitNos) {
                for (var j in list) {
                    if (list[j].unit_no == unitNos[i]) {
                        // console.log("bingo:", unitNos[i], list[j]);
                        var item = list[j];
                        if (!units[unitNos[i]]) {
                            units[unitNos[i]] = {};
                        }
                        units[unitNos[i]][key] = item;
                        break;
                    }
                }
            }
        }  
    }

    var unitNos = [];
    // 户型基本信息
    var list = await UnitBasicInfo.find({ 'real_estate_id': realEstateId, 'delete_flag': 0 }).lean().exec();
    // console.log('find UnitBasicInfo: ', list);
    if (list && list.length > 0) {
        for (var i in list) {
            var litItem = list[i];
            units[litItem['unit_no']] = {'unit_basic_info': litItem};
            unitNos.push(litItem['unit_no']);
        }
    }  
    if (unitNos.length <= 0) {
        ctx.body = { success: false,  code: Constant.RESPONSE_EMPTY_DATA, msg: '查询出错，无数据'}; 
    } else {
        await queryAndSet(UnitRoomArea, unitNos, 'unit_room_area');
        await queryAndSet(UnitRegionFlow, unitNos, 'unit_region_flow');
        await queryAndSet(UnitWindowVentilate, unitNos, 'unit_window_ventilate');
        await queryAndSet(UnitDetail, unitNos, 'unit_detail');
        // console.log(units);
        ctx.body = { success: true, data: units }; 
    }
}


ApiController.trackDataView = async function(ctx) {
    var reqData = Util.getRequestData(ctx);
    var type = reqData.type;
    var id = reqData.id;
    if (type == 'light') { // 楼盘日照项
        var result = await LightSitePlan.update({ real_estate_id: reqData.id }, { $inc:{view_count:1} }).exec();
        ctx.body = { success: true, data: result }; 
    } else if (type == 'unit') {
        var result = await UnitBasicInfo.update({ real_estate_id: reqData.id, unit_no: reqData.unit_no }, 
            { $inc:{view_count:1} }).exec();   
        ctx.body = { success: true, data: result }; 
    } else {
        ctx.body = { success: false }; 
    }
}


/**
 * 搜索接口
 */
ApiController.search = async function(ctx) {
    var reqData = Util.getRequestData(ctx);
    var key = reqData.key;
    var targetStr= reqData.targets;
    if (!key) {
        ctx.body = { success: false, msg: '参数未设置' }; 
        return;
    }
    if (!targetStr) { // 默认搜索目标为楼盘
        targetStr = 'real_estate';
    }

    var targets = targetStr.split('|');
    var arr = [];

    // 以key查匹配的楼盘
    var realEstateList = await RealEstate.find({ 
        name: new RegExp(key, 'i'),
        status: 1, // 已发布状态
    }).lean().exec();
    if (targets.indexOf('real_estate') >= 0) { // 楼盘-日照
        if (realEstateList && realEstateList.length > 0) {
            var lightList = await batchQueryLightSitePlan(realEstateList);
            // console.log("query real estate:", lightList);
            arr = arr.concat(lightList);
        }  
    }

    if (targets.indexOf('unit') >= 0) { // 楼盘-户型
        // 1.根据楼盘查询对应所有户型数据
        var unitSizeByRealEstate = 10;
        if (realEstateList && realEstateList.length > 0) {
            var l = await batchQueryUnitIndexList(realEstateList, unitSizeByRealEstate);
            arr = arr.concat(l);
        }

        // 2.查询key匹配的户型unit_no
        var list = await UnitBasicInfo.find({ 
            'unit_no': new RegExp(key, 'i'),
            'delete_flag': 0,
        }).lean().exec();
        // console.log("search unit list:", list);
        // 过滤掉未发布的楼盘
        if (list && list.length > 0) {
            var lastList = await filterUnPublishedUnitList(list);
            // console.log("after filter lasList:", lastList);
            arr = arr.concat(lastList);
        }  
    }

    if (arr && arr.length > 0) {
        ctx.body = { success: true, data: arr }; 
    } else {
        ctx.body = { success: false,  code: Constant.RESPONSE_EMPTY_DATA, msg: '无楼盘数据'}
    }
}


////////////////////////////////////////////////////////
//
// api controller, 用户权限相关接口
//
////////////////////////////////////////////////////////

/**
 * 用户注册
 */
ApiController.register = async function(ctx) {
    await Auth.serveRegister(ctx);
}


/**
 * 用户登录
 */
ApiController.login = async function(ctx) {
    await Auth.serveLogin(ctx);
}


module.exports = ApiController;