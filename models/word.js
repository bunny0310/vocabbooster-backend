const {mongoose_connection} = require("../config");
const {User} = require("../models/user");

const mongoose = mongoose_connection();

const schema = new mongoose.Schema({
    name: String,
    meaning: String,
    tags: [],
    sentences: [],
    types: [],
    synonyms: [],
    createdAt: {type: Date, default: Date.now()},
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

const Word = new mongoose.model('Word', schema);
// const name = "spinter";
// const word = new Word({name, meaning: 'break into tiny fragments, shatter'});

// console.log(word);

const addWord = (obj, username) => {
    const name = obj.name;
    const meaning = obj.meaning;
    const sentences = obj.sentence;
    const types = obj.types;
    const tags = obj.tags;
    const synonyms = obj.synonyms;
    const word = new Word({name, meaning, sentences, tags, types, synonyms});
    User.findOne({username}, (err, docs)=>{
        const id = docs._id;
        word.user = id;
        word.save((err=>{
            console.log(err);
        }))
        console.log(word);
    });
    User.findOne({username}, (err, user)=>{
        const words = user.words;
        words.push(word._id);
        User.updateOne({username}, {words}, (err, res)=>{
            console.log(res);
        });
    })
}

module.exports = {addWord, Word};