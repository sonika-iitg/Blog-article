require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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
    },
    tokens :[{
        token :{
            type : String,
            required : true
        }
    }],
    isVerified:{
        type : Boolean
    },
    emailToken:{
        type : String
    }

    
  });


  module.exports = mongoose.model('temp' , regSchema);
