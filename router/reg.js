const { cache } = require('ejs');
const express = require('express');
const Reg = require('../models/reg');
const temp = require('../models/user');
const user = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("../middleware/auth");
const crypto = require("crypto");
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

const router = express.Router();
let userName = "";
// let uniqueString = "";

router.get('/login', async (req, res) => {

    res.render('reg/login.ejs', { article: new Reg(), userName: userName })
});

router.get('/logOut', auth, async (req, res) => {
    res.clearCookie("jwt");
    // console.log("logout");
    await req.user.save();
    res.clearCookie("userName");
    res.redirect("/");
    // res.render('reg/login.ejs' , {article : new Reg() , userName : userName });
});

router.get('/login/signUp', async (req, res) => {

    res.render('reg/SignUp.ejs', { article: new Reg(), userName: userName })
});

router.get('/contact', async (req, res) => {
    userName = req.cookies.userName;
    res.render('reg/contact', { userName: userName });
});

router.post('/signUp', async (req, res) => {
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    let newUser = new temp({
        email: req.body.email,
        userName: req.body.userName,
        password: req.body.password,
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
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'articleblog8@gmail.com',
            pass: process.env.passwordGmail

        }
    });

    transporter.sendMail(msg, function (error, info) {
        if (error) {
            console.log("*");
            console.log(error);
            res.redirect('/');
        } else {
            console.log('Email sent: ' + info.response);
            res.send("Please check your mail for verifiction");

        }
    });

    try {

        newUser = await newUser.save();
        // await sgMail.send(msg);
        // req.send('success', 'Thanks for registering . Please check your mail to verify');
        // res.redirect('/');
    } catch (error) {
        console.log(error);
        res.send('error', 'Something went wrong');
    }
   
})

router.get('/verify-email/:uniqueString', async (req, res) => {
    const {uniqueString} = req.params ;
    const user = await temp.findOne({ emailToken: uniqueString });
    if (!user) {
        console.log("*");
        res.send('error', 'Token is invalid . Please contact us for assistent');
        return res.redirect('/');
    }
    let newUser = new Reg({
        email: user.email,
        userName: user.userName,
        password: user.password,
        emailToken: user.emailToken,
        isVerified: true


    });
    user.emailToken = null;
    user.isVerified = true;
    userName = newUser.userName;
    const token = await newUser.generateAuthToken();
    res.cookie("jwt", token, {
        httpOnly: true,
        //  expires : new Date(Date.now() + 5000000)
    });

    res.cookie("userName", userName);

    newUser = await newUser.save();

    res.redirect('/');

})


router.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {

        const userData = await Reg.findOne({ email: email });

        const isMatch = await bcrypt.compare(password, userData.password);

        if (isMatch) {

            const token = await userData.generateAuthToken();
            res.cookie("jwt", token, {
                // expires : new Date(Date.now() + 5000000) ,
                httpOnly: true,

            });
            userName = userData.userName;
            res.cookie("userName", userName);
            res.redirect('/');

        }
        else {
            res.send("Worng password");
        }

    }
    catch (e) {

        res.status(401).send("invalid access");
    }
})


module.exports = router;


