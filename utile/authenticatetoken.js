const jwt= require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  console.log("HERE")
    var token =
      req.body.token || req.query.token || req.headers["x-access-token"] || req.headers["authorization"];
      console.log("HERE",token)
    if (!token) {
      res.status(403).json({err:"A token is required for authentication"});
      return 
    }
    try {
      if (!token.startsWith("Bearer ")){
        res.status(401).json({err:true,msg:'Invalid Token Type'})
        return
      }
      token = token.substring(7, token.length);
      jwt.verify(token, process.env.JWT_SECRET,(err,decoded)=>{
        if(err){
          res.status(401).json({err:true,msg:'Token Failed'});
          return
        }
        req.id=decoded.id;
        console.log("TOKEN VERIFIED",decoded);
        next();
      });
    } catch (err) {
      console.log(err);
      res.status(401).json({err:true,msg:'Invalid Token'});
      return 
    }
    //next();
  };

const verifySocketToken=(socket,next)=>{
  if (socket.handshake.query && socket.handshake.query.token){
    jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) return next(new Error('Authentication error'));
      socket.decoded = decoded;
      next();
    });
  }
  else {
    next(new Error('Authentication error'));
  }     
}
  
module.exports ={ 
  verifyToken,
  verifySocketToken
};