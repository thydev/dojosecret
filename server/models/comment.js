const mongoose = require('mongoose');
const Schema = mongoose.Schema;
module.exports = (() => {
    const CommentSchema = new mongoose.Schema({
        _id : {type: Schema.Types.ObjectId},
        author: {type: Schema.Types.ObjectId, ref: "User"},
        contents: {type: String, required: true, minlength: 5},
        message: {type: Schema.Types.ObjectId, ref: "Message"}
    }, {timestamps: true});
    const Comment = mongoose.model('Comment', CommentSchema);
})();