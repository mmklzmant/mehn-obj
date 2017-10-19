var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
    author:{type: String, required: true},
    title: {type: String, required: true},
    classTitle: {type: String, required: true},
    label: {type: String},
    content: {type:String},
    isShow: {type:Number,default:0},
    url: {type:String,required: true,unique: true},
    pageViews: {type: Number},
    createdAt: {type: Date, default:  (new Date()).valueOf()},
});

var Blog = mongoose.model('blog', blogSchema);
module.exports = Blog;
