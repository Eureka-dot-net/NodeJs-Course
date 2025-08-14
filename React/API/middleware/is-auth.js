const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    
    if (!token) {
        return res.status(401).json({ message: 'Not authenticated.' });
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'your_jwt_secret_super_amazing');
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        return res.status(401).json({ message: 'Not authenticated.' });
    }
    req.userId = decodedToken.userId;
    next();
}