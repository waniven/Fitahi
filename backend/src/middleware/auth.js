const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    try{
        //reads authentication header 
        const authheader = req.headers.authorization || '';

        //expect authorization token
        //splits auth header "Authorization: scheme abc.def.ghi" 
        //index 0 is scheme and index 1 is the token string
        const [scheme, token] = authheader.split(' ');

        //return error if token is missing or header is incorrect 
        if (!token || !/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ error: 'Missing or malformed Authorization header' });
        }

        //use secret to verify the token signature and expiration
        const jwt_secret = process.env.JWT_SECRET; //JWT secret 
        const decoded = jwt.verify(token, jwt_secret); 

        //attach to request for downstream handelers 
        req.user = { id: decoded.sub, email: decoded.email }; //Adds the user info from the token payload to req.user for later handlers to use

        return next(); //continue 
    } catch (err) {
        return res.status(401).json({ error: 'Ivalid or expired token' });
    }
}

module.exports = auth;