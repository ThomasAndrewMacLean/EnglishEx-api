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
    } else {
        res.status(403).json({
            message: 'no authorization token!'
        });
    }
}

module.exports = { getUserEmailFromTokenForConfirm, getUserEmailFromToken };
