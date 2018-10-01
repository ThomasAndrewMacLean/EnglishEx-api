//if (process.env.NODE_ENV !== 'production') {
//require('dotenv').load();
//}

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
var randomString = require('random-string');
const monk = require('monk');

let url = `mongodb://dbReadWrite:${
    process.env.MONGO_PW
}@cluster0-shard-00-00-vvrph.gcp.mongodb.net:27017,cluster0-shard-00-01-vvrph.gcp.mongodb.net:27017,cluster0-shard-00-02-vvrph.gcp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true`;
//if (process.env.NODE_ENV !== 'production') {
//     url = 'localhost:27017/englishex';
//}
const db = monk(url);
let users = db.get('users');
const cors = require('cors');

//var Raven = require('raven');

// var iopipe = require('@iopipe/iopipe')({
//     token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwNTA3OGYzNy1kMDM1LTQ3MzUtODMwZC1mNDE2NmRjYzUxNDQiLCJqdGkiOiJjNWMzM2VjMi04Y2Y0LTRhZGYtOTFjZC1lMzRlNDc1OTFjMzQiLCJpYXQiOjE1MzcyMjc1NjgsImlzcyI6Imh0dHBzOi8vaW9waXBlLmNvbSIsImF1ZCI6Imh0dHBzOi8vaW9waXBlLmNvbSxodHRwczovL21ldHJpY3MtYXBpLmlvcGlwZS5jb20vZXZlbnQvLGh0dHBzOi8vZ3JhcGhxbC5pb3BpcGUuY29tIn0.aIbp2wx9Axs5DTxgDuAWk6l3AyxCZRUit7idAK87MhU'
//   });

// Raven.config(
//     'https://ea53bfea099a4322b4591b6cc07ef6c8@sentry.io/1282650'
// ).install();

// if (process.env.NODE_ENV === 'production') {
// }

const app = express();

app.use(cors());

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });

app.use(cookieParser());
app.use(logger);
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

// const crypto = require('crypto');
// const algorithm = 'aes-256-ctr';
// const password = process.env.CRYPTO;

// let encrypt = (text) => {
//     var cipher = crypto.createCipher(algorithm, password);
//     var crypted = cipher.update(text, 'utf8', 'hex');
//     crypted += cipher.final('hex');
//     return crypted;

// };
// let decrypt = (text) => {
//     var decipher = crypto.createDecipher(algorithm, password);
//     var dec = decipher.update(text, 'hex', 'utf8');
//     dec += decipher.final('utf8');
//     return dec;
// };

//let fs = require('fs');
const fetch = require('node-fetch');
const mailOptions = {
    from: 'noreply', // sender address??
    to: 'thomas.maclean@gmail.com', // list of receivers
    subject: 'Subject of your email', // Subject line
    html: '<p>Your html here test</p>' // plain text body
};

