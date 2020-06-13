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
const wordlist = new Wordlist();

app.use(cors());
app.use(body_parser.json())
app.use(express.static(path.join(__dirname,'/public')));

//wordlist.list.push(new Word({name: 'grotesque', type: ['noun'], meaning: 'comically or repulsively distorted or ugly', synonyms: ['disfigured']}));

app.get('/api/words', (req,res)=>{
    connection.query("SELECT word_json FROM words", (err,rows,fields)=>{
        if(err)throw err;
        console.log(rows);
        for(let row of rows)
        {
            console.log(row.word_json);
            wordlist.addWord(JSON.parse(row.word_json));

        }
    });
    return res.status(200).json({data: wordlist.list});
});
app.post('/api/add-word', (req,res)=>{
    const word = req.body.word;
    wordlist.addWord(word);
    const word_json = JSON.stringify(word).replace(/[\/\(\)\']/g, "\\$&");
    connection.query("INSERT INTO words (word_json) VALUES ('"+word_json+"')", (err,rows,fields)=>{
        if(err)throw err;
    });
    return res.status(200).json({"word added!":"awesome"});
});



app.listen(PORT, ()=>{
    console.log("Running on port ", PORT);
});