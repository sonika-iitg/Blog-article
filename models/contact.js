require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const regSchema = new mongoose.Schema({
    email :{
        required : true,
        type : String,
    },
    query :{
        type : String,
        required : true,
        // unique : true
    },
    // member :{
    //     required:true,
    //     type : String
    // },
    elaborate :{
        
        type : String
    },
    

    
  });


  module.exports = mongoose.model('contact' , regSchema);
