var express = require('express')
var router = express.Router()
var User = require('../models/user')
var Report = require('../models/report')
var path = require('path')
var fs = require('fs')
var blockQuery = require('../util')

// Authentication Middleware
const loggedInOnly = (req, res, next) => {
    if (req.isAuthenticated()) next();
    else res.redirect("/login");
  };
  
  const loggedOutOnly = (req, res, next) => {
    if (req.isUnauthenticated()) next();
    else res.redirect("/");
  };


function authenticate(passport) {

 //템플릿용 변수 설정
 router.use(function(req,res,next){
    res.locals.currentUser = req.user;
    console.log(res.locals.currentUser)
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    next();
  });

router.get('/' ,loggedInOnly,  async (req, res)=>{
    var data = await blockQuery.queryAllData()
    var resData = await JSON.parse(data)
    // await console.log(data)
    await console.log(resData[0])
    res.render('index2' , {data:resData})
})

router.get("/findreport", loggedInOnly, async (req, res) => {
  var data = await blockQuery.queryAllData()
  var resData = await JSON.parse(data)

  console.log(resData)
  res.render("find_report" ,{data:resData,user:Request.username});
});
    
    // Login View
  router.get("/login", loggedOutOnly, (req, res) => {
    res.render("login");
  });

   // Login Handler
   router.post("/login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true
    })
  );

  //
  router.get("/createreport", loggedInOnly, async (req, res) => {
    var data = await blockQuery.queryAllData()
    var resData = await JSON.parse(data)
   console.log("data")
    console.log(resData)
    res.render("create_report" ,{data:resData});
  });

  

  router.post("/createreport" ,loggedInOnly, async (req, res) => {
    
    var report_id       = req.body.report_id
    var report_type     = req.body.report_type
    var user_name       = req.body.user_name 
    var user_email      = req.body.user_email 
    var user_phonenumber= req.body.user_phonenumber 
    var barcode         = req.body.barcode
    var context_report  = req.body.context_report
    var timestamp       = req.body.timestamp

   var contact        = new Report()
   contact.reportNum = report_id
   contact.reportType = report_type
   contact.user = user_name
   contact.barcode = barcode
   contact.contexReport = context_report
   contact.status = "1"

   await contact.save((err, result)=>{
        if(err){
            console.log(err)
        }
        console.log(result)
   })
   //reportid, username, phonenumber, email, barcode, timestamp, content, type
    await blockQuery.createReports(report_id, user_name, user_email,user_phonenumber,barcode, context_report, timestamp, report_type)
    await res.redirect('/') 
})

router.get("/signup",loggedOutOnly, function(req, res){
    res.render("signup", {message:"true"})
})


router.post("/signup",function(req,res,next){
    var username = req.body.username;
     var email =  req.body.email
    var password = req.body.password;
    User.findOne({username:username},function(err,user){
      if(err){return next(err);}
      if(user){
        req.flash("error","사용자가 이미 있습니다.");
        return res.render("signup" , {message:"false"});
      }
      User.create({ username,email, password })
      .then(user => {
        req.login(user, err => {
          if (err) next(err);
          else res.redirect("/");
        });
      })
      .catch(err => {
        if (err.name === "ValidationError") {
          req.flash("Sorry, that username is already taken.");
          res.redirect("/signup");
        } else next(err);
      });
    });
  });

  
  

    router.get('/data',clearInterval, async (req, res)=>{
        var data = await blockQuery.queryAllData()
        // var resDataUser = await JSON.parse(data[0])
        var resDataReport = await JSON.parse(data)
        // await console.log(data)
        await console.log(resDataReport[0].Key)
        res.send(resDataReport)
    })
    
    router.get("/validatereport/:report", loggedInOnly, async (req, res) => {
        console.log(req.params.report)
        var reportnum = req.params.report
        var data = await blockQuery.queryAllData()
        var resData = await JSON.parse(data)
       console.log("data")
        console.log(resData)
        res.render("validate_report" ,{data:resData, reportnum: reportnum});
      });
    
    router.post('/validatereport/:report', loggedInOnly , async (req, res)=>{
        var reportNum = req.body.reportNum
        // var reportNum = 'REPORT'+req.params.report;
        var status = req.body.status
        //console.log(reportNum)
        await blockQuery.validateReport(reportNum , status)

        await console.log("Success")
        await res.redirect("/")
    
    })
    
    router.post('/changeowner',loggedInOnly,  async (req, res)=>{
        var key = req.body.key;
        var buyer = req.body.buyer
        var result = await blockQuery.query_all_car();
        console.log(result)
        if (result == "No Data") {
            res.send("No Data Key")
        } else {
            
            await blockQuery.changeCars(key , buyer)
            await console.log("Success")
            await res.render("Sucess input data in BlockCh")
        }
    
        
    
    })

    // Logout Handler
router.all("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
  });

    // Error Handler
router.use((err, req, res) => {
    console.error(err.stack);
    // res.status(500).end(err.stack);
  });

return router;
}


module.exports = authenticate;