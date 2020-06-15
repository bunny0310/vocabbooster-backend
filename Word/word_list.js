const {connection} = require("../config");
const Word = require("./word");

class WordList 
{
    constructor(fetch) {
        this.list = [];
        if(fetch) 
        {
            connection.query("SELECT word_json FROM words", (err,rows,fields)=>{
                if(err)throw err;
                for(let row of rows)
                {
                    const word = JSON.parse(row.word_json);
                    this.addWord(word); //hack

                }
        });
        }
    }

    addWord(word) {
        this.list.push(word);
    }

}

module.exports = WordList;