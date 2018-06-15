/**
 * @deprecated
 * 窗户日照模型
 */
var Mongoose = require('mongoose');
var LightWindowSchema = new Mongoose.Schema({
    // 楼盘id
    real_estate_id: String,
    // 楼盘名称
    real_estate_name: String, 
    // 楼层编号
    floor_no: String,
    // 光照分析图url
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

LightWindowSchema.index({real_estate_id: 1, floor_no: 1});
 
module.exports = Mongoose.model('LightWindow', LightWindowSchema);