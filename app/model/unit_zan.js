/**
 * 户型点赞数
 */
var Mongoose = require('mongoose');
var UnitZanNumber = new Mongoose.Schema({
    real_estate_id: String,
    zan_number: Number,
});

UnitZanNumber.index({real_estate_id: 1});

 
module.exports = Mongoose.model('UnitZanNumber', UnitZanNumber);