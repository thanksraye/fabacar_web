var mongoose = require('mongoose')
var bcrypt = require("bcryptjs");
const uniqueValidator = require("mongoose-unique-validator");

var ReportSchema = mongoose.Schema({
    reportNum:{
        type:String,
        required:true
    },
    reportType:{
        type:String,
        required:true
    },
    user:String,
    createAt:{
        type:Date,
        default:Date.now
    },
    barcode: String,
    contexReport: String,
    status:String
})




var Report = mongoose.model("Report" , ReportSchema)
module.exports = Report;