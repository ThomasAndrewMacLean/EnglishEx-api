const OAuth2Client = require('google-auth-library').OAuth2Client;
const CLIENT_ID =
    '171417293160-mc387imspjctssvr62d2g8l5g4vpblbm.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

const jwt = require('jsonwebtoken');
const DB = require('./../database/db');

function getUserEmailFromTokenForConfirm(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];

        try {
            let authData = jwt.verify(bearerToken, process.env.JWT_SECRET); //, (err, authData) => {
            const email = authData.user.email;
            req.token = email;
            next();
        } catch (error) {
            console.log(error);
            //Raven.captureException(error);

            res.status(403).json({
                message: 'something went wrong'
            });
        }
    } else {
        res.status(403).json({
            message: 'no authorization token!'
        });
    }
}

function getUserEmailFromToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        console.log(bearerToken);
        const bearerProvider = bearer[0];

        if (bearerProvider === 'Google') {
            client
                .verifyIdToken({
                    idToken: bearerToken,
                    audience: CLIENT_ID
                })
                .then(ticket => {
                    const email = ticket.getPayload().email;
                    DB.users
                        .findOne({
                            email
                        })
                        .then(user => {
                            if (user.confirmed) {
                                req.isAdmin = user.isAdmin;
                                req.token = email;
                                next();
                            } else {
                                res.status(403).json({
                                    message: 'not yet confirmed!'
                                });
                            }
                        })
                        .catch(() => {
                            //add new user from google login
                            const newUser = {
                                email,
                                password: null,
                                confirmed: false,
                                isAdmin: false
                            };
                            DB.users.insert(newUser);

                            req.isAdmin = false;
                            req.token = email;
                            next();
                            // console.log(err);
                            // //Raven.captureException(err);
                            // res.status(403).json({
                            //     message: 'something went wrong: user not found'
                            // });
                        });
                })
                .catch(err => {
                    console.log(err);

                    res.status(403).json({
                        err: 'faulty google token'
                    });
                });
        } else {
            try {
                let authData = jwt.verify(bearerToken, process.env.JWT_SECRET); //, (err, authData) => {
                console.log(authData);

                const email = authData.user.email;
                console.log(email);
                DB.users
                    .findOne({
                        email
                    })
                    .then(user => {
                        if (user.confirmed) {
                            req.isAdmin = user.isAdmin;
                            req.token = email;
                            next();
                        } else {
                            res.status(403).json({
                                message: 'not yet confirmed!'
                            });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        //Raven.captureException(err);
                        res.status(403).json({
                            message: 'something went wrong'
                        });
                    });
            } catch (error) {
                console.log(error);
                //Raven.captureException(error);

                res.status(403).json({
                    message: 'something went wrong'
                });
            }
        }
    } else {
        res.status(403).json({
            message: 'no authorization token!'
        });
    }
}

module.exports = { getUserEmailFromTokenForConfirm, getUserEmailFromToken };
