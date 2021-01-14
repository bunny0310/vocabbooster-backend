const  WordList = require("./Word/word_list");
const {asyncQueryMethod} = require("./util");
const parseJson = require('parse-json');
const {mongoose_connection} = require("./config");
const {addWord, Word} = require("./models/word");
const {User} = require("./models/user");

const mongoose = mongoose_connection();

// asyncQueryMethod("SELECT * from words")
// .then(rows => {
//     for(let row of rows) {
//         addWord(parseJson(row.word_json), row.username);
//     }
// })
// .catch(err => {
//     console.log(err);
// })

// User.findOne({username: 'ishkhur'}).populate('words').exec((err, docs)=>{
//     console.log(docs.words[docs.words.length - 1]);
// })
// Word.find({}, (err, docs)=>{
//     for(let word of docs) {
//         const synonyms = word.sentences;
//         const tagsNew = [];
//         for(let tag of synonyms) {
//             tagsNew.push(tag.tag);
//         }
//         Word.updateOne({_id: word.id}, {sentences: tagsNew}, (err, msg)=>{
//             console.log(msg);
//         })
//     }
// })

const limit = 5;
const offset = 0;
Word.find({}, (err, docs)=>{
    console.log(docs.slice(offset, offset + limit));
})


