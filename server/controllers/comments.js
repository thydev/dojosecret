const mongoose = require('mongoose'),
        Comment = mongoose.model('Comment');
const bcrypt = require('bcrypt-as-promised');

module.exports = {
    create: (req, res) => {
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
    }

    
}