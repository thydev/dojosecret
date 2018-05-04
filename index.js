const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-as-promised');
const uniqueValidator = require('mongoose-unique-validator');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/dojosecret');

// Model Section
const CommentSchema = new mongoose.Schema({
    _id : Schema.Types.ObjectId,
    author: {type: Schema.Types.ObjectId, ref: "User"},
    contents: {type: String, required: true, minlength: 5},
    message: {type: Schema.Types.ObjectId, ref: "Message"}
}, {timestamps: true});

const MessageSchema = new mongoose.Schema({
    _id : Schema.Types.ObjectId,
    author: {type: Schema.Types.ObjectId, ref: "User"},
    contents: {type: String, required: true, minlength: 5},
    comments: [{type: Schema.Types.ObjectId, ref: "Comment"}],

}, {timestamps: true});

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
    messages = [{type: Schema.Types.ObjectId, ref: "Message"}],
    comments = [{type: Schema.Types.ObjectId, ref: "Comment"}]

}, {timestamps: true});

// Apply the uniqueValidator plugin to UserSchema.
// UserSchema.plugin(uniqueValidator);
UserSchema.plugin(uniqueValidator, { message: 'The {PATH} {VALUE} already exists.' });
// You have access to all of the standard Mongoose error message templating:
// {PATH}
// {VALUE}
// {TYPE}

const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);
const Comment = mongoose.model('Comment', CommentSchema);

// End of Model Section

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true}));

const path = require('path');
app.use(express.static(path.join(__dirname, './static')));

// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('login');
})

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/login', (req, res) => {
    User.findOne({email: req.body.email}, (err, item) => {
        if(!err) {
            bcrypt.compare(req.body.password, item.password)
                .then( result => {
                    console.log("successfully login!");
                    res.redirect('/');
                })
                .catch( error => {
                    console.log("Wrong password!");
                    res.render("login");
                });
            
        } else {
            console.log(item.errors);
            res.render("login");
        }
    })
    // bcrypt.compare('password_from_form', 'stored_hased_password')
    // .then( result => {
        
    // })
    // .catch( error => {
        
    // });
    let item = new User();
    item.author = req.body.author;
    item.contents = req.body.contents;
    item.save( err => {
        if (!err) {
            res.redirect('/');
        } else {
            res.render('index', {errors: item.errors})
        }
    });
})

app.post('/register', (req, res) => {
    let item = new User();
    item.first_name = req.body.first_name;
    item.last_name = req.body.last_name;
    item.email = req.body.email;
    item.password = req.body.password;
    item.birthday = req.body.birthday;
    if (req.body.password !== req.body.password_confirm) {
        // assert.equal(error.errors['pc'].message, 'Password and confirm must be match');
        // item.errors.pc = "confrim wrong";
        // raiser an error
        item.invalidate('password_confirm', 'Password must match confirmation.');
    }
    bcrypt.hash(req.body.password, 10)
        .then(hashed_password => {
            item.password = hashed_password
            console.log("password===========inside bcrypt===================>2nd ", item.password)
            item.save( err => {
        
                if (!err) {
                    res.redirect('/');
                } else {
                    res.render('register', {errors: item.errors, item: req.body})
                }
            });
        })
        .catch(error => {
            // raise an error
        });
        //Watch out for the promises!!!!
    console.log("password================================>1st ", item.password)
    
    
})

app.listen(5000, () => {
    console.log("listening on port 5000");
})
