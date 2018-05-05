const mongoose = require('mongoose');
const Schema = mongoose.Schema;
module.exports = (() => {
    const MessageSchema = new mongoose.Schema({
        _id : Schema.Types.ObjectId,
        author: {type: Schema.Types.ObjectId, ref: "User"},
        contents: {type: String, required: true, minlength: 5},
        comments: [{type: Schema.Types.ObjectId, ref: "Comment"}],
    
    }, {timestamps: true});
    const Message = mongoose.model('Message', MessageSchema);
})();