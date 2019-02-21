const { db } = require('./../database/db');

module.exports = function(app) {
    app.get('/getFlashCards', (req, res) => {
        console.log(process.env.MONGO_PW);
        try {
            let labels = db.get('labels');
            labels.find({}).then(r => {
                return res.status(200).json(r);
            });
        } catch (error) {
            res.status(500).json(error);
        }
    });
};
