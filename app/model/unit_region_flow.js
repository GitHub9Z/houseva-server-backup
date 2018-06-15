/**
 * 户型分区流线
 */
var Mongoose = require('mongoose');
var UnitRegionFlow = new Mongoose.Schema({
    real_estate_id: String,
    unit_no: String,
    image_url: String,  
    thumbnail_image_url: String,
    score: String,  
    comment: String,
    // 动静分区数据
    dynamic_region_count: String,
    static_region_count: String,
    // 动态距离的json格式数据
    distances: String,
    // 标记位
    delete_flag: Number,
    // 扩展信息暂不保存数据
    extra_info: String,
    // 创建日期        
    create_time: String,
    // 更新日期
    update_time: String,
});

UnitRegionFlow.index({real_estate_id: 1, unit_no: 1});

 
module.exports = Mongoose.model('UnitRegionFlow', UnitRegionFlow);