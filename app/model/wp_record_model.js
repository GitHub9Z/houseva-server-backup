/**
 * wp_record 存储模型
 */
var Mongoose = require('mongoose');
var WpRecordSchema = new Mongoose.Schema({
    id: String,
    tag_id: String, 
    record_type: String,
    user_id: String,
    create_time: String,
    update_time: String,
});


module.exports = Mongoose.model('WpRecordModel', WpRecordSchema);