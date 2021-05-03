const  WordList = require("./Word/word_list");
const {asyncQueryMethod} = require("./util");
const parseJson = require('parse-json');
const {mongoose_connection} = require("./config");
const {addWord, Word} = require("./models/word");
const {User} = require("./models/user");

const mongoose = mongoose_connection();

//  const test = async () => {
//      const res = await Word.deleteOne({name: 'Preoccupy'});
//      console.log(res);
//  }

//  test();

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

// Word.find({name: 'right up my alley'}, (err, docs)=>{
//     console.log(docs);
// })

