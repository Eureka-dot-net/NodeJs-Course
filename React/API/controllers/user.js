const User = require('../models/user');

exports.getUserStatus = (req, res, next) => {
    User.findById(req.params.userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
            res.status(200).json({ status: user.status });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.putUserStatus = (req, res, next) => {
    const newStatus = req.body.status;
    User.findById(req.userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
            user.status = newStatus;
            return user.save();
        })
        .then(result => {
            res.status(200).json({ message: 'User status updated.', status: result.status });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}