function sendMail(mail, linky) {
    //let data = fs.readFileSync('./public/mail.html', 'utf8');
    mailOptions.html = linky; // data.replace('{{{link}}}', linky);
    mailOptions.to = mail;
    console.log('sending mail ✉️');

    var body = {
        mailBody: mailOptions.html,
        subject: 'Please confirm your emailadress with this code',
        mail
    };
    fetch('https://p0dmber89l.execute-api.eu-west-1.amazonaws.com/dev/mail', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(json => console.log(json));
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

            //SETTING RAVEN SENTRY EMAIL CONTEXT FOR ERROR TRACKING
            // Raven.setContext({
            //     user: {
            //         email: email
            //     }
            // });

            //Raven.captureException('Test USER');

            if (email === 'thomas.maclean@gmail.com') {
                req.admin = true;
            }
            users
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

app.get('/ping', (req, res) => {
    res.status(200).json('pong');
});

app.get('/env', (req, res) => {
    // Raven.config(
    //     'https://ea53bfea099a4322b4591b6cc07ef6c8@sentry.io/1282650'
    // ).install();
    // Raven.setContext({
    //     user: {
    //         id: 123098
    //     }
    // });
    // Raven.captureException('Test USER gettest test');

    try {
        throw new Error({ message: 'it goes wrong man!' });
    } catch (e) {
        // Raven.captureException(e);
    }
    res.status(200).json(0990);
});

app.get('/greet', function(req, res) {
    res.status(200).json(req.query.name + ' is NOT ' + superb.random());
});

app.post('/test', (req, res) => {
    const { password } = req.body;

    jwt.sign(
        {
            password: password
        },
        'prockjlsqmfjqslmdkfjlmqksT',
        {
            expiresIn: '300s'
        },
        (err, token) => {
            res.status(200).json(token);
        }
    );
});

app.get('/user', getUserEmailFromToken, (req, res) => {
    if (!req.isAdmin) {
        res.status(203).json({ message: 'only admin' });
    }
    users.find().then(u => {
        u.forEach(z => (z.password = null));
        res.status(200).json(u);
    });
});

app.post('/user', (req, res) => {
    const { email, password } = req.body;

    const newUser = {
        email,
        password,
        confirmed: false
    };

    users.insert(newUser).then(user => {
        res.status(200).json(user);
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
                        sendMail(email, confirmString);
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

app.get('/setAdmin', (req, res) => {
    users
        .update(
            {
                email: 'alistair.maclean@telenet.be'
            },
            {
                $set: {
                    isAdmin: true
                }
            }
        )
        .then(x => res.status(200).json(x));
});

app.post('/addexercise', getUserEmailFromToken, (req, res) => {
    if (!req.isAdmin) {
        res.status(203).json({ message: 'only admin' });
    }
    let exercises = db.get('exercises');
    const exercise = req.body.exercise;
    if (exercise.id) {
        if (exercise.delete) {
            //Delete all the exercise in the courses
            let courses = db.get('courses');
            courses.find({}).then(allCourses => {
                allCourses.forEach(course => {
                    if (
                        course.exercises.filter(e => e.id === exercise.id)
                            .length > 0
                    ) {
                        courses.update(
                            { _id: course._id },
                            {
                                $set: {
                                    exercises: course.exercises.filter(
                                        e => e.id !== exercise.id
                                    )
                                }
                            }
                        );
                    }
                });
            });

            exercises
                .update(
                    { _id: exercise.id },
                    { $set: { delete: exercise.delete } }
                )
                .then(r => res.status(200).json(r));
        }
        if (exercise.type === 'A') {
            exercises
                .update(
                    { _id: exercise.id },
                    {
                        title: exercise.title,
                        type: exercise.type,
                        exercise: exercise.exercise,
                        delete: exercise.delete
                    }
                )
                .then(r => res.status(200).json(r));
        }
    } else {
        exercises.insert(exercise).then(r => res.status(200).json(r));
    }
});

app.post('/addcourse', getUserEmailFromToken, (req, res) => {
    if (!req.isAdmin) {
        res.status(203).json({ message: 'only admin' });
    }
    let courses = db.get('courses');
    courses.insert(req.body.course).then(r => res.status(200).json(r));
});

app.post('/editcourse', getUserEmailFromToken, (req, res) => {
    if (!req.isAdmin) {
        res.status(203).json({ message: 'only admin' });
    }
    let courses = db.get('courses');
    let c = req.body.course;
    courses
        .update(
            {
                _id: c._id
            },
            req.body.course
        )
        .then(r => res.status(200).json(r));
});

app.get('/getLabels', (req, res) => {
    try {
        let labels = db.get('labels');
        labels.find({}).then(r => {
            res.status(200).json(r);
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

app.post('/updateLabel', getUserEmailFromToken, (req, res) => {
    if (!req.isAdmin) {
        res.status(203).json({ message: 'only admin' });
    }
    try {
        let label = req.body.label;
        let labels = db.get('labels');
        labels
            .update(
                {
                    _id: label._id
                },
                label
            )
            .then(r => res.status(200).json(r));
    } catch (error) {
        res.status(500).json(error);
    }
});

app.post('/newLabel', getUserEmailFromToken, (req, res) => {
    if (!req.isAdmin) {
        res.status(203).json({ message: 'only admin' });
    }
    try {
        let label = req.body.label;
        let labels = db.get('labels');
        labels.insert(label).then(r => res.status(200).json(r));
    } catch (error) {
        res.status(500).json(error);
    }
});

app.get('/courses', getUserEmailFromToken, (req, res) => {
    try {
        let exercises = db.get('courses');
        exercises.find({}).then(r => {
            res.status(200).json(r);
        });
    } catch (error) {
        res.status(500).json(error);

        // Raven.captureException(error);
    }
});

app.get('/getMyPoints', getUserEmailFromToken, (req, res) => {
    //Raven.captureException('GETPOINTS');
    const user = req.token;
    let points = db.get(user);
    points.find({}).then(r => res.status(200).json(r));
});

// app.get('/getMyPointsTest', getUserEmailFromToken, (req, res) => {
//     const user = req.token;
//     let points = db.get(user + '/points');
//     points.find({}).then(r => res.status(200).json(r));
// });

app.get('/course/:id', getUserEmailFromToken, (req, res) => {
    let exercises = db.get('courses');
    exercises
        .find({
            _id: req.params.id
        })
        .then(r => {
            res.status(200).json(r);
        });
});

app.get('/exercises', getUserEmailFromToken, (req, res) => {
    let exercises = db.get('exercises');
    exercises.find({}).then(r => {
        console.log(r);
        //TODO: map only titles and id's
        //TODO: ? getUserEmailFromToken and get his scores ?
        res.status(200).json(r);
    });
});

app.post('/saveEx', getUserEmailFromToken, (req, res) => {
    const id = req.body.exId;
    const data = req.body.data;
    const user = req.token;
    const total = data.length;
    let score = 0;
    let exercises = db.get('exercises');
    exercises
        .find({
            _id: id
        })
        .then(r => {
            console.log(r);
            let temp = r[0];
            if (temp.type === 'A') {
                temp.exercise.forEach((ex, i) => {
                    if (ex.partB === data[i]) {
                        score++;
                    }
                });
            }
            if (temp.type === 'B') {
                temp.exercise.forEach((ex, i) => {
                    if (
                        ex.partA.split('[[')[1].split(']]')[0] === data[i].ans
                    ) {
                        score++;
                    }
                });
            }
            let userData = db.get(user);
            //let scores = userData.get('scores');
            userData.insert({
                exId: id,
                score,
                total
            });
            return res.status(200).json(`${score}/${total}`);
        });
});

app.get('/exercises/:id', getUserEmailFromToken, (req, res) => {
    const id = req.params.id;
    let exercises = db.get('exercises');
    exercises
        .find({
            _id: id
        })
        .then(r => {
            console.log(r);
            let temp = r[0];
            if (temp.type === 'A') {
                const len = temp.exercise.length;

                temp.exercise.forEach(ex => {
                    let x = Math.floor(Math.random() * len);
                    let tem = temp.exercise[x].partB;
                    temp.exercise[x].partB = ex.partB;
                    ex.partB = tem;
                });
            }
            if (temp.type === 'B') {
                temp.exercise.forEach(ex => {
                    let ansLength = ex.partA.split('[[')[1].split(']]')[0]
                        .length;
                    let left = ex.partA.split('[[')[0];
                    let right = ex.partA.split(']]')[1];

                    ex.partA =
                        left + '[[' + '*'.repeat(ansLength) + ']]' + right;
                });
            }
            return res.status(200).json([temp]);
        });
});

//if (process.env.NODE_ENV !== 'production') {
//app.listen(process.env.PORT || 5001, () => console.log('All is ok, sit back and relax!'));
//}

module.exports = app;
