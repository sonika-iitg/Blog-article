const { cache } = require('ejs');
const express = require('express');
const Reg = require('../models/reg');

const router = express.Router();


router.get('/login' , (req , res)=>{
    res.render('reg/login.ejs' , {article : new Reg()})
});

router.get('/login/signUp' , (req , res)=>{
    res.render('reg/SignUp.ejs' , {article : new Reg()})
});

router.get('/contact' , (req , res)=>{
    res.render('reg/contact');
});

router.post('/signUp' , async (req , res)=>{
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword ;
    console.log(password);
    let reg = new Reg({
        email : req.body.email,
        userName : req.body.userName,
        password : req.body.password

    })
    
    try{
        if(password === confirmPassword)
        {
            reg = await reg.save();
            res.redirect('/');
        }
        else 
        {
            res.send("password are not same");
        }
    }
    catch(e) {
        // console.log(reg);
        res.send(e);
        // res.render('reg/signUp' , {reg : reg});
    }
})

router.post('/login' , async (req , res)=>{
    const email = req.body.email;
    const password = req.body.password;
    console.log(email);
    console.log(password);
    try{
         
        const user = await Reg.findOne({email : email});
        console.log(user);
        if(user.password === password)
        {
           res.redirect('/');
              
        }
        else
        {
            res.send("Worng password");
        }

    }
    catch(e) {
 
        res.send("invalid access");
    }
})


module.exports = router;