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
require("../model/unit_room_area.js");
require("../model/unit_region_flow.js");
require("../model/unit_window_ventilate.js");
require("../model/unit_detail.js");
// require('../model/unit_synthesis.js')

const Mongoose = require("mongoose");
const Constant = require("../module/constant.js");
const Util = require("../module/util.js");

// 模型
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


var AdminController = {
     
}


/**
 * 保存楼盘
 */
AdminController.saveRealEstate = async function(ctx) {
    var reqData = ctx.request.body;

    var createData = function(isUpdate) {
        var result = {
            name: reqData.name,
            city: reqData.city,
            location: "",
            extra_info: "",
            status: 0, // 默认 保存状态
            delete_flag: 0, // 默认未删除
        };
        result['update_time'] = Util.nowDateTime();
        // date换成YYYY-MM-DD HH:MM:SS格式
        if (isUpdate) { 
            result['create_time'] = Util.nowDateTime();
        }
        return result;
    }

    if (reqData.real_estate_id) { // 更新逻辑
        var result = await RealEstate.findOne({ _id: reqData.real_estate_id }).exec();
        if (result) {
            var param = createData(true);
            var res = await RealEstate.update({ _id: result._id }, { $set: param }).exec();
            param._id = result._id;
            param.real_estate_id = result._id;
            ctx.body = { success: true, data: param };
        } else {
            // console.log('find real_estate_id fail: ', reqData.real_estate_id);
            ctx.body = { success: false, msg: "更新失败，未找到楼盘!"};
        }
    } else { // 新增逻辑
        var result = await RealEstate.findOne({ name: reqData.name, city: reqData.city }).exec();
        // console.log("find result: ", result);
        if (result) {
            var count = await RealEstate.count({ objectId: result.objectId }).exec();
            ctx.body = { success: false, code: Constant.RESPONSE_CODE_DUP, msg: "楼盘已存在!", data: result };
        } else {
            var param = createData(false);
            var item = new RealEstate(param);
            var r = await item.save();
            ctx.body = { success: true, data: r };
        }
    }
}



/**
 * 发布楼盘
 */
AdminController.publishRealEstate = async function(ctx) {
    var reqData = ctx.request.body;

    if (reqData.real_estate_id) { // 更新逻辑
        var result = await RealEstate.findOne({ _id: reqData.real_estate_id }).exec();
        if (result) {
            var res = await RealEstate.update({ _id: result._id }, { $set: {
                status: 1,
                update_time: Util.nowDateTime(),
            } }).exec();
            var param = {};
            param._id = result._id;
            param.real_estate_id = result._id;
            ctx.body = { success: true, data: param };
        } else {
            // console.log('find real_estate_id fail: ', reqData.real_estate_id);
            ctx.body = { success: false, msg: "更新失败，未找到楼盘!"};
        }
    } else {  
        ctx.body = { success: false, msg: '无效楼盘'};
    }
}



/**
 * 查询楼盘列表(同时附上评测数据)
 */
AdminController.getRealEstateList = async function(ctx) {
    var reqData = ctx.request.body;
    // lean() 将结果转化为js object格式
    var result = await RealEstate.find({ }).lean().exec();
    if (result) {
        // 查询每个楼盘对应的总图分析/立面日照分析, 楼层日照分析(参考项目?)
        await AdminController.queryLightDataForRealEstateList(result);
        ctx.body = { success: true, data: result }; 
    } 
}


/**
 * 查询单个楼盘已评测的户型
 */
