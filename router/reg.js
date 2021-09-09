const { cache } = require('ejs');
const express = require('express');
const Reg = require('../models/reg');
const temp = require('../models/user');
const Cont = require('../models/contact');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("../middleware/auth");
const crypto = require("crypto");
const nodemailer = require('nodemailer');


const router = express.Router();
let userName = "";

function sendMail(msg){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'articleblog8@gmail.com',
            pass: process.env.passwordGmail

        }
    });

    transporter.sendMail(msg, function (error, info) {
        if (error) {
            // console.log("*");
            console.log(error);
            res.redirect('/');
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}

router.get('/login', async (req, res) => {
    userName = req.cookies.userName;
    res.render('reg/login.ejs', { article: new Reg(), userName: userName  , message : req.flash('message')});
});

router.get('/logOut', auth, async (req, res) => {
    res.clearCookie("jwt");
    
    await req.user.save();
    res.clearCookie("userName");
    res.redirect("/");
});

router.get('/login/signUp', async (req, res) => {
    userName = req.cookies.userName;
    res.render('reg/SignUp.ejs', { article: new Reg(), userName: userName  });
});

router.get('/contact', async (req, res) => {
    userName = req.cookies.userName;
    // let contactMessage = 
    res.render('reg/contact', { userName: userName ,  message : req.flash('contactMessage') });
});
router.get('/forgetPassword', async (req, res) => {
    userName = req.cookies.userName;
    res.render('reg/forgetPassword', { article: new Reg(), userName: userName });
});

router.post('/forgetPassword', async (req, res) => {
    const userData = await Reg.findOne({ email: req.body.email });
    if (!userData)
    {
        req.flash('message' , 'user with given email does not exist');
        res.redirect('/reg/login');
        return ;
    }
        
    let token = userData.emailToken;
    if (!token) {
        token = crypto.randomBytes(32).toString("hex");
        const result = await Reg.updateOne({ _id: userData._id }, {
            $set: {
                emailToken : token
            }
        });
        
    }
    const msg = {
        from: 'articleblog8@gmail.com',
        to: userData.email,
        subject: 'Reset your password',
        text: `
         to reset your password , Please click on given link
         <a href = "http://${req.headers.host}/reg/forgetPassword/${userData._id}/${token}"> click here </a>
         
        `,
        html: `
        <h1> Hello , </h1>
        <p> to reset your password , Please click on given link</p>
        <a href = "http://${req.headers.host}/reg/forgetPassword/${userData._id}/${token}"> click here </a>
        
        `

    }
    sendMail(msg);
    try {
        req.flash('message' , ' Please check your mail to reset password and then login');
        res.redirect('/reg/login');
    } catch (error) {
        console.log(error);
        req.flash('message' , 'Something went wrong try again');
        res.redirect('/reg/login');
    }
});

router.get('/forgetPassword/:userId/:token' , async(req , res)=>{
    
    userName = req.cookies.userName;
    userId = req.params.userId;  
    res.render('reg/password', { article: new Reg(), userName: userName, userId : userId });
});

router.post('/forgetPassword/:userId' , async(req , res)=>{
    userId = req.params.userId;
    const userData = await Reg.findById(req.params.userId);
    if (!userData) 
    {

        req.flash('message' , 'Try again ,  invalid link or expired ');
        res.redirect('/reg/login');
        return ;
        // return res.status(400).send("");

    }
    
    let newPassword = req.body.password;
    newPassword = await bcrypt.hash(newPassword , 10);
    const result = await Reg.updateOne({ _id: userData._id }, {
        $set: {
            password : newPassword
        }
    });
    try {
        res.redirect("/");
    } catch (error) {
        console.log(error);
        // return res.status(400).send("invalid link or expired");
        req.flash('message' , 'Try again ,  invalid link or expired');
        res.redirect('/reg/login');
        return ; 
    }

});

router.post('/signUp', async (req, res) => {
    let uniqueness = await Reg.findOne({email : req.body.email});
    if(uniqueness)
    {
        // console.log(uniqueness);
        req.flash('message' , 'Email already exist ');
        res.redirect('/reg/login');
        return ; 
    }
    uniqueness =await  temp.find({email : req.body.email});
    if(uniqueness)
    {
        await temp.deleteOne({email:req.body.email});
    }
    // const password = await bcrypt.hash(req.body.password , 10);
    const password = req.body.password ;
    let newUser = new temp({
        email: req.body.email,
        userName: req.body.userName,
        password: password,
        emailToken: crypto.randomBytes(64).toString('hex'),
        isVerified: false


    });
    const uniqueString = newUser.emailToken;
    const msg = {
        // from: 'noreply@gmail.com',
        from: 'articleblog8@gmail.com',
        to: newUser.email,
        subject: 'Verfiy your email',
        text: `
         Hellow , thanks for registering on our site.
         Please copy and paste the given address below to verify your account.
         http://${req.headers.host}/reg/verify-email/${newUser.emailToken}
        `,
        html: `
        <h1> Hello , </h1>
        <p> Thanks for registering on our site</p>
        <a href = "http://${req.headers.host}/reg/verify-email/${newUser.emailToken}"> Verify you account</a>
        `
    }
    
    

    try {

        newUser = await newUser.save();
        sendMail(msg);
        req.flash('message' , 'Thanks for registering . Please check your mail to verify and then login');
        res.redirect('/reg/login');
    } catch (error) {
        console.log(error);
        req.flash('message' , 'Try again ,  Something went wrong');
        res.redirect('/reg/login');
        // res.send('error', 'Something went wrong');
    }

})

router.get('/verify-email/:uniqueString', async (req, res) => {
    const { uniqueString } = req.params;
    const user = await temp.findOne({ emailToken: uniqueString });
    if (!user) {
        req.flash('message' , 'Try again , Token is invalid ');
        res.redirect('/reg/login');
        // res.send('error', 'Token is invalid . Please contact us for assistent');
        // return res.redirect('/');
        return ; 
    }
    let newUser = new Reg({
        email: user.email,
        userName: user.userName,
        password: user.password,
        emailToken: user.emailToken,
        // isVerified: true


    });
    
    userName = newUser.userName;
    const token = await newUser.generateAuthToken();
    res.cookie("jwt", token, {
        httpOnly: true,
        //  expires : new Date(Date.now() + 5000000)
    });

    res.cookie("userName", userName);

    newUser = await newUser.save();
    await temp.deleteOne({email : user.email});
    res.redirect('/');

})


router.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await Reg.findOne({ email: email });
    if(!userData)
    {
        req.flash('message' , 'Email does not exist ');
        res.redirect('/reg/login');
        return ;
    }
    try {

        const isMatch = await bcrypt.compare(password, userData.password);

        if (isMatch) {

            const token = await userData.generateAuthToken();
            res.cookie("jwt", token, {
                
                httpOnly: true,

            });
            userName = userData.userName;
            res.cookie("userName", userName);
            res.redirect('/');

        }
        else {
            req.flash('message' , 'Email does not exist or password is incorrect ');
            res.redirect('/reg/login');
            return ;
            // res.send("Worng password");
        }

    }
    catch (e) {
        req.flash('message' , 'invalid access');
        res.redirect('/reg/login');
        return ;
        // res.status(401).send("invalid access");
    }
});


router.post('/contact' , async (req , res)=>{
    let newQuery = new Cont({
        email : req.body.email,
        query : req.body.query,
        // member : req.body.member,
        elaborate : req.body.elaborate
    });

    newQuery = await newQuery.save();
    try {
        req.flash('contactMessage' , 'We will contact you soon');
        res.redirect('/reg/contact');
        return ;
    } catch (error) {
        req.flash('contactMessage' , 'Something went wrong try again');
        res.redirect('/reg/contact');
        return ;
    }
})


module.exports = router;


