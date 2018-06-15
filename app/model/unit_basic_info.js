/**
 * 户型基本信息
 */
var Mongoose = require('mongoose');
var UnitBasicInfoSchema = new Mongoose.Schema({
    real_estate_id: String,
    real_estate_name: String,
    unit_no: String,
    image_url: String,  
    thumbnail_image_url: String,
    score: String,  
    efficiency: String,
    real_inside_area: String,
    sale_area: String,
    room_count: String,
    living_room_count: String,
    toliet_count: String,
    // 方正
    width: Number, // 总面宽
    depth: Number, // 总进深
    square_perimeter: Number, // 方正周长
    perimeter: Number, // 周长
    // deprecated
    // is_rect: String,
    comment: String,
    view_count: Number,
    // 状态位(冗余设计, 含义与楼盘model status一样), 目前用来标记是否发布
    // status: Number,
    // 删除标记位
    delete_flag: Number,
    // 扩展信息保存多条赠送面积
    extra_info: String,
    // 综述数据
    total_score: String,
    synthesis_comment: String,
    // 创建日期        
    create_time: String,
    // 更新日期
    update_time: String,
})

UnitBasicInfoSchema.index({real_estate_id: 1, real_estate_name: 1, unit_no: 1});
 
module.exports = Mongoose.model('UnitBasicInfo', UnitBasicInfoSchema);