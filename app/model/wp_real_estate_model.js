/**
 * wp_real_estate 存储模型
 */
var Mongoose = require('mongoose');
var WpRealEstateSchema = new Mongoose.Schema({
    id: String, 
    real_estate_area:String,
    real_estate_name: String,
    views_num: Number,
    create_time: String,
    update_time: String,
});


module.exports = Mongoose.model('WpRealEstateModel', WpRealEstateSchema);