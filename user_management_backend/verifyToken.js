const jwt = require('jsonwebtoken');
const secretKey = "dfihjsauiuhewruihefjdfhjh3242893798#$@#TGFASaqwea$353ad"

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]

    if (!token) {
        res.status(403).send("A token is required for authentication");
    } else {
        // try {
        //     const decodedToken = jwt.verify(token, secretKey);
        //     req.decodedToken = decodedToken
        // } catch {
        //     res.json({ status: "error", data: "Invalid token" })
        // }
        jwt.verify(token, secretKey, (err, decodeToken) => {
            if (!err) {
                req.decodeToken = decodeToken
            } else if (err) {
                res.status(403).send(err)
            }
        })
    }
    
    return next();
};

module.exports = verifyToken;