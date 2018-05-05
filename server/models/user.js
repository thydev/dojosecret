const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

module.exports = (() => {
    const UserSchema = new mongoose.Schema({
        _id : Schema.Types.ObjectId,
        first_name: {
            type: String, 
            required: [true, 'First name required'], 
            minlength: [2, 'First name must be greater than 2 characters']
        },
        last_name: {type: String, required: true, minlength: 2},
        email: {
            type: String, 
            unique: [true, 'This email already exists'], // Use 'mongoose-unique-validator'
            required: [true, 'Input your email'], 
            minlength: 2
        },
        birthday: { type: Date },
        password: {
            type: String, 
            required: [true, 'Password is required']
        },
        messages: [{type: Schema.Types.ObjectId, ref: "Message"}],
        comments: [{type: Schema.Types.ObjectId, ref: "Comment"}]
    
    }, {timestamps: true});
    
    // Apply the uniqueValidator plugin to UserSchema.
    // UserSchema.plugin(uniqueValidator);
    UserSchema.plugin(uniqueValidator, { message: 'The {PATH} {VALUE} already exists.' });
    // You have access to all of the standard Mongoose error message templating:
    // {PATH}
    // {VALUE}
    // {TYPE}
    
    mongoose.model('User', UserSchema);
})();