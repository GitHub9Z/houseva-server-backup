////////////////////////////////////////////////////////
//
// api controller 
// 用来处理 api接口 
//
////////////////////////////////////////////////////////

require("../model/real_estate_model.js");
require("../model/light_site_plan_model.js");
require("../model/light_elevation_plan_model.js");
require("../model/light_window_model.js");

const Mongoose = require("mongoose");
const Constant = require("../module/constant.js");
const Util = require("../module/util.js");
//
// 模型定义
var RealEstate = Mongoose.model("RealEstate");
var LightSitePlan = Mongoose.model("LightSitePlan");
var LightElevationPlan = Mongoose.model("LightElevationPlan");
var LightWindow = Mongoose.model("LightWindow");

// 用户Auth
var Auth = require("../module/auth.js");


// 网络相应 返回码
var PostApiController = {
     
}
 

module.exports = PostApiController;