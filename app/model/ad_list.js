/**
 * 广告位配置
 */
var Mongoose = require('mongoose');
var AdList = new Mongoose.Schema({
    ad_id: String,
    ad_url: String,
    ad_image_url: String,
    ad_browse: Number,
    ad_click: Number,
    ad_weight: Number,
});

AdList.index({ad_id: 1});

 
module.exports = Mongoose.model('AdList', AdList);