/**
 * wp_topic 存储模型
 */
var Mongoose = require('mongoose');
var WpTagSchema = new Mongoose.Schema({
    id: String,
    real_estate_id: String, 
    user_id: String,
    tag_name: String,
    tag_content_id: String,
    views_num: Number,
    tag_status: String,
    create_time: String,
    update_time: String,
});


module.exports = Mongoose.model('WpTagModel', WpTagSchema);