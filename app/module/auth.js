////////////////////////////////////////////////////////
//
// 用戶鉴权 模块
//
////////////////////////////////////////////////////////

var jwt = require('jsonwebtoken');

const Util = require("../module/util.js");
const Constant = require("../module/constant.js");

// 这种方式不行
var Mongoose = require("mongoose");
var User = require("../model/user_model.js");



var Export = {
    
}



/**
 * 根据帐户名查询用户
 */
async function findUserByLoginId(loginId) {
    var result = await User.findOne({ loginId: loginId }).exec();
    console.log("findUserByLoginId result: ", result);
    return result;
}


async function innerCheckUserLogin(ctx, callback) {
    console.log("start checkUserLogin");
    var token;
    var reqData = Util.getRequestData(ctx);
    var token = reqData.token;
    var target = reqData.target;
    
    var headers = ctx.request.headers;
    
    if (headers && headers.authorization) {
        console.log("header authorization:", headers.authorization);
        // var parts = req.headers.authorization.split(' ');
        // if (parts.length == 2) {
        //   var scheme = parts[0],
        //     credentials = parts[1];
        //     if (/^Bearer$/i.test(scheme)) {
        //         token = credentials;
        //     }
        // } else {
        //   return res.json(401, {err: 'Format is Authorization: Bearer [token]'});
        // }
        return false;
    } else if (token) {
        console.log("req token:", token);
        delete reqData.token;
    } else {
        token = ctx.cookies.get('jwtToken'); 
        console.log("cookies token:", token);
    }
    
    if (!token){
        console.log("userLogin failed");
        return false; //res.json(401, {err: 'No Authorization header was found'});
    }
    try {
        var decoded = jwt.verify(token, "houseva");
        console.log("jwt decoded", decoded);
    } catch(err) {
        // err
    }
    return true;
}


Export.getUserLoginData = async function(ctx, callback) {
    console.log("start checkUserLogin");
    var token;
    var reqData = Util.getRequestData(ctx);
    var token = reqData.token;
    var target = reqData.target;
    
    var headers = ctx.request.headers;
    
    if (headers && headers.authorization) {
        console.log("header authorization:", headers.authorization);
        return {isLogin: false};
    } else if (token) {
        console.log("req token:", token);
        delete reqData.token;
    } else {
        token = ctx.cookies.get('jwtToken'); 
        console.log("cookies token:", token);
    }
    
    if (!token){
        console.log("userLogin failed");
        return {isLogin: false};
    }
    try {
        var decoded = jwt.verify(token, "houseva");
        console.log("jwt decoded", decoded);
        return {isLogin: true, data: decoded};
    } catch(err) {
        // err
    }
    return {isLogin: false};
} 

    
/**
 * 校验当前用户是否登录
 */
Export.checkUserLogin = async function(ctx, callback) {
    return innerCheckUserLogin(ctx, callback);
}


/**
 * 注册新用户
 */
Export.serveRegister = async function(ctx) {
    var reqData = Util.getRequestData(ctx);
    
    let loginId = reqData["loginId"];
    let password = reqData["password"];
    // 基本校验
    if (!loginId || !password) {
        ctx.body = { success: false, code: 103, resultView: "参数错误，请填写用户名和密码" };
        return;
    }

    // TODO 格式校验逻辑

    // 查询是否已存在用户
    var result = await findUserByLoginId(loginId);
    console.log(result);
    if (result) {
        ctx.body = { success: false, code: Constant.RESPONSE_CODE_INVALID_ARGUMENT, 
            resultView: "用户名已经注册，请使用其他用户名", data: {} };
    } else {
        // 创建用户
        let user = new User({
            loginId: loginId,
            passwd: password,
            createTime: new Date(),
            lastLogin: new Date(),
        });
        let r = await user.save();
        ctx.body = { success: true, code: Constant.RESPONSE_CODE_OK, data: r };
    }
    console.log("response: ", ctx.body);
}


/**
 * 用户登录
 */
Export.serveLogin = async function(ctx) {
      // console.log("ctx.request: ", JSON.stringify(ctx.request));
    let reqData = Util.getRequestData(ctx);
    let loginId = reqData["loginId"];
    let passwd = reqData["password"];

    var result = await User.findOne({ loginId: loginId }).exec();
    console.log("find result: ", reqData);
    if (result) {
        console.log("query result: ", result);
        if (result.passwd == passwd) {
            // 使用SHA256 hash
            var token = jwt.sign({ loginId: loginId }, 'houseva');// { expiresIn: 60 * 60 });
            ctx.body = { success: true, code: 0, data: {loginId: loginId, token: token} };
        } else {
            ctx.body = { success: false, code: 0, resultView: "password is wrong", data: {} };
        }
    } else {
        ctx.body = { success: false, code: 101, resultView: "cannot find user" };
    }
    console.log("response: ", ctx.body);
}

module.exports = Export;
  