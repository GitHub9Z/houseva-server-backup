/**
 * 楼盘模型
 */
var Mongoose = require('mongoose');
var RealEstateSchema = new Mongoose.Schema({
    // 楼盘名称
    name: String, 
    // 城市
    city: String,  
    // 地理位置
    location: String,  
    // 扩展信息
    extra_info: String, 
    // 状态位(目前使用的状态值：0, 保存状态(默认), 1 发布上线 )
    status: Number,
    // 删除标记 (0 未删除，1删除)
    delete_flag: Number,
    // 创建日期        
    create_time: String,
    // 更新日期
    update_time: String,
})

RealEstateSchema.index({name: 1, city: 1});

module.exports = Mongoose.model('RealEstate', RealEstateSchema);