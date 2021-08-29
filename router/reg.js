const { cache } = require('ejs');
const express = require('express');
const Reg = require('../models/reg');
const user = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("../middleware/auth");

const router = express.Router();
let userName = "";

router.get('/login' , async (req , res)=>{
   
    res.render('reg/login.ejs' , {article : new Reg() , userName : userName })
});

router.get('/logOut' , auth , async (req , res)=>{
    res.clearCookie("jwt");
    // console.log("logout");
    await req.user.save();
    res.clearCookie("userName");
    res.redirect("/");
    // res.render('reg/login.ejs' , {article : new Reg() , userName : userName });
});

router.get('/login/signUp' , async (req , res)=>{
    
    res.render('reg/SignUp.ejs' , {article : new Reg() , userName : userName})
});

router.get('/contact' , async (req , res)=>{
    userName = req.cookies.userName;
    res.render('reg/contact' , { userName : userName});
});

router.post('/signUp' , async (req , res)=>{
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword ;
    
    try{
       
        if(password === confirmPassword)
        {
            let reg = new Reg({
                email : req.body.email,
                userName : req.body.userName,
                password : req.body.password
        
            });
            userName = req.body.userName;
           
            const token = await reg.generateAuthToken();
             res.cookie("jwt" , token ,  {
                 httpOnly : true,
                //  expires : new Date(Date.now() + 5000000)
             });

             res.cookie("userName" , userName);

            reg = await reg.save();
           
            res.redirect('/');
        }
        else 
        {
            res.status(401).send("password are not same");
        }
    }
    catch(e) {
        
        res.status(401).send(e);
    }
})

router.post('/login' , async (req , res)=>{
    const email = req.body.email;
    const password = req.body.password;
    try{
         
        const userData = await Reg.findOne({email : email});
     
        const isMatch = await bcrypt.compare(password , userData.password);
        
        if(isMatch)
        {
            
            const token = await userData.generateAuthToken();
            res.cookie("jwt" , token ,  {
                // expires : new Date(Date.now() + 5000000) ,
                httpOnly : true,
               
            });
            userName = userData.userName ;
            res.cookie("userName" , userName);
            res.redirect('/');
            
        }
        else
        {
            res.send("Worng password");
        }

    }
    catch(e) {
 
        res.status(401).send("invalid access");
    }
})


module.exports = router;


