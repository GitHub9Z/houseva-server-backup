/**
 * wp_user 存储模型
 */
var Mongoose = require('mongoose');
var WpUserSchema = new Mongoose.Schema({
    id: String, // 登陆id
    open_id: String,
    user_name: String, // 用户名
    user_type: String,
    head_url: String,
    create_time: String,
    update_time: String,
});

WpUserSchema.index({id: 1});

module.exports = Mongoose.model('WpUserModel', WpUserSchema);