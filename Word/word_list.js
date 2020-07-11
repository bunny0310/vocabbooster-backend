const {connection} = require("../config");
const Word = require("./word");

class WordList 
{
    constructor(fetch) {
        this.list = [];
        // if(fetch) 
        // {
        //     connection.query("SELECT word_json FROM words", (err,rows,fields)=>{
        //         if(err)throw err;
        //         for(let row of rows)
        //         {
        //             const parsed_string = JSON.parse(row.word_json);
        //             const word = new Word({
        //                 name: parsed_string.name,
        //                 meaning: parsed_string.meaning,
        //                 sentence: parsed_string.sentence,
        //                 tags: parsed_string.tags,
        //                 synonyms: parsed_string.synonyms,
        //                 types: parsed_string.types
        //             });
        //             this.addWord(word); //hack

        //         }
        // });
        // }
    }

    addWord(word) {
        this.list.push(word);
    }

}

module.exports = WordList;