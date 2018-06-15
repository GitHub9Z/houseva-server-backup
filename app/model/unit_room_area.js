/**
 * 户型基本信息
 */
var Mongoose = require('mongoose');
var UnitRoomAreaSchema = new Mongoose.Schema({
    real_estate_id: String,
    unit_no: String,
    image_url: String,  
    thumbnail_image_url: String,
    score: String,  
    comment: String,
    // 标记位
    delete_flag: Number,
    // 扩展信息保存 每个房间的面积详细和得分等
    extra_info: String,
    // 创建日期        
    create_time: String,
    // 更新日期
    update_time: String,
});

UnitRoomAreaSchema.index({real_estate_id: 1, unit_no: 1});


module.exports = Mongoose.model('UnitRoomArea', UnitRoomAreaSchema);