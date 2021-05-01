const {mongoose_connection} = require("../config");
const {User} = require("../models/user");
const {wordNamesCache} = require("../init");

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

const addWord = async (obj, userId) => {
    try {
        const name = obj.name;
        const meaning = obj.meaning;
        const sentences = obj.sentence;
        const types = obj.types;
        const tags = obj.tags;
        const synonyms = obj.synonyms;
        const word = new Word({name, meaning, sentences, tags, types, synonyms});
        word.user = userId;
        word.save();
        const user = await User.findOne({_id: userId});
        const words = user.words;
        words.push(word._id);
        User.updateOne({_id: userId}, {words});

        // update the cache
        const set = wordNamesCache.get(userId);
        if(set != -1) {
            set.add(word.name);
        }
        return {
            code: 200,
            json: {
                msg: "Word added!",
                status: true
            }
        }
    } catch(err) {
        return {
            code: 500,
            json: {
                msg: `Internal Server Error - ${err}`,
                status: false
            }
        }
    }
}

module.exports = {addWord, Word};