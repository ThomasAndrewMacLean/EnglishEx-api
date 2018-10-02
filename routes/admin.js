const { getUserEmailFromToken } = require('./../security/getInfoFromToken');
const { db, users } = require('./../database/db');

module.exports = function(app) {
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
};
