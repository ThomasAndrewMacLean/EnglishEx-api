const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
var randomString = require('random-string');
const sendMail = require('./../mailer/mail');

const {
    getUserEmailFromTokenForConfirm,
    getUserEmailFromToken
} = require('./../security/getInfoFromToken');
const { db, users } = require('./../database/db');

module.exports = function(app) {
    app.get('/user', getUserEmailFromToken, (req, res) => {
        if (!req.isAdmin) {
            res.status(203).json({ message: 'only admin' });
        }
        users.find().then(u => {
            u.forEach(z => (z.password = null));
            res.status(200).json(u);
        });
    });

    app.get('/getNameFromToken', getUserEmailFromToken, (req, res) => {
        res.json({
            email: req.token,
            isAdmin: req.isAdmin
        });
    });

    app.post('/deleteuser', getUserEmailFromToken, (req, res) => {
        if (!req.isAdmin) {
            res.status(203).json({ message: 'only admin' });
        }
        const { id } = req.body;

        users
            .remove({
                _id: id
            })
            .then(u => {
                res.status(200).json(u);
            });
    });

    app.post('/signup', (req, res) => {
        console.log(process.env.JWT_SECRET);

        const { password, email } = req.body;
        console.log(email + ' start signup');

        users
            .findOne({
                email
            })
            .then(user => {
                if (user) {
                    res.status(403).json({
                        message: 'allready a user'
                    });
                } else {
                    bcrypt.hash(password, saltRounds, function(err, hash) {
                        const confirmString = randomString({
                            length: 6,
                            numeric: true,
                            letters: true,
                            special: true,
                            exclude: ['a', 'b', '1']
                        });

                        const newUser = {
                            email,
                            password: hash,
                            confirmed: false,
                            isAdmin: false,
                            confirmString
                        };

                        console.log(newUser);

                        users.insert(newUser).then(user => {
                            sendMail(email, confirmString).then(() => {
                                jwt.sign(
                                    {
                                        user
                                    },
                                    process.env.JWT_SECRET,
                                    (err, token) => {
                                        res.status(200).json({
                                            token
                                        });
                                    }
                                );
                            });
                        });
                    });
                }
            })
            .catch(err => {
                res.status(200).json({
                    err
                });
            });
    });

    app.post('/login', (req, res) => {
        // Raven.captureException('login');
        const { password, email } = req.body;
        users
            .findOne({
                email
            })
            .then(user => {
                console.log(user);

                bcrypt.compare(password, user.password, function(err, resp) {
                    if (resp) {
                        jwt.sign(
                            {
                                user
                            },
                            process.env.JWT_SECRET,
                            (err, token) => {
                                res.status(200).json({
                                    token,
                                    isAdmin: user.isAdmin
                                });
                            }
                        );
                    } else {
                        res.status(403).json({
                            message: 'wrong password'
                        });
                    }
                });
            })
            .catch(() =>
                res.status(403).json({
                    message: 'wrong user'
                })
            );
    });
    app.post('/confirm', getUserEmailFromTokenForConfirm, (req, res) => {
        const code = req.body.code;
        const email = req.token;

        users
            .findOne({
                email
            })
            .then(user => {
                if (user.confirmString === code) {
                    users
                        .update(
                            {
                                email: email
                            },
                            {
                                $set: {
                                    confirmed: true
                                }
                            }
                        )
                        .then(() =>
                            res.status(200).json({
                                email,
                                isAdmin: user.isAdmin
                            })
                        );
                } else {
                    users
                        .remove({
                            email: email
                        })
                        .then(() => {
                            res.status(403).json({
                                message: 'Try to login again'
                            });
                        });
                }
            });
    });
    app.get('/getMyPoints', getUserEmailFromToken, (req, res) => {
        //Raven.captureException('GETPOINTS');
        const user = req.token;
        let points = db.get(user);
        points.find({}).then(r => res.status(200).json(r));
    });
};
