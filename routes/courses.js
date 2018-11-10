const { getUserEmailFromToken } = require('./../security/getInfoFromToken');
const { db } = require('./../database/db');
let { removeAnswers } = require('./../helpers/removeAnswers');

module.exports = function(app) {
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
            exercises
                .update(
                    { _id: exercise.id },
                    {
                        title: exercise.title,
                        info: exercise.info,
                        searchTag: exercise.searchTag,
                        type: exercise.type,
                        exercise: exercise.exercise,
                        delete: exercise.delete
                    }
                )
                .then(r => res.status(200).json(r));
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

    app.post('/getAnswer', getUserEmailFromToken, (req, res) => {
        const id = req.body.exId;
        let exercises = db.get('exercises');
        exercises
            .find({
                _id: id
            })
            .then(answer => {
                //TODO: check if we are alowed to return the answer?
                res.status(200).json(answer);
            });
    });

    app.post('/saveEx', getUserEmailFromToken, (req, res) => {
        const id = req.body.exId;
        const data = req.body.data;

        const user = req.token;
        let total = data.length;
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
                            ex.partA.split('[[')[1].split(']]')[0] ===
                            data[i].ans
                        ) {
                            score++;
                        }

                        if (ex.partA.split('[[')[2]) {
                            total++;
                            if (
                                ex.partA.split('[[')[2].split(']]')[0] ===
                                data[i].ans1
                            ) {
                                score++;
                            }
                        }
                    });
                }
                if (temp.type === 'C') {
                    temp.exercise.forEach((ex, i) => {
                        if (
                            ex.partA.split('[[')[1].split(']]')[0] ===
                            data[i].ans
                        ) {
                            score++;
                        }
                        //get point for correct place
                        total++;
                        let words = ex.partA.split('[[')[0].split(' ');
                        if (words.length === data[i].ans1) {
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
                if (temp.type === 'B' || temp.type === 'C') {
                    temp.exercise.forEach(ex => {
                        ex.partA = removeAnswers(ex.partA, temp.type);
                    });
                }
                return res.status(200).json([temp]);
            });
    });
};
