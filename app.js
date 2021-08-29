require('dotenv').config();
const express = require('express');
const articleBlog = require('./router/article');
// const Register = require('./router/reg');
const reg = require('./router/reg');
const mongoose = require('mongoose');
const Article = require('./models/article');
const regModel = require('./models/reg');
const marked = require('marked');
const slugify = require('slugify');
const methodOverride = require('method-override');
const user = require('./models/user');
const cookieParser = require("cookie-parser");
// const jwt = require("jsonwebtoken");

// const {json} = require('express');
const app = express();


// console.log(process.env.SECRET_KEY);

// const reg = Register.rou;

const id = "60ec59d2b4f51f2a0823332f";
mongoose.connect('mongodb://localhost/blog', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("we are connected");
});

app.use('/statics', express.static('statics'));    // serve file static
// app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

let userName  = "";

app.get('/', async (req, res) => {
    
    const articles = await Article.find().sort({ creatAt: 'desc' });
    userName = req.cookies.userName;
    // console.log(userName);   
    res.render('article/index.ejs', { articles: articles , userName : userName });
    // res.render('reg/index1.ejs', { articles: articles });
});
port = 5000;


app.use('/article', articleBlog);
app.use('/reg', reg );

app.listen(port, () => {
    console.log(`server is running on port${port}`);
});