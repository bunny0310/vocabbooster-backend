const express = require("express");
const cors = require("cors");
//npm packages
const body_parser = require("body-parser");
const parseJson = require('parse-json');
const mysql = require("mysql");
const sha256 = require("sha256");
const passport =require("passport");
const localStrategy =require("passport-local").Strategy;
const path = require("path");
const PORT = process.env.PORT||3000;
const session = require("express-session");
const request = require("request");
const passportJWT = require('passport-jwt');
const ExtractJWT = require('passport-jwt').ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const jwt = require('jsonwebtoken');

//custom modules
const {Word, addWord} = require("./models/word");
const {User} = require("./models/user");
const {generateWords, getWordByName, getWords} = require("./util");
const Wordlist = require("./Word/word_list");

const app = express();
const wordlist = new Wordlist(true);
const random_words = new Wordlist();
const filtered_words = new Wordlist();

const url_prod = 'https://vocab-booster-ui.herokuapp.com,';
const validOrigins = [
];

app.use(cors({
    origin: (origin, callback) => {
        if (validOrigins.indexOf(origin) === -1) {
            callback(null, true)
          } else {
            callback(new Error('Not allowed by CORS'))
          }
    },
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization'
  }));

// Origin verification generator
app.use(session({
    secret: 'secrettexthere',
    saveUninitialized: true,      
    resave: true,
    cookie : {
    sameSite: 'none',
    secure: true
  }
}));

app.use(body_parser.json())
app.use(express.static(path.join(__dirname,'/public')));
app.use(passport.initialize());
app.use(passport.session());
app.set('trust proxy', 1);

//set jwt options
var options = {};
options.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
options.secretOrKey = 'secret123'; 

passport.use(new localStrategy((username,password,done)=>{
    User.find({username, password},
    (err, rows)=>{
        if(rows.length !== 1)return done(null, false, {
            "message": "incorrect credentials"
        });
        return done(null,username);
    });
}))

//jwt strategy
passport.use(new JWTStrategy(options, function(jwtPayload, done) {
        console.log(jwtPayload);
        return done(null, jwtPayload);
}))

//authentication
app.post('/api/login', function(req, res, next) {
    passport.authenticate('local', {session: false}, function(err, user, info) {
        
        if (err) { return next(err); }

        if (!user) {
            return res.status(500).json(info.message)
        }
        const payload = {
            username: user
        }
        const options = {
            subject: user,
            expiresIn: 3600
        }
        const token = jwt.sign(payload, 'secret123', options);
        
        res.json({token});

    })(req, res, next);
})

app.post('/api/register', (req,res)=>{
    if(req.body.username==='' || req.body.password==='')
        return res.status(400).json({"error": "null values found"});
    const query = "INSERT INTO users (username,password) VALUES ('"+req.body.username+"', '"+sha256(req.body.password)+"')";
    asyncQueryMethod(query).catch((error)=>console.log(error));
    return res.status(200).json({"message": "user added!"});
 });

 //middleware to verify authentication
const isLoggedIn = passport.authenticate('jwt', { session: false });

 app.get('/logout', isLoggedIn,  function (req, res) {
    req.logout();
    req.session.destroy();
    return res.status(200).json({"message": "logged out"});
});

app.get('/isLoggedIn', isLoggedIn, (req, res) => {
    console.log('is logged in working!');
    return res.status(200).json({"message": "logged in!"});
});

//get words
app.post('/api/words', isLoggedIn, (req,res,next)=>{
    if(req.body.username === '')return res.status(400).json({"error": "bad request"});
    generateWords({username: req.body.username , random: false})
    .then(result => {
        return res.status(200).json({data: result});
    })
    .catch(err => {
        console.log(err);
    })
});

//search for words v2
app.post('/api/search', isLoggedIn, (req, res, next) => {
    const username = req.body.username;
    if(username === undefined || username === '') {
        return res.status(400).json({"message": "incorrect JSON, username missing"});
    }

    const options = req.body.options;
    if(options === undefined) {
        return res.status(400).json({"message": "incorrect JSON, options missing"});
    }    
    if(options.random === true) {
        generateWords({username, random: true})
        .then((results) => {
            return res.status(200).json({data: results});
        })
        .catch((err)=>{
            console.log(err);
        })
    }
     else {
            User.findOne({username}, (err, usr) => {
                const id = usr._id;
                console.log(options.tag);
                Word.find(
                {tags: {$regex: '.*' + options.tag + '.*', $options: 'i'}, 
                 name: {$regex: '.*' + options.name + '.*', $options: 'i'}, 
                meaning: {$regex: '.*' + options.meaning + '.*', $options: 'i'}, 
                synonyms: {$regex: '.*' + options.synonym + '.*', $options: 'i'},
                types: {$regex: '.*' + options.type + '.*', $options: 'i'},
                sentences: {$regex: '.*' + options.sentence + '.*', $options: 'i'},
                user: id}, 
                (err, docs)=>{
                    console.log(docs);
                    return res.status(200).json({data: docs});
                })
            });
     }
    //  return res.status(200).json({data: []});
})

//add word
app.post('/api/add-word', isLoggedIn, (req,res)=>{
    let word = req.body.word;
    const username = req.body.username;
    word=parseJson(word);
    addWord(word, username);
    return res.status(200).json({"word added!":"awesome"});
});

//get random words
app.post('/api/random-words', isLoggedIn, (req,res)=>{
    const username = req.body.username;
    if(username === undefined || username === '') {
        return res.status(400).json({"message": "incorrect JSON, username missing"});
    }
    generateWords({username, random: true})
    .then(result => {
        return res.status(200).json({data: result});
    })
    .catch(err => {
        console.log(err);
    })
})

app.post('/api/wordcloud', isLoggedIn, (req, res) => {
    const username = req.body.username;
    if(username === undefined || username === '') {
        return res.status(400).json({"message": "incorrect JSON, username missing"});
    }
    const options = {
        uri: 'https://vb-dashboard.herokuapp.com/tags',
        method: 'POST',
        json: {
          "username": username
        }
      };
    request.post(options, (err, result, body) => {
        return res.status(200).json({msg: body.msg});
    });
})

app.post('/api/acc-info', isLoggedIn, (req, res) => {
    const username = req.body.username;
    if(username === undefined || username === '') {
        return res.status(400).json({"message": "incorrect JSON, username missing"});
    }
    const recent = req.body.recent;
    const json = {
        "username": username
    }
    if(recent === true) {
        json["recent"] = true;
    }
    const options = {
        uri: 'https://vb-dashboard.herokuapp.com/acc-info',
        method: 'POST',
        json: json
      };

      request.post(options, (err, result, body) => {
        return res.status(200).json({msg: body.msg});
    });
})

app.post('/api/topmost-tags', isLoggedIn, (req, res) => {
    const username = req.body.username;
    if(username === undefined || username === '') {
        return res.status(400).json({"message": "incorrect JSON, username missing"});
    }
    const recent = req.body.recent;
    const json = {
        "username": username
    }
    if(recent === true) {
        json["recent"] = true;
    }
    const options = {
        uri: 'https://vb-dashboard.herokuapp.com/monthly-tags-info',
        method: 'POST',
        json: json
      };

      request.post(options, (err, result, body) => {
        return res.status(200).json({msg: body.msg});
    });
})


//listen 
app.listen(PORT, ()=>{
    console.log("Running on port ", PORT);
});
