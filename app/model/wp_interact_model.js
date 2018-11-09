/**
 * wp_interact 存储模型
 */
var Mongoose = require('mongoose');
var WpInteractSchema = new Mongoose.Schema({
    id: String,
    tag_id: String, 
    interact_type: String,
    user_type: String,
    user_id: String,
    to_interact_id: String,
    interact_content: String,
    interact_status: String,
    msg_status: String,
    create_time: String,
    update_time: String,
});

WpInteractSchema.index({tag_id: 1});

module.exports = Mongoose.model('WpInteractModel', WpInteractSchema);