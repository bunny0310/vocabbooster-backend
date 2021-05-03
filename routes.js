const express = require("express");
const app = express.Router();
const {Word, addWord} = require("./models/word");
const parseJson = require('parse-json');
const {User} = require("./models/user");
const {generateWords, shuffle} = require("./util");
const request = require("request");
const jwt = require('jsonwebtoken');
const {verify} = require("./middleware");
const {
    getTags,
    checkWordDuplicate,
    getWords,
    getWord
} = require("./controller");

//authentication
app.post('/api/login', function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    User.find({username, password},
        (err, rows)=>{
            if(err) {
                return res.status(500).json({
                    status: false,
                    msg: "internal server error"
                });
            }
            if (rows.length != 1) {
                return res.status(401).json({
                    status: false,
                    msg: "Unauthorized"
                })
            }
            const payload = {
                id: rows[0]._id,
                name: `${rows[0].firstName} ${rows[0].lastName}`,
                username: rows[0].username
            }

            const token = jwt.sign(payload, 'secret1234', {
                algorithm: "HS256",
                expiresIn: 7200
            });
            return res.status(201).json({
                token: token,
                status: true,
                msg: "Logged in!"
            });
        });
})

app.post('/api/register', (req,res)=>{
    if(req.body.username==='' || req.body.password==='' || req.body.firstName === '' || req.body.lastName === '' || req.body.email === '')
        return res.status(400).json({"error": "null values found"});

    const user = new User(req.body);
    // O(1) time complexity, communicating with the database
    user.save((err=>{
        if(err)
            return res.status(500).json({"msg": err});
        return res.status(200).json({"message": "user added!"});
    }))
    
 });

 app.get('/logout', function (req, res) {
    req.logout();
    req.session.destroy();
    return res.status(200).json({"message": "logged out"});
});

app.get('/isLoggedIn', (req, res) => {
    console.log('is logged in working!');
    return res.status(200).json({"message": "logged in!"});
});


//get words
app.post('/api/words', verify, (req,res,next)=>{
    if(req.body.username === '')return res.status(400).json({"error": "bad request"});
    // random and sort parameters
    const random = req.body.random;
    const sort = req.body.sort;

    // O(n + m) time complexity
    generateWords({username: req.body.username , random, userId: req.user.id})
    .then(result => {
        // O(mlogm)
        result = sort ? result.sort((a, b) => {return b.createdAt - a.createdAt}) : result
        return res.status(200).json({data: result, size: result.length});
    })
    .catch(err => {
        console.log(err);
    })
});

//search for words v2
app.post('/api/search', verify, (req, res, next) => {
    const username = req.body.username;
    const random = req.body.random;
    const sort = req.body.sort;
    if(username === undefined || username === '') {
        return res.status(400).json({"message": "incorrect JSON, username missing"});
    }

    const options = req.body.options;
    if(options === undefined) {
        return res.status(400).json({"message": "incorrect JSON, options missing"});
    }   
    Word.find(
    {tags: {$regex: '.*' + options.tag + '.*', $options: 'i'}, 
        name: {$regex: '.*' + options.name + '.*', $options: 'i'}, 
    meaning: {$regex: '.*' + options.meaning + '.*', $options: 'i'}, 
    synonyms: {$regex: '.*' + options.synonym + '.*', $options: 'i'},
    types: {$regex: '.*' + options.type + '.*', $options: 'i'},
    sentences: {$regex: '.*' + options.sentence + '.*', $options: 'i'},
    user: req.user.id}, 
    (err, docs)=>{
        result = sort ? docs.sort((a, b) => {return b.createdAt - a.createdAt}) : docs
        return res.status(200).json({data: random === true ? shuffle(result) : result, size: docs.length});
    })
})

//add word
app.post('/api/add-word', verify, (req,res)=>{
    let word = req.body.word;
    const username = req.body.username;
    word=parseJson(word);
    addWord(word, req.user.id)
    .then((data) => {
        return res.status(data.code).json(data.json);
    }).catch((err) => {
        console.log(err);
        return res.status(err.code).json(err.json);
    })
});

//get random words
app.post('/api/random-words', verify, (req,res)=>{
    const username = req.body.username;
    if(username === undefined || username === '') {
        return res.status(400).json({"message": "incorrect JSON, username missing"});
    }
    generateWords({username, random: true, userId: req.user.id})
    .then(result => {
        return res.status(200).json({data: result});
    })
    .catch(err => {
        console.log(err);
    })
})

app.post('/api/wordcloud', (req, res) => {
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

app.post('/api/acc-info', verify, (req, res) => {
    const username = req.user.username;
    if(username === undefined || username === '') {
        return res.status(400).json({"message": "incorrect JSON, username missing"});
    }
    const recent = req.body.recent;
    const json = {
        "username": req.user.username
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

app.post('/api/topmost-tags', verify, (req, res) => {
    const username = req.user.username;
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

//route to get a list of unique tags
app.get('/api/tags', verify, (req, res) => {
    getTags(req.user.id, req.query["keyword"])
    .then((data) => {
        return res.status(data.code).json(data.json);
    })
    .catch((err) => {
        return res.status(err.code).json(err.json);
    });
})

//route to check if a word already exists
app.get('/api/uniqueName', verify, (req, res) => {
    const name = req.query["name"];
    checkWordDuplicate(req.user.id, name)
    .then((data)=> {
        return res.status(data.code).json(data.json);
    })
    .catch((err) => {
        return res.status(err.code).json(err.json); 
    })
})

app.get('/api/words', verify, (req, res) => {
    getWords(req.user.id, req.query['mode'], {
        name: req.query['filterName'],
        meaning: req.query['filterMeaning'],
        sentence: req.query['filterSentence'],
        tag: req.query['filterTag'],
        synonym: req.query['filterSynonym'],
        type: req.query['filterType']
    }, req.query['offset'] == null ? 0 : req.query['offset'])
    .then((data) => {
        return res.status(data.code).json(data.json);
    })
    .catch((err) => {
        return res.status(err.code).json(err.json);
    })
})

app.get('/api/words/:id', verify, (req, res) => {
    getWord(req.user.id, req.params['id'])
    .then((data) => {
        return res.status(data.code).json(data.json);
    })
    .catch((err) => {
        return res.status(err.code).json(err.json);
    })

})

module.exports = app;