const Reg = require('../models/reg');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const auth = async (req , res , next )=>{
    try {
        const token = req.cookies.jwt;
     
        const verifyUser = jwt.verify(token , process.env.SECRET_KEY);
 
        // console.log(verifyUser);
        const user = await Reg.findOne({_id:verifyUser._id });
        req.user = user ;
        req.token = token ;
       
        next();
        
    } catch (error) {
        req.flash('message' , 'invalid jwt token login please');
        res.redirect('/reg/login');
       
    }
}

module.exports = auth ; 