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
// require('../model/unit_synthesis.js')


const Mongoose = require("mongoose");
const Constant = require("../module/constant.js");
const Util = require("../module/util.js");

// 模型定义
var RealEstate = Mongoose.model("RealEstate");
var LightSitePlan = Mongoose.model("LightSitePlan");
var LightElevationPlan = Mongoose.model("LightElevationPlan");
var LightFloor = Mongoose.model("LightFloor");
var LightWindow = Mongoose.model("LightWindow");

// var UnitSynthesis = Mongoose.model("UnitSynthesis");
var UnitBasicInfo = Mongoose.model("UnitBasicInfo");
var UnitRoomArea = Mongoose.model("UnitRoomArea");
var UnitRegionFlow = Mongoose.model("UnitRegionFlow");
var UnitWindowVentilate = Mongoose.model("UnitWindowVentilate");
var UnitDetail = Mongoose.model("UnitDetail");

// 用户Auth
var Auth = require("../module/auth.js");


// 网络相应 返回码
var ApiController = {
     
}

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
                        console.log("bingo:", unitNos[i], list[j]);
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