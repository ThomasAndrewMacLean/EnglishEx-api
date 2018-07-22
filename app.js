// if (process.env.NODE_ENV !== 'development') {
//     require('dotenv').load();
// }

var superb = require('superb');
//var ApiBuilder = require('claudia-api-builder'),
//    api = new ApiBuilder();

const jwt = require('jsonwebtoken');
const express = require('express');
var cookieParser = require('cookie-parser');
const logger = require('volleyball');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const db = require('monk')(`mongodb://dbReadWrite:${process.env.MONGO_PW}@cluster0-shard-00-00-vvrph.gcp.mongodb.net:27017,cluster0-shard-00-01-vvrph.gcp.mongodb.net:27017,cluster0-shard-00-02-vvrph.gcp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true`);
let users = db.get('users');
const cors = require('cors');

const app = express();
app.use(cors());

app.use(cookieParser());
app.use(logger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

function getUserEmailFromToken(req, res, next) {

    console.log(process.env.NODE_ENV);


    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        console.log(bearerToken);
        try {
            let authData = jwt.verify(bearerToken, process.env.JWT_SECRET); //, (err, authData) => {
            console.log(authData);

            const email = authData.user.email;
            console.log('EEEEemail');
            console.log(email);

            if (email === 'thomas.maclean@gmail.com') {
                req.admin = true;
            }
            users.findOne({
                email
            }).then(user => {
                if (user.confirmed) {
                    console.log('USER IS CONFIRMED');

                    req.token = email;
                    next();
                } else {
                    console.log('CONFIRMMMMM???');

                    res.status(403).json({
                        message: 'not yet confirmed!'
                    });
                }
            }).catch(err => {
                console.log('TIS NENERREUR');

                console.log(err);
                res.status(403).json(err);
            });
        } catch (error) {
            console.log('eRROOOOOORRRRR');
            console.log(error);
            res.status(403).json(error);
        }
        
    } else {
        res.status(403).json({
            err: 'no authorization token!'
        });
    }
}

app.get('/ping', (req, res) => {
    res.status(200).json('pong');
});

app.get('/update', (req, res) => {
    res.status(200).json('hoojsdfjqdlsmkfjqklsdmj');
});

app.get('/greet', function (req, res) {
    res.status(200).json(req.query.name + ' is NOT ' + superb.random());
});

app.post('/test', (req, res) => {
    const {
        password
    } = req.body;

    jwt.sign({
        password: password
    }, 'prockjlsqmfjqslmdkfjlmqksT', {
        expiresIn: '300s'
    }, (err, token) => {

        res.status(200).json(token);
    });
});

app.post('/user', (req, res) => {
    const {
        email,
        password
    } = req.body;

    const newUser = {
        email,
        password,
        confirmed: false
    };

    users.insert(newUser).then(user => {
        res.status(200).json(user);
    });
});

app.get('/user', (req, res) => {
    users.find().then(u => {
        res.status(200).json(u);
    });
});

app.post('/deleteuser', (req, res) => {
    const {
        id
    } = req.body;

    users.remove({
        _id: id
    }).then(u => {
        res.status(200).json(u);
    });
});

app.post('/signup', (req, res) => {
    const {
        password,
        email
    } = req.body;
    console.log(email + ' start signup');

    users.findOne({
        email
    }).then(user => {
        if (user) {
            res.status(403).json({
                message: 'allready a user'
            });
        } else {
            bcrypt.hash(password, saltRounds, function (err, hash) {
                const newUser = {
                    email,
                    password: hash,
                    confirmed: false
                };
                console.log(newUser);

                users.insert(newUser).then(user => {
                    //sendMail(email, req.protocol + '://' + req.get('host') + '/confirm/' + encrypt(email));
                    jwt.sign({
                        user
                    }, process.env.JWT_SECRET, {
                        expiresIn: '300s'
                    }, (err, token) => {
                        res.status(200).json({
                            token
                        });
                    });
                });
            });
        }
    }).catch(err => {
        res.status(200).json({
            err
        });
    });
});

app.post('/login', (req, res) => {
    const {
        password,
        email
    } = req.body;
    users.findOne({
        email
    }).then(user => {
        bcrypt.compare(password, user.password, function (err, resp) {
            if (resp) {
                jwt.sign({
                    user
                }, process.env.JWT_SECRET, {
                    expiresIn: '3000s'
                }, (err, token) => {
                    res.status(200).json({
                        token
                    });
                });
            } else {
                res.status(403).json({
                    message: 'wrong password'
                });
            }
        });
    }).catch(() => res.status(403).json({
        message: 'wrong user'
    }));


});

app.get('/confirm/:email', (req, res) => {
    var email = req.params.email;

    users.update({
        email: email
    }, {
        $set: {
            confirmed: true
        }
    }).then(() => {
        res.status(200).json('confirmed');
    }).catch(err => res.status(403).json(err));
});

app.post('/upload', getUserEmailFromToken, (req, res) => {
    let userTodos = db.get(req.token);
    userTodos.insert({
        test: req.body.test,
        done: false
    }).then(r => res.status(200).json(r));
});

app.get('/exercises', (req, res) => {
    let exercises = db.get('exercises');
    exercises.find({}).then(r =>{
        console.log(r);
        //TODO: map only titles and id's
        //TODO: ? getUserEmailFromToken and get his scores ?
        res.status(200).json(r);
    });
});

app.get('/exercises/:id', getUserEmailFromToken, (req, res) => {
    const id = req.params.id;
    let exercises = db.get('exercises');
    exercises.find({
        _id:   id
    }).then(r => res.status(200).json(r));
});

//app.listen(process.env.PORT || 5001, () => console.log('All is ok, sit back and relax!'));
module.exports = app;