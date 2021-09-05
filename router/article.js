const { cache } = require('ejs');
const express = require('express');
const Article = require('../models/article');
const user = require('../models/user');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("../middleware/auth");
const { findById } = require('../models/article');
const marked = require('marked');
const creatDomPurify = require('dompurify');
const {JSDOM} = require('jsdom');
const dompurify = creatDomPurify(new JSDOM().window);
const router = express.Router();



router.get('/new', auth, async (req, res) => {

    res.render('article/new.ejs', { article: new Article() })
});

router.get('/yourArticle', auth, async (req, res) => {

    let userName = req.user.userName;
    const article = await Article.find({ userName: userName }).sort({ creatAt: 'desc' });

    res.render('article/yourArticle.ejs', { articles: article, userName: userName });
});

router.get('/edit/:id', auth ,  async (req, res) => {
    const article = await Article.findById(req.params.id);
    const updateId = req.params.id;
    res.cookie("update_id", updateId);

    res.render('article/edit.ejs', { article: article })
});

router.get('/:slug', async (req, res) => {
    let userName = "";
    const article = await Article.findOne({ slug: req.params.slug });
    if (article == null)
        res.redirect('/');
    res.render('article/show.ejs', { article: article, userName: userName });
})


router.post('/', auth, async (req, res) => {

    let userName = req.user.userName;
    let article = new Article({
        title: req.body.title,
        discription: req.body.discription,
        markdown: req.body.markdown,
        userName: userName
    })

    try {
        article = await article.save()
        res.redirect(`/article/${article.slug}`)

    }
    catch (e) {
        let userName = req.user.userName;
        res.status(401).render('article/new', { article: article, userName: userName });
    }

})

router.put('/change',  async (req, res) => {

    try {
        const id1 = req.cookies.update_id ;
        const sanitizedHtml =  dompurify.sanitize(marked(req.body.markdown ));
        const result = await Article.updateOne({ _id: id1 }, {
            $set: {
                title: req.body.title,
                discription: req.body.discription,
                markdown: req.body.markdown,
                sanitizedHtml : sanitizedHtml
            }
        });
     
        const art = await Article.findById(id1);  
        res.clearCookie("update_id");
        // res.redirect('/');
        res.render('article/show.ejs', { article: art });
    }
    catch (e) {
        console.log(e);
    }

})

router.delete('/:id', async (req, res) => {
    await Article.findByIdAndDelete(req.params.id)
    res.redirect('/')
})


module.exports = router;