AdminController.getRealEstateUnits = async function(ctx) {
    var reqData = ctx.request.body;
    var realEstateId = reqData.real_estate_id;

    var units = {};

    var queryAndSet = async function(dataModel, unitNos, key) {
        var list = await dataModel.find({ 
            'real_estate_id': realEstateId,
            'unit_no': unitNos,
            //'delete_flag': 0, // (等后续再加上 delete_flag=0 的查询条件)
        }).lean().exec();
        console.log(list);
        if (list && list.length > 0) {
            for (var i in unitNos) {
                for (var j in list) {
                    if (list[j].unit_no == unitNos[i] && list[j].delete_flag != 1) {
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
    // 户型综述 (等后续再加上 delete_flag=0 的查询条件)
    var list = await UnitBasicInfo.find({ real_estate_id: realEstateId }).lean().exec();
    if (list && list.length > 0) {
        for (var i in list) {
            var listItem = list[i];
            if (listItem && listItem.delete_flag != 1) {
                units[listItem['unit_no']] = {'unit_basic_info': listItem};
                unitNos.push(listItem['unit_no']);
            }
        }
    }  

    await queryAndSet(UnitRoomArea, unitNos, 'unit_room_area');
    await queryAndSet(UnitRegionFlow, unitNos, 'unit_region_flow');
    await queryAndSet(UnitWindowVentilate, unitNos, 'unit_window_ventilate');
    await queryAndSet(UnitDetail, unitNos, 'unit_detail');

    ctx.body = { success: true, data: units }; 
}


/**
 * 保存楼盘总图日照分析
 */
AdminController.saveLightSitePlan = async function(ctx) {
    var reqData = ctx.request.body;
    var dataModel = LightSitePlan;

    await AdminController.commonSaveData(ctx, {
        dataModel: dataModel,
        findKeys: ["real_estate_id"], 
        newDataKeys: ['real_estate_id', 'real_estate_name', 
            'light_image_url', 'thumbnail_light_image_url', 'effect_image_url',  
            'score', 'comment', 'extra_info'],
        resultCallback: function() {
            AdminController.updateUnitTotalScore(reqData.real_estate_id, reqData.unit_no);
        }
    });
}


/**
 * 保存基本立面日照分析
 */
AdminController.saveLightElevationPlans = async function(ctx) {
    var reqData = ctx.request.body;
    // 注意：reqData是楼栋数组
    if (!reqData || reqData.length <= 0) {
        ctx.body = { success: false, code: Constant.RESPONSE_CODE_INVALID_ARGUMENT, msg: "参数错误" };
        return;
    }

    var dupArray = [];
    var data = [];
    var createNewItem = function(itemData, isUpdate) {
        var obj = AdminController.fromData(['real_estate_id', 'real_estate_name', 'building_no', 
            'building_angel', 'light_image_url', 'thumbnail_light_image_url', 'comment', 'extra_info'], itemData);
        obj['update_time'] = Util.nowDateTime();
        if (!isUpdate) {
            obj.create_time = Util.nowDateTime();
        }   
        return obj;
    };

    // 查询楼盘下所有楼栋立面数据
    var oldList = await LightElevationPlan.find({
        real_estate_id: reqData[0].real_estate_id,
    }).lean().exec();
    // console.log("oldList:", oldList);

    var findFunc = function(buildingNo, list) {
        var result = null;
        for (var key in list) {
            var item = list[key];
            if (item.building_no == buildingNo) {
                result = item;
                break;
            }
        }
        return result;
    }

    for (var key in reqData) {
        var item = reqData[key];
        if (!item.real_estate_id) {
            continue;
        }
        var result = findFunc(item.building_no, oldList);  
        //console.log("findResult:", result);
        if (result) {
            console.log("[saveLightElevationPlans]isSameData: ", result, item);
            // 更新逻辑
            if (!Util.isSameData(result, item)) {
                // 有部分字段不同，需要更新
                var newItem = createNewItem(item, true);
                console.log("[saveLightElevationPlans]update Item： ", newItem);
                var result = await LightElevationPlan.update({ _id: result._id }, { $set: newItem }).exec();
                data.push(newItem);
            } else {
                // 重复数据，不进行任何处理
                dupArray.push(result);
            }
        } else {
            var newItem = new LightElevationPlan(createNewItem(item, false));
            var r = await newItem.save();
            data.push(r);
        }
    }

    var removed = [];
    // 对oldList中不在reqData中的立面，进行删除操作!
    for (var i = 0; i < oldList.length; i++) {
        var item = oldList[i];
        var result = findFunc(item.building_no, reqData);  
        if (!result) {
            // 删除item
            await LightElevationPlan.remove({
                _id: item._id,
            });
            // console.log("LightElevationPlan.remove:", item);
            removed.push(item);
        }
    }

    if (data.length <= 0 && removed.length <= 0) {
        ctx.body = { success: false, dup: dupArray, removed: removed};
    } else {
        ctx.body = { success: true, data: data, dup: dupArray, removed: removed };
    }
}


/**
 * 保存楼层日照分析
 */
AdminController.saveLightFloors = async function(ctx) {
    var reqData = ctx.request.body;
    // 注意：reqData是楼栋数组
    if (!reqData || reqData.length <= 0) {
        ctx.body = { success: false, code: Constant.RESPONSE_CODE_INVALID_ARGUMENT, msg: "参数错误" };
        return;
    }

    var dupArray = [];
    var data = [];
    var createNewItem = function(itemData, isUpdate) {
        var obj = AdminController.fromData(['real_estate_id', 'real_estate_name', 'building_no', 
            'floor_no', 'light_image_url', 'thumbnail_light_image_url', 'comment', 'extra_info'], itemData);
        obj['update_time'] = Util.nowDateTime();
        if (!isUpdate) {
            obj.create_time = Util.nowDateTime();
        }
        return obj;
    };

    for (var key in reqData) {
        var item = reqData[key];
        var result = await LightFloor.findOne({
            real_estate_id: item.real_estate_id,
            building_no: item.building_no,
            floor_no: item.floor_no,
        }).exec();
        // console.log("find result: ", result);
        if (result) {
            // 更新逻辑
            if (!Util.isSameData(result, item)) {
                // 有部分字段不同，需要更新
                var newItem = createNewItem(item, true);
                console.log("update Item： ", newItem);
                var result = await LightFloor.update({ _id: result._id }, { $set: newItem }).exec();
                data.push(newItem);
            } else {
                // 重复数据，不进行任何处理
                dupArray.push(result);
            }
        } else {
            var newItem = new LightFloor(createNewItem(item, false));
            var r = await newItem.save();
            data.push(r);
        }
    }

    if (data.length <= 0) {
        ctx.body = { success: false, dup: dupArray };
    } else {
        ctx.body = { success: true, data: data, dup: dupArray };
    }
}


/**
 * @deprecated
 * 保存窗户日照分析
 */
/*
AdminController.saveLightWindow = async function(ctx) {
    var reqData = ctx.request.body;
    var result = await LightWindow.findOne({
        real_estate_id: reqData.real_estate_id,
        floor_no: reqData.floor_no
    }).exec();

    var createNewItem = function(itemData, isUpdate) {
        var obj = {
            real_estate_id: itemData.real_estate_id,
            real_estate_name: itemData.real_estate_name,
            floor_no: itemData.floor_no,
            light_image_url: itemData.light_image_url,
            comment: itemData.comment,
            extra_info: itemData.extra_info,
            score: itemData.score,
            update_time: Util.nowDateTime()
        };
        if (!isUpdate) {
            obj.create_time = Util.nowDateTime();
        }
        return obj;
    };

    if (result) {
        // 更新逻辑
        if (!Util.isSameData(result, reqData)) {
            // 有部分字段不同，需要更新
            var newItem = createNewItem(reqData, true);
            console.log("update Item： ", newItem);
            var result = await LightWindow.update({ _id: result._id }, { $set: newItem }).exec();
            ctx.body = { success: true,  msg: "更新成功",  data: newItem };
        } else {
            // 重复数据，不进行任何处理
            ctx.body = { success: false,  code: Constant.RESPONSE_CODE_DUP, msg: "窗户日照分析 已存在!", data: result };
        }
    } else {
        var newItem = new LightWindow(createNewItem(reqData, false));
        var r = await newItem.save();
        ctx.body = { success: true, data: r };
    }
}
*/


AdminController.saveUnitBasicInfo = async function(ctx) {
    var reqData = ctx.request.body;
    var dataModel = UnitBasicInfo;

    if (!reqData['real_estate_id'] || !reqData['unit_no']) {
        ctx.body = { success: false, msg: '无效参数：楼盘和户型数据不能为空' };
        return;
    }
    await AdminController.commonSaveData(ctx, {
        dataModel: dataModel,
        findKeys: ["real_estate_id", 'unit_no'], 
        newDataKeys: ['real_estate_id', 'real_estate_name', 'unit_no', 'image_url', 'thumbnail_image_url', 'score', 
            'efficiency', 'real_inside_area', 'sale_area', 'room_count', 'living_room_count', 'toliet_count', 
            'width', 'depth', 'square_perimeter', 'perimeter', 
            'comment', 'synthesis_comment', 'extra_info', 'delete_flag'],
        resultCallback: function() {
            AdminController.updateUnitTotalScore(reqData.real_estate_id, reqData.unit_no);
        }
    });
}


AdminController.saveUnitRoomArea = async function(ctx) {
    var reqData = ctx.request.body;
    var dataModel = UnitRoomArea;

    if (!reqData['real_estate_id'] || !reqData['unit_no']) {
        ctx.body = { success: false, msg: '无效参数：楼盘和户型数据不能为空' };
        return;
    }

    await AdminController.commonSaveData(ctx, {
        dataModel: dataModel,
        findKeys: ["real_estate_id", 'unit_no'], 
        newDataKeys: ['real_estate_id', 'unit_no', 'image_url', 'thumbnail_image_url', 'score', 
            'comment', 'extra_info', 'delete_flag'],
        resultCallback: function() {
            AdminController.updateUnitTotalScore(reqData.real_estate_id, reqData.unit_no);
        }
    });
}


AdminController.saveUnitRegionFlow = async function(ctx) {
    var reqData = ctx.request.body;
    var dataModel = UnitRegionFlow;

    if (!reqData['real_estate_id'] || !reqData['unit_no']) {
        ctx.body = { success: false, msg: '无效参数：楼盘和户型数据不能为空' };
        return;
    }

    await AdminController.commonSaveData(ctx, {
        dataModel: dataModel,
        findKeys: ["real_estate_id", 'unit_no'], 
        newDataKeys: ['real_estate_id', 'unit_no', 'image_url', 'thumbnail_image_url', 'score', 
            'comment', 'extra_info', 'dynamic_region_count', 'static_region_count', 'distances', 'delete_flag'],
        resultCallback: function() {
            AdminController.updateUnitTotalScore(reqData.real_estate_id, reqData.unit_no);
        }
    });
}


AdminController.saveUnitWindowVentilate = async function(ctx) {
    var reqData = ctx.request.body;
    var dataModel = UnitWindowVentilate;

    if (!reqData['real_estate_id'] || !reqData['unit_no']) {
        ctx.body = { success: false, msg: '无效参数：楼盘和户型数据不能为空' };
        return;
    }

    await AdminController.commonSaveData(ctx, {
        dataModel: dataModel,
        findKeys: ["real_estate_id", 'unit_no'], 
        newDataKeys: ['real_estate_id', 'unit_no', 'image_url', 'thumbnail_image_url', 'score', 
            'not_ventilate_room', 'comment', 'extra_info', 'delete_flag'],
        resultCallback: function() {
            AdminController.updateUnitTotalScore(reqData.real_estate_id, reqData.unit_no);
        }
    });
}


AdminController.saveUnitDetail = async function(ctx) {
    var reqData = ctx.request.body;
    var dataModel = UnitDetail;

    if (!reqData['real_estate_id'] || !reqData['unit_no']) {
        ctx.body = { success: false, msg: '无效参数：楼盘和户型数据不能为空' };
        return;
    }

    await AdminController.commonSaveData(ctx, {
        dataModel: dataModel,
        findKeys: ["real_estate_id", 'unit_no'], 
        newDataKeys: ['real_estate_id', 'unit_no', 'image_url', 'thumbnail_image_url', 'score', 
            'door', 'living_room', 'dining_room', 'bedroom', 'kitchen', 'toliet', 'balcony',
            'comment', 'extra_info', 'delete_flag'],
        resultCallback: function() {
            AdminController.updateUnitTotalScore(reqData.real_estate_id, reqData.unit_no);
        }
    });
}



/**
 * 查询楼盘总图及日照评价
 */
AdminController.search = async function(ctx) {
    var reqData = Util.getRequestData(ctx);
    console.log("reqData: ", reqData);
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
    if (targets.indexOf('real_estate') >= 0) {
        var result = await RealEstate.find({ 
            name: new RegExp(key, 'i'),
        }).lean().exec();
        if (result && result.length > 0) {
            await AdminController.queryLightDataForRealEstateList(result);
            arr = arr.concat(result);
        }  
    }
    
    if (arr && arr.length > 0) {
        ctx.body = { success: true, data: arr }; 
    } else {
        ctx.body = { success: false,  code: Constant.RESPONSE_EMPTY_DATA, msg: '无楼盘数据'}
    }
}


// /**
//  * 保存综述数据，依然使用基本信息模型!
//  * @param {*} ctx 
//  */
// AdminController.saveUnitSynthesis = async function(ctx) {
//     var reqData = ctx.request.body;
//     var dataModel = UnitBasicInfo;
//     var result = await dataModel.findOne({
//         real_estate_id: reqData.real_estate_id,
//         unit_no: reqData.unit_no,
//     }).exec();

//     await AdminController.commonSaveUnitData(ctx, {
//         dataModel: dataModel,
//         findKeys: ["real_estate_id", 'unit_no'], 
//         newDataKeys: ['real_estate_id', 'real_estate_name', 
//             'comment', 'score', 'image_url'],
//         resultCallback: function() {
//             AdminController.updateUnitSynthesisScore(reqData.real_estate_id, reqData.unit_no);
//         }
//     });
// }


/**
 * 删除户型数据
 */
AdminController.deleteUnit = async function(ctx) {
    var reqData = ctx.request.body;
    if (!reqData['real_estate_id'] || !reqData['unit_no']) {
        ctx.body = { success: false, msg: '无效参数：楼盘和户型编号不能为空' };
        return;
    }

    var param = { real_estate_id: reqData.real_estate_id, unit_no: reqData.unit_no };

    var result = await UnitBasicInfo.update(param, { $set: {delete_flag: 1} }).exec();
    result = await UnitRoomArea.update(param, { $set: {delete_flag: 1} }).exec();
    result = await UnitRegionFlow.update(param, { $set: {delete_flag: 1} }).exec();
    result = await UnitWindowVentilate.update(param, { $set: {delete_flag: 1} }).exec();
    result = await UnitDetail.update(param, { $set: {delete_flag: 1} }).exec();

    ctx.body = { success: true, data: result };
}
    

AdminController.queryLightDataForRealEstateList = async function(list) {
    if (list.length > 0) { 
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if (!item['_id']) {
                continue;
            }
            // 总图评测
            var lightSitePlan = await LightSitePlan.findOne({ real_estate_id: item._id }).lean().exec();
            if (lightSitePlan) {
                item.lightSitePlan = lightSitePlan;
            }  

            // 立面光照分析
            var elevations = await LightElevationPlan.find({
                real_estate_id: item._id,
            }).lean().exec();
            if (elevations && elevations.length > 0) {
                item.lightElevationPlans = elevations;
            }

            // 楼层日照分析
            var floorList = await LightFloor.find({
                real_estate_id: item._id,
            }).lean().exec();
            if (floorList && floorList.length > 0) {
                item.lightFloors = floorList;
            }

            // @deprecated
            // 楼层窗户日照分析
            // var lightWindowList = await LightWindow.find({
            //     real_estate_id: item._id,
            // }).lean().exec();
            // if (lightWindowList && lightWindowList.length > 0) {
            //     item.lightWindow = lightWindowList;
            // }
        }
    }
    return list;
}


AdminController.commonSaveData = async function(ctx, options) {
    var reqData = ctx.request.body;
    var dataModel = options.dataModel;
    var findKeys = options.findKeys;

    var findParams = {};
    for (var k in findKeys) {
        var key = findKeys[k];
        findParams[key] = reqData[key];
    }

    var result = await dataModel.findOne(findParams).exec();
    var newDataKeys = options.newDataKeys;

    var createNewItem = function(itemData, isUpdate) {
        var data = {};
        for (var k in newDataKeys) {
            var key = newDataKeys[k];
            data[key] = reqData[key];
        }
        data['update_time'] = Util.nowDateTime();
        if (!isUpdate) {
            data.create_time = Util.nowDateTime();
        }
        return data;
    };

    if (result) {
        // console.log(result, reqData);
        // 更新逻辑
        if (!Util.isSameData(result, reqData)) {
            // 有部分字段不同，需要更新
            var newItem = createNewItem(reqData, true);
            console.log("update Item： ", newItem);
            var result = await dataModel.update({ _id: result._id }, { $set: newItem }).exec();
            if (options.resultCallback) {
                options.resultCallback();
            }
            ctx.body = { success: true,  msg: "更新成功",  data: newItem };
        } else {
            // 重复数据，不进行任何处理
            ctx.body = { success: false,  code: Constant.RESPONSE_CODE_DUP, msg: "数据 已存在!", data: result };
        }
    } else {
        var newItem = new dataModel(createNewItem(reqData, false));
        var r = await newItem.save();
        if (options.resultCallback) {
            options.resultCallback();
        }
        ctx.body = { success: true, data: r };
    }
}


AdminController.fromData = function(keys, source) {
    var data = {};
    for (var k in keys) {
        var key = keys[k];
        data[key] = source[key];
    }
    return data;
}


AdminController.updateUnitTotalScore = async function(realEstateId, unitNo) {
    var totalScore = 0;
    var models = [UnitBasicInfo, UnitRoomArea, UnitRegionFlow, UnitWindowVentilate, UnitDetail];
    for (var i in models) {
        var score = await AdminController.getUnitItemScore(realEstateId, unitNo, models[i]);
        if (score) {
            totalScore = totalScore + Number(score);
        }
    }
    if (totalScore) {
        totalScore = totalScore / 5;
        totalScore = totalScore.toFixed(2);
        var result = await AdminController.findUnitItem(realEstateId, unitNo, UnitBasicInfo);
        if (result) {
            var result = await UnitBasicInfo.update({ real_estate_id: realEstateId, unit_no: unitNo }, 
                { $set: {total_score: totalScore} }).exec();
            console.log("updateUnitTotalScore Item： ", result);
        }
    }
}


AdminController.getUnitItemScore = async function(realEstateId, unitNo, dataModel) {
    var result = await dataModel.findOne({
        real_estate_id: realEstateId,
        unit_no: unitNo,
    }).exec();
    if (result) {
        return result.score;
    } else {
        return 0;
    }
}


AdminController.findUnitItem = async function(realEstateId, unitNo, dataModel) {
    var result = await dataModel.findOne({
        real_estate_id: realEstateId,
        unit_no: unitNo,
    }).exec();
    return result;
}



module.exports = AdminController;