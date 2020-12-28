const express = require("express");
const cors = require("cors");
const body_parser = require("body-parser");
const parseJson = require('parse-json');
const mysql = require("mysql");
const sha256 = require("sha256");
const passport =require("passport");
const localStrategy =require("passport-local").Strategy;
const path = require("path");
const Word = require("./Word/word");
const Wordlist = require("./Word/word_list");
const Friends = require("./Graph/friends");
const PORT = process.env.PORT||3000;
const {asyncQueryMethod} = require("./util");
const Graph = require("./Graph");
const {getAdjLists} = require("./util");
const session = require("express-session");
const request = require("request");

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

passport.use(new localStrategy((username,password,done)=>{
    asyncQueryMethod("SELECT * FROM users WHERE username = '"+username+"' AND password = '"+sha256(password)+"'")
    .then(rows=>{
        console.log(password);
        if(rows.length!==1)return done(null, false, {
            "message": "incorrect credentials"
        });
        const row = rows[0];
        console.log(row);
        return done(null,username);
    });

}))

const isLoggedIn = (req, res, next) => {
    console.log(req.isAuthenticated());
    console.log(req.session);
    if(req.isAuthenticated()){
        return next()
    }
    return res.status(401).json({"statusCode" : "401", "message" : "not authenticated"})
}

let graph = new Friends();

//get words
app.post('/api/words', isLoggedIn, (req,res,next)=>{
        if(req.body.username === '')return res.status(400).json({"error": "bad request"});
        wordlist.list = [];
        asyncQueryMethod("SELECT word_json FROM words").then(rows=>{
            for(let row of rows)
            {
                const word = parseJson(row.word_json);
                wordlist.addWord(word); //hack
            }
            wordlist.list.sort((a,b)=>{
                return a.name.localeCompare(b.name);
            })
            return res.status(200).json({data: wordlist.list});
        }).catch((error)=>{
            console.log(error);
        });
});

//search for words 
app.post('/api/search-words', isLoggedIn, (req,res,next)=>{
    if(req.body.username === '')return res.status(400).json({"error": "bad request"});
    const type = req.body.type;
    const keyword = req.body.keyword;
    filtered_words.list = [];
    asyncQueryMethod("SELECT word_json FROM words").then(rows=>{
        for(let row of rows)
        {
            try {
                const word = JSON.parse(row.word_json);
                const regex = new RegExp(keyword, 'gi');
                switch(type) {
                    case 'Name':
                        if(word.name.match(regex))
                        {
                            console.log(word.name.indexOf(keyword));
                            filtered_words.addWord(word);
                        }
                    break;
                
                    case 'Tags':
                        for(let tag of word.tags) {
                            if(tag.tag.match(regex))
                            {
                                filtered_words.addWord(word);
                            }
                        }
                    break;
                    
                    case 'Meaning':
                        if(word.meaning.match(regex))
                        {
                            filtered_words.addWord(word);
                        }
                    break;

                    case 'Synonyms':
                        for(let synonym of word.synonyms) {
                            if(synonym.tag.match(regex))
                            {
                                filtered_words.addWord(word);
                            }
                        }
                    break;

                    case '':
                        if(
                        word.name.match(regex) || 
                        word.meaning.match(regex) 
                        ) 
                        filtered_words.addWord(word);
                        else {
                            for(let tag of word.tags) {
                                if(tag.tag.match(regex))
                                    filtered_words.addWord(word);
                            }
                            for(let synonym of word.synonyms) {
                                if(synonym.tag.match(regex))
                                    filtered_words.addWord(word);
                            }
                        }
                    break;
                    }
            } catch (err) {
                console.log(err, row.word_json);
            }
        } 
        filtered_words.list.sort((a,b)=>{
            return a.name.localeCompare(b.name);
        })
        return res.status(200).json({data: filtered_words.list});
    }).catch((error)=>{
        console.log(error);
    });   

});

//add word
app.post('/api/add-word', (req,res)=>{
    let word = req.body.word;
    word=parseJson(word);
    console.log(typeof word);
    const word_main = new Word({
        name: word.name,
        meaning: word.meaning,
        sentence: word.sentence,
        tags: word.tags,
        synonyms: word.synonyms,
        types: word.types
    });
    //console.log(word_main);
    wordlist.addWord(word_main);
    const word_json = JSON.stringify(word_main);
    asyncQueryMethod("INSERT INTO words (word_json, username) VALUES ('"+word_json+"', '"+req.body.username+"')").catch((error)=>{
      console.log(error);
    });
    return res.status(200).json({"word added!":"awesome"});
});

//get random words
app.post('/api/random-words', isLoggedIn, (req,res)=>{
    random_words.list = [];
    console.log(req.connection.remoteAddress);
    if(req.body.username === '')return res.status(400).json({"error": "bad request"});
    asyncQueryMethod("SELECT word_json FROM words WHERE username = '"+req.body.username+"' ORDER BY RAND() LIMIT 5").then(rows=>{
        for(let row of rows)
        {
            const word = parseJson(row.word_json);
            random_words.addWord(word); //hack
        }
        return res.status(200).json({data: random_words.list});    
    }).catch((error)=>{
        console.log(error);
    });
})

app.post('/api/get-friends', (req,res)=>{
    if(req.body.username === '' || req.body.username === undefined)return res.status(400).json({"error": "bad request"});
    try {
        getAdjLists().then((str)=>{
            graph.adjLists = Graph.Deserialize({str});
            let number = graph.getNumberFriends(req.body.username);
            console.log(number); 
            return res.status(200).json({"number": number});
        }).catch((err)=>{
            return res.status(422).json({"error": err});
        })
        
    }catch(err) {
        return res.status(422).json({"error": err});
    }
    // populateFriendsGraph(graph)
    // .then((pg)=>{
    //     graph = pg;
    //     return res.status(200).json({graph});
    // })
});


//authentication

const auth = () => {
    return (req, res, next) => {
        passport.authenticate('local', (error, user, info) => {
            if(error) res.status(401).json({"statusCode" : 401 ,"message" : error});
            req.login(user, function(error) {
                if (error) return next(error);
                next();
            });
        })(req, res, next);
    }
}

passport.serializeUser(function(user, done) {
    if(user) done(null, user);
});
  
passport.deserializeUser(function(id, done) {
    done(null, id);
});

app.post('/api/login', auth(), (req,res,next)=>{
    req.session.save();
   return res.status(200).json({"username":req.body.username});
});

app.post('/api/register', (req,res)=>{
    if(req.body.username==='' || req.body.password==='')
        return res.status(400).json({"error": "null values found"});
    const query = "INSERT INTO users (username,password) VALUES ('"+req.body.username+"', '"+sha256(req.body.password)+"')";
    asyncQueryMethod(query).catch((error)=>console.log(error));
    return res.status(200).json({"message": "user added!"});
 });
 app.get('/logout', isLoggedIn,  function (req, res) {
    req.logout();
    req.session.destroy();
    return res.status(200).json({"message": "logged out"});
});

app.get('/isLoggedIn', (req, res) => {
    return res.status(200).json({"status": req.isAuthenticated()});
});




//listen 
app.listen(PORT, ()=>{
    console.log("Running on port ", PORT);
});
