const express = require("express");
const cors = require("cors");
const body_parser = require("body-parser");
const mysql = require("mysql");
const path = require("path");
const Word = require("./Word/word");
const Wordlist = require("./Word/word_list");
const PORT = process.env.PORT||3000;
const {connection} = require("./config");

const app = express();
const wordlist = new Wordlist(true);
const random_words = new Wordlist();

app.use(cors());
app.use(body_parser.json())
app.use(express.static(path.join(__dirname,'/public')));

//wordlist.list.push(new Word({name: 'grotesque', type: ['noun'], meaning: 'comically or repulsively distorted or ugly', synonyms: ['disfigured']}));

app.get('/api/words', (req,res)=>{
        asyncQueryMethod("SELECT word_json FROM words").then(rows=>{
            for(let row of rows)
            {
                wordlist.addWord(JSON.parse(row.word_json));
            }
            console.log(rows);
            return res.status(200).json({data: wordlist.list});
        });
});
app.post('/api/add-word', (req,res)=>{
    const word = req.body.word;
    wordlist.addWord(word);
    const word_json = JSON.stringify(word).replace(/[\/\(\)\']/g, "\\$&");
    asyncQueryMethod("INSERT INTO words (word_json) VALUES ('"+word_json+"')");
    return res.status(200).json({"word added!":"awesome"});
});

app.get('/api/random-words', (req,res)=>{
    random_words.list = [];
    asyncQueryMethod("SELECT word_json FROM words ORDER BY RAND() LIMIT 5").then(rows=>{
        for(let row of rows)
        {
            random_words.addWord(JSON.parse(row.word_json));
        }
        return res.status(200).json({data: random_words.list});    
    });
})

const asyncQueryMethod = async (query)=>{
    try {
        const result = await connection.query(query);
        return result;
    } catch(err){
        console.log(err);
    }
}

const saveAsync = async ()=>{
    const r = await asyncQueryMethod();
    return r;
};

app.listen(PORT, ()=>{
    console.log("Running on port ", PORT);
});