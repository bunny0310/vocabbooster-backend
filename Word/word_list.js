const {connection} = require("../config");

class WordList 
{
    constructor() {
        this.list = [];
        connection.query("SELECT word_json FROM words", (err,rows,fields)=>{
            if(err)throw err;
            console.log(rows);
            for(let row of rows)
            {
                console.log(row.word_json);
                this.list.push(JSON.parse(row.word_json));

            }
        });
    }

    addWord(word) {
        this.list.push(word);
    }

}

module.exports = WordList;