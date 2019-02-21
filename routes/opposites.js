const { db } = require('./../database/db');

module.exports = function(app) {
    app.get('/getFlashCards', (req, res) => {
        console.log(process.env.MONGO_PW);
        try {
            let labels = db.get('exercises');
            labels.find({ type: 'E' }).then(r => {
                const exercises = r.map(x => x.exercise);
                const randomExercise =
                    exercises[Math.floor(Math.random() * exercises.length)];
                return res
                    .status(200)
                    .json(
                        randomExercise.map(x => ({
                            '1': x.partA,
                            '2': x.partB
                        }))
                    );
            });
        } catch (error) {
            res.status(500).json(error);
        }
    });
};
