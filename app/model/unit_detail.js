/**
 * 户型细节信息
 */
var Mongoose = require('mongoose');
var UnitDetailSchema = new Mongoose.Schema({
    real_estate_id: String,
    unit_no: String,
    image_url: String,  
    thumbnail_image_url: String,
    score: String,  
    comment: String,
    // 分项数据
    door: String,
    living_room: String,
    dining_room: String, 
    bedroom: String, 
    kitchen: String,
    toliet: String,
    balcony: String, 
    // 标记位
    delete_flag: Number,
    // 扩展信息
    extra_info: String,
    // 创建日期        
    create_time: String,
    // 更新日期
    update_time: String,
});

UnitDetailSchema.index({real_estate_id: 1, unit_no: 1});

module.exports = Mongoose.model('UnitDetail', UnitDetailSchema);