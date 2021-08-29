const mongoose = require('mongoose');
// const { default: slugify } = require('slugify');
const slugify = require('slugify');
const marked = require('marked');
const creatDomPurify = require('dompurify');
const {JSDOM} = require('jsdom');
const dompurify = creatDomPurify(new JSDOM().window);

const articalSchema = new mongoose.Schema({
    title :{
        required : true,
        type : String
    },
    discription :{
        type : String
    },
    markdown :{
        required:true,
        type : String
    },
    creatAt :{
        type : Date,
        default : Date.now
    },
    slug :{
        type : String,
        required : true,
        unique : true

    } , 
    userName :{
       type : String,
       required : true,
       
    },

    sanitizedHtml :{
         type : String ,
         required : true
    }
  });

  articalSchema.pre('validate' , function(next){
      if(this.title){
          this.slug = slugify(this.title , {lower:true , strict:true})

      }
      
       if(this.markdown){
          this.sanitizedHtml =  dompurify.sanitize(marked(this.markdown ));  
       }

      next();
  })

  module.exports = mongoose.model('Article' , articalSchema);
