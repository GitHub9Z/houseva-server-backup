/**
 * 楼层日照模型
 */
var Mongoose = require('mongoose');
var LightFloorSchema = new Mongoose.Schema({
    // 楼盘id
    real_estate_id: String,
    // 楼栋编号
    building_no: String,
    // 楼层编号
    floor_no: String,
    // 日照分析图url
    light_image_url: String,  
    thumbnail_light_image_url: String,
    // 评价
    comment: String,  
    // 扩展信息
    extra_info: String,  
    // 创建日期        
    create_time: String,
    // 更新日期
    update_time: String,
})

LightFloorSchema.index({real_estate_id: 1, building_no: 1});
 
module.exports = Mongoose.model('LightFloor', LightFloorSchema);