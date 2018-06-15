/**
 * 楼盘总图光照评估 模型
 */
 
var Mongoose = require('mongoose');
var LightSitePlanSchema = new Mongoose.Schema({
    // 楼盘id
    real_estate_id: String,
    // 楼盘名称
    real_estate_name: String, 
    // 总图光照url
    light_image_url: String,  
    thumbnail_light_image_url: String,
    // 效果动图url
    effect_image_url: String,
    // 查看次数 (总图相当于楼盘的查看次数)
    view_count: Number,
    // 评论
    comment: String,  
    // 评分                         
    score: String,
    // 扩展信息
    extra_info: String,  
    // 创建日期        
    create_time: String,
    // 更新日期
    update_time: String,
})

LightSitePlanSchema.index({real_estate_id: 1});
 
module.exports = Mongoose.model('LightSitePlan', LightSitePlanSchema);