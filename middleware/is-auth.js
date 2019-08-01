const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {
    try{
    const authHeader = req.get('Authorization');
    if(!authHeader){
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1]; //Authorization: Bearer <token> => ['Bearer', '<token>']
    if(!token || token === '') {
        req.isAuth = false;
        return next();
    }
    
        const decodedToken = jwt.verify(token, 'someSuperSecretKey');
        if(!decodedToken){
            req.isAuth = false;
            return next();
        }
        req.userId = decodedToken.userId;
        req.isAuth = true
        next();
    }catch(err){
        req.isAuth = false;
        return next();
    }

}