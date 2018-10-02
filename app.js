
const express = require('express');
var cookieParser = require('cookie-parser');
const logger = require('volleyball');
const bodyParser = require('body-parser');


const cors = require('cors');

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(logger);
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.get('/ping', (req, res) => {
    res.status(200).json('pong');
});

//ROUTES
require('./routes/admin')(app);
require('./routes/courses')(app);
require('./routes/general')(app);
require('./routes/users')(app);

// app.post('/user', (req, res) => {
//     const { email, password } = req.body;

//     const newUser = {
//         email,
//         password,
//         confirmed: false
//     };

//     users.insert(newUser).then(user => {
//         res.status(200).json(user);
//     });
// });


//if (process.env.NODE_ENV !== 'production') {
app.listen(process.env.PORT || 5001, () => console.log('All is ok, sit back and relax!'));
//}

//module.exports = app;
