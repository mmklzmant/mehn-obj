var mongoose = require('mongoose');
var Schema      = mongoose.Schema;

var todoSchema = new Schema({
    title: {type: String, required: true},
    content: {type:String},
    deadline: {type: String},
    createdAt: {type: Date, default:  (new Date()).valueOf()},
});

var Todo = mongoose.model('Todo', todoSchema);
module.exports = Todo;
