const { db } = require('./../database/db');

module.exports = function(app) {
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
};
