/**
 * @deprecated 
 * 户型综述数据 放入基本信息中
 */
var Mongoose = require('mongoose');
var UnitSynthesisSchema = new Mongoose.Schema({
    real_estate_id: String,
    real_estate_name: String,
    unit_no: String,
    // 户型基本图片，直接复用基本信息中的图片!
    image_url: String,
    // 户型总分(各分项相加!)
    score: String,  
    comment: String,
    // 标记位
    delete_flag: Number,
    // 扩展信息保存多条赠送面积
    extra_info: String,
    // 创建日期        
    create_time: String,
    // 更新日期
    update_time: String,
})

 
module.exports = Mongoose.model('UnitSynthesis', UnitSynthesisSchema);