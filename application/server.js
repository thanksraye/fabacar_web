var express = require('express')
var shell = require('shelljs')
var bodyParser = require('body-parser')
var passport = require("passport");
var User = require('./models/user');
var app = express()
require('ejs')
var path = require('path')
var fs = require('fs')
var blockRouter = require('./routes/blockRouter')

var flash = require("express-flash-messages");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var dotenv = require('dotenv')
var mongoose = require(`mongoose`)
mongoose.Promise = global.Promise
var blockQuery = require('./util')

app.use(express.static(__dirname + '/public'))
// var bodyParser = require('body-parser')
app.use(flash());

dotenv.config()
app.set('views' , path.resolve(__dirname ,'views'))
app.set('view engine' , 'ejs')

var password = process.env.PASSWORD
const MONGO_URL = `mongodb+srv://root:1234@cluster0-om3w6.mongodb.net/my_db_1?retryWrites=true&w=majority`

mongoose.connect(MONGO_URL,{ useNewUrlParser: true,useUnifiedTopology: true  })

app.use(bodyParser.urlencoded({extended:true}))//for parsing application/x-www-form-urlenconded
app.use(bodyParser.json())//for parsing application/json
app.use(session({
    secret:"TKRvOIJs=HyqrvagQ#&!f!%V]Ww/4KiVs$s,<<MX",//임의의 문자
    resave:true,
    saveUninitialized:true
  }));

  // Passport
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
done(null, user._id);
});

passport.deserializeUser(function(userId, done) {
User.findById(userId, (err, user) => done(err, user));
});

// Passport Local
const LocalStrategy = require("passport-local").Strategy;
const local = new LocalStrategy((username, password, done) => {
User.findOne({ username })
    .then(user => {
    if (!user || !user.validPassword(password)) {
        done(null, false, { message: "Invalid username/password" });
    } else {
        done(null, user);
    }
    })
    .catch(e => done(e));
});
passport.use("local", local);

app.use('/', blockRouter(passport))



// const networkRun = ()=>{
//     if(shell.exec('ls -la').code !== 0) {
//         shell.echo('Error: command failed')
//         shell.exit(1)
//       }
//     cmd = 'cd fabcar && ./startFabric.sh'
//     shell.exec(cmd, (err , stdout, stderr)=>{
//         if(err) {
//             console.log(err)
//         } else {
//             console.log(stdout)
//         }
//     })  
      
//     // shell.exit(1)
    
// }
// networkRun()

app.listen(8080 , async ()=>{
    await console.log("Server is Starting at http://localhost:8080")
})
