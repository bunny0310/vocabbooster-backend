const {connection} = require("../config");

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
                    this.list.push(JSON.parse(row.word_json));

                }
        });
        }
    }

    addWord(word) {
        this.list.push(word);
    }

}

module.exports = WordList;