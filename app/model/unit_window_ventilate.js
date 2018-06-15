/**
 * 户型-采光和通风
 */
var Mongoose = require('mongoose');
var UnitWindowVentilate = new Mongoose.Schema({
    real_estate_id: String,
    unit_no: String,
    image_url: String,  
    thumbnail_image_url: String,
    score: String,  
    comment: String,
    // 不通风房间个数
    not_ventilate_room: String,
    // 标记位
    delete_flag: Number,
    // 扩展信息保存: 窗户和通风数据
    // { room_windows:[{}, {}, ...], ventilates: [{}, {}, ...] }
    extra_info: String,
    // 创建日期        
    create_time: String,
    // 更新日期
    update_time: String,
})

UnitWindowVentilate.index({real_estate_id: 1, unit_no: 1});

 
module.exports = Mongoose.model('UnitWindowVentilate', UnitWindowVentilate);