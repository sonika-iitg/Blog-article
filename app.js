const express = require('express');
const articleBlog = require('./router/article');
const reg = require('./router/reg');
const mongoose = require('mongoose');
const Article = require('./models/article');
const regModel = require('./models/reg');
const marked = require('marked');
const slugify = require('slugify');
const methodOverride = require('method-override');
// const {json} = require('express');
const app = express();


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

app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {

    const articles = await Article.find().sort({ creatAt: 'desc' });
    res.render('article/index.ejs', { articles: articles });
    // res.render('reg/index1.ejs', { articles: articles });
});
port = 5000;

app.use('/article', articleBlog);
app.use('/reg', reg );

app.listen(port, () => {
    console.log(`server is running on port${port}`);
});