const mongoose = require('mongoose'),
        User = mongoose.model('User'),
        Comment = mongoose.model('Comment'),
        Message = mongoose.model('Message'),
        users = require('../controllers/users'),
        comments = require('../controllers/comments'),
        messages = require('../controllers/messages');

module.exports = (app) => {

    app.get('/', (req, res) => {
        users.login(req, res);
    })

    app.get('/register', (req, res) => {
        users.register(req, res);
    });

    app.post('/login', (req, res) => {
        users.verifyLogin(req, res);
        
    });

    app.post('/register', (req, res) => {
        users.create(req, res);
    });

    app.get('/logout', (req, res) => {
        users.logout(req, res);
    });

    app.get('/messages', (req, res) => {
        messages.listing(req, res);
    });

    app.post('/messages', (req, res) => {
        messages.create(req, res);
    });

    app.get('/messages/:id', (req, res) => {
        messages.show(req, res);
    });

    app.post('/messages/:id', (req, res) => {
        comments.create(req, res);
    });

    app.post('/messages/delete/:id', (req, res) => {
        messages.delete(req, res);
        
    });
}