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
                    const json_data = JSON.parse(JSON.stringify(row.word_json));
                    this.list.push(json_data); //hack

                }
        });
        }
    }

    addWord(word) {
        this.list.push(word);
    }

}

module.exports = WordList;