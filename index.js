const express = require('express');
const app = express();


// Model Section
require('./server/config/mongoose');

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
app.use(express.static(path.join(__dirname, './client/static')));

// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './client/views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');

require('./server/config/routes')(app);

app.listen(5000, () => {
    console.log("listening on port 5000");
})
