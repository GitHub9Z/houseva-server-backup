////////////////////////////////////////////////////////
//
// 页面 controller 
// 用来处理页面访问 
//
////////////////////////////////////////////////////////

const fs = require('fs');
const path = require("path");

const Auth = require("../module/auth.js");


// 网络相应 返回码
var PageController = {
    
}

PageController.index = async function(ctx) {
    await ctx.render(buildHtmlFilePath('index.html'));
}

PageController.lightSitePlan = async function(ctx) {
    await ctx.render(buildHtmlFilePath('lightSitePlan.html'));
}

PageController.detail = async function(ctx) {
    // 重定向到 detail_light.html
    await ctx.render(buildHtmlFilePath('detail_light.html')); 
}

PageController.detailUnit = async function(ctx) {
    await ctx.render(buildHtmlFilePath('detail_unit.html')); 
}

PageController.search = async function(ctx) {
    await ctx.render(buildHtmlFilePath('search.html'));
}

PageController.apply = async function(ctx) {
    await ctx.render(buildHtmlFilePath('apply.html'));
}

PageController.applyBuilding = async function(ctx) {
    await ctx.render(buildHtmlFilePath('apply_building.html'));
}

PageController.applyFloor = async function(ctx) {
    await ctx.render(buildHtmlFilePath('apply_floor.html'));
}

PageController.about = async function(ctx) {
    await ctx.render(buildHtmlFilePath('about.html'));
}


/**
 * 我的页面， 需区分是否登录
 */
PageController.my = async function(ctx) {
    var data = await Auth.getUserLoginData(ctx);
    if (data.isLogin) {
         // 用户userID, 是否刷新token等
         await ctx.render(buildHtmlFilePath('my.html'), data);
     } else {
         await ctx.render(buildHtmlFilePath('my_unlogin.html'));
     }
}


/**
 * 注册页面 
 */
PageController.register = async function(ctx) {
    await ctx.render(buildHtmlFilePath('register.html'));
}


/**
 * 评测页面
 */
PageController.evaluate = async function(ctx) {
    await ctx.render(buildHtmlFilePath('evaluate.html'));
}


PageController.main = function(ctx) {
    ctx.body = "Hello main!";
}

/**
 * 获取html文件路径
 * 由于在server.js中已配置模板父路径，因此只要拼接子路径即可
 * @param {*} subPath 
 */

function buildHtmlFilePath(subPath){
    //return path.join(__dirname, '/../public/view/page/' + subPath);
    // 使用nunjucks之后 ctx render
    return path.join('page', subPath);
}

function getHtmlFile(subPath) {
    return  fs.createReadStream(buildHtmlFilePath(subPath));
}


module.exports = PageController;