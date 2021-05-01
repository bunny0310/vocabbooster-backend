const jwt = require('jsonwebtoken');

const verify = (req, res, next) => {
    let user = null;
    try {
        user = jwt.verify(req.header('Authorization'), 'secret1234');
        req.user = user;
    } catch (err) {
        return res.status(401).json({"err": "unauthorized"});
    }
    next();
}

module.exports = {verify};