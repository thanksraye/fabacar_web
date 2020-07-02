var mongoose = require('mongoose')
var bcrypt = require("bcryptjs");
const uniqueValidator = require("mongoose-unique-validator");

var UserSchema = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    passwordHash:{
        type:String,
        required:true
    },
    email:String,
    createAt:{
        type:Date,
        default:Date.now
    },
    diplayName: String,
    bio: String
})



UserSchema.plugin(uniqueValidator);

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};


// UserSchema.pre('save', function (value){
    
//       return this.passwordHash = bcrypt.hashSync(value);
      
//  } );
  
UserSchema.virtual("password").set(function(value) {
  this.passwordHash = bcrypt.hashSync(value, 12);
});

var User = mongoose.model("User" , UserSchema)
module.exports = User;