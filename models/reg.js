const mongoose = require('mongoose');


const regSchema = new mongoose.Schema({
    email :{
        required : true,
        type : String,
        unique : true
    },
    userName :{
        type : String,
        required : true,
        unique : true
    },
    password :{
        required:true,
        type : String
    }
    
  });

  module.exports = mongoose.model('Reg' , regSchema);
