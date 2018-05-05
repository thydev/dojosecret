const mongoose = require('mongoose'),
        User = mongoose.model('User');
const bcrypt = require('bcrypt-as-promised');

module.exports = {
    login : (req, res) => {
        if (req.session._id) return res.redirect('/messages');
        return res.render('login');
    },

    register: (req, res) => {
        if (req.session._id) res.redirect('/messages');
        res.render('register');
    },

    verifyLogin: (req, res) => {
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
    },

    create: (req, res) => {
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
    }, 

    logout: (req, res) => {
        req.session._id = 0;
        return res.redirect('/');
    }
}