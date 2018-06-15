/**
 * user 存储模型
 */
var Mongoose = require('mongoose');
var UserSchema = new Mongoose.Schema({
    uid: Number, // uid
    loginId: String, // 登陆id
    userName: String, // 用户名
    passwd: String,
    createTime: String,
    lastLogin: String,
});


module.exports = Mongoose.model('User', UserSchema);