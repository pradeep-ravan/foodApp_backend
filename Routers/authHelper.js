const jwt = require("jsonwebtoken");
const { JWT_KEY } = require("../../../secrets");
function protectRoute(req, res, next) {
   // console.log(req.cookies);
    try {
       
        if(req.cookies.jwt){
            let decryptedToken = jwt.verify(req.cookies.jwt, JWT_KEY);
            if(decryptedToken){
                //console.log(isVerified);
                req.uid = decryptedToken.id;
                next();
            }
        }else{
            res.status(401).json({
                message: "you are not allowed"
            })
        }
    }catch{
        res.status(500).json({
            message:"server error"
        })
    }
}
module.exports = protectRoute;