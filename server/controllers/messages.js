const mongoose = require('mongoose'),
        Message = mongoose.model('Message'),
        Comment = mongoose.model('Comment');
const bcrypt = require('bcrypt-as-promised');

module.exports = {
    listing : (req, res) => {
        if (!req.session._id) res.redirect('/');
        Message.find({}, (err, items) => {
            if (!err) {
                res.render('message_new', {messages: items, user_id: req.session._id});
            } else {
                console.log(err);
                res.render('message_new');            
            }
        });
    },

    create: (req, res) => {
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
    },

    show: (req, res) => {
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
    },

    delete: (req, res) => {
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
    }
}