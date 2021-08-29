require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

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
    }]
    
  });


  regSchema.methods.generateAuthToken = async function(){
      try {
          const token = jwt.sign({_id : this._id} , process.env.SECRET_KEY);
        //   console.log(token);
        this.tokens = this.tokens.concat({token : token});
       const temp =  await this.save();
        return token;
      } catch (error) {
        //   res.send("some error in generateAuthToken" );
        console.log(error);
      }
  }

  regSchema.pre("save" , async function(next){
      if(this.isModified("password")){
        //   const passwordHash = await bcrypt.hash(password , 10)
        this.password = await bcrypt.hash(this.password , 10);
      }
  })
  

  module.exports = mongoose.model('Reg' , regSchema);
