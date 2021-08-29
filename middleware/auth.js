const Reg = require('../models/reg');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const auth = async (req , res , next )=>{
    try {
        const token = req.cookies.jwt;
        // console.log(token);
        const verifyUser = jwt.verify(token , process.env.SECRET_KEY);
 
        // console.log(verifyUser);
        const user = await Reg.findOne({_id:verifyUser._id });
        req.user = user ;
        req.token = token ;
        // console.log(user.userName);
        next();
        
    } catch (error) {
        res.status(401).send(error);
    }
}

module.exports = auth ; 