const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
   
    userName :{
        type : String,
       
    }
    
  });

  module.exports = mongoose.model('user' , userSchema);
