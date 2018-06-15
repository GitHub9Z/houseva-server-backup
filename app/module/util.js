////////////////////////////////////////////////////////
//
// 工具方法 模块
//
////////////////////////////////////////////////////////

// 第三方
const moment = require("moment");

// 网络相应 返回码
var Export = {

}

/**
 * 是否有相同数据
 * 以newData key为准，即oldData为超集数据
 */
Export.isSameData = function(oldData, newData) {
    for (var key in newData) {
        if (newData[key] != oldData[key]) {
            return false;
        }
    }
    return true;
}


Export.nowDateTime = function() {
    return moment().format("YYYY-MM-DD HH:MM:SS");
}
    

Export.getRequestData = function(ctx){
    var data = null;
    // console.log("body:", ctx.request.body);
    // console.log("query:", ctx.request.query);
    
    if (ctx.request.method == 'POST') {
        data = ctx.request.body;
    } else {
        // 这里简直莫名奇妙，后台工具GET时传的是body参数，前端时GET时是query参数，真是蛋疼
        if (!ctx.request.body || Object.keys(ctx.request.body).length <= 0) { 
            data = ctx.request.query;
        } else {
            data = ctx.request.body;
        }
    }
    return data;
}


module.exports = Export;