const { cache } = require('ejs');
const express = require('express');
const Article = require('../models/article');

const router = express.Router();

router.get('/new' , (req , res)=>{
    res.render('article/new.ejs' , {article : new Article()})
});

router.get('/signIn' , (req , res)=>{
    res.render('article/signIn.ejs' , {article : new Article()})
});

router.get('/yourArticle' , async  (req , res)=>{
    const article = await Article.find().sort({ creatAt: 'desc' });;
    // if(article==null)
    //    res.send("Nothing");  
    res.render('article/yourArticle.ejs' , {articles : article});
});

// router.get('/edit/:id' ,async (req , res)=>{
//    const article =  await Article.findById('req.parms.id')
//     res.render('article/edit.ejs' , {article : article})
// });

router.get('/:slug' , async (req , res)=>{
    
    const article = await  Article.findOne({slug : req.params.slug});
    if(article==null)
       res.redirect('/');  
    res.render('article/show.ejs' , {article: article});
})


router.post('/' ,async (req , res)=>{
    let article = new Article({
         title : req.body.title ,
         discription : req.body.discription,
         markdown : req.body.markdown
    })

    try{
        article = await article.save()
        res.redirect(`/article/${article.slug}`)

    }
    catch(e) {
        res.render('article/new' , {article : article});
    }

})



router.delete('/:id', async (req, res) => {
    await Article.findByIdAndDelete(req.params.id)
    res.redirect('/')
  })


module.exports = router;