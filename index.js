const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-as-promised');
const uniqueValidator = require('mongoose-unique-validator');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/dojosecret');

// Model Section
const CommentSchema = new mongoose.Schema({
    _id : {type: Schema.Types.ObjectId},
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

const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);
const Comment = mongoose.model('Comment', CommentSchema);

// End of Model Section

const session = require('express-session');
app.set('trust proxy', 1) // trust first proxy
app.use(session({secret: '11211s11asd32sd32d'}));  // string for encryption
// app.use(session({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { maxAge: 60000 }
// }));

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true}));

const path = require('path');
app.use(express.static(path.join(__dirname, './static')));

// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    console.log(req.session._id);
    if (req.session._id) return res.redirect('/messages');
    return res.render('login');
})

app.get('/register', (req, res) => {
    if (req.session._id) res.redirect('/messages');

    res.render('register');
});

app.post('/login', (req, res) => {
    if(!req.body.email) {
        res.redirect('/');
    }
    User.findOne({email: req.body.email}, (err, item) => {
        if(!err) {
            if (!item) res.redirect('/');
            bcrypt.compare(req.body.password, item.password)
                .then( result => {
                    console.log("successfully login!");
                    req.session._id = item._id;
                    res.redirect('/messages');
                })
                .catch( error => {
                    console.log("Wrong password!");
                    req.session._id = 0;
                    res.render("login");
                });
        } else {
            console.log(item.errors);
            req.session._id = 0;
            res.render("login");
        }
    });
    
});

app.post('/register', (req, res) => {
    let item = new User();
    item._id = new mongoose.Types.ObjectId();
    item.first_name = req.body.first_name;
    item.last_name = req.body.last_name;
    item.email = req.body.email;
    item.password = req.body.password;
    item.birthday = req.body.birthday;
    if (req.body.password !== req.body.password_confirm) {
        item.invalidate('password_confirm', 'Password must match confirmation.');
    }
    bcrypt.hash(req.body.password, 10)
        .then(hashed_password => {
            item.password = hashed_password
            console.log("password===========inside bcrypt===================>2nd ", item.password)
            item.save( err => {
        
                if (!err) {
                    req.session._id = item._id;
                    res.redirect('/');
                } else {
                    req.session._id = 0;
                    console.log(item.errors);
                    res.render('register', {errors: item.errors, item: req.body})
                }
            });
        })
        .catch(error => {
            // raise an error
        });
        //Watch out for the promises!!!!
    console.log("password================================>1st ", item.password)
    
    
});

app.get('/logout', (req, res) => {
    req.session._id = 0;
    return res.redirect('/');
});

app.get('/messages', (req, res) => {
    if (!req.session._id) res.redirect('/');
    Message.find({}, (err, items) => {
        if (!err) {
            res.render('message_new', {messages: items, user_id: req.session._id});
        } else {
            console.log(err);
            res.render('message_new');            
        }
    });
});

app.post('/messages', (req, res) => {
    const item = new Message();
    item._id = new mongoose.Types.ObjectId();
    item.author = req.session._id;
    item.contents = req.body.contents;
    item.save( err => {
        if (!err) {
            res.redirect('/messages');
        } else {
            console.log(item.errors);
            // res.render('/message_new', {errors: item.errors})
        }
    });
})

app.get('/messages/:id', (req, res) => {
    if (!req.session._id) res.redirect('/');

    var ObjectId = mongoose.Types.ObjectId; 
    Message.findOne({_id: new ObjectId(req.params.id)})
    // .populate({path: 'comments'}) //Not working
    .exec( (err, item) => {
        if (!err) {

            Comment.find({message: new ObjectId(item._id)})
            .exec((errc, cts) => {
                if (!errc) {
                    item.comments = cts;
                    res.render('comment', {message: item, user_id: req.session._id});
                } else {
                    console.log(errc);
                    res.render('comment', {errors: cts.errors});
                }
            });
            
        } else {
            console.log(err);
            res.render('comment', {errors: item.errors});
        }
    });
});

app.post('/messages/:id', (req, res) => {
    if (!req.session._id) res.redirect('/');

    const item = new Comment();
    item._id = new mongoose.Types.ObjectId();
    item.author = req.session._id;
    item.message = req.params.id;
    item.contents = req.body.contents;
    item.save( err => {
        if (!err) {
            res.redirect('/messages/' + req.params.id);
        } else {
            console.log(item.errors);
            // res.render('/message_new', {errors: item.errors})
        }
    });
});

app.post('/messages/delete/:id', (req, res) => {
    if (!req.session._id) res.redirect('/');
    var ObjectId = mongoose.Types.ObjectId; 
    Message.remove({_id: new ObjectId(req.params.id)})
    .exec((err, result) => {
        if(!err) {
            res.redirect('/');
        } else {
            console.log(err);
        }
    });
    
});

app.listen(5000, () => {
    console.log("listening on port 5000");
})
