const {connection} = require("./config");
const {User} = require("./models/user");
const {Word} = require("./models/word");
const asyncQueryMethod = async (query)=>{
    try {
        const result = await connection.query(query);
        return result;
    } catch(err){
        console.log(err);
    }
}

const generateWords = async ({username, random}) => {
    const user = await User.findOne({username}).populate('words');
    const words = user.words;
    if(random) {
        for(let i = 0; i < words.length; ++i) {
            const idx = Math.floor(Math.random() * (words.length - i) + i);
            const temp = words[i];
            words[i] = words[idx];
            words[idx] = temp;
        }
        return words.slice(0, 5);
    }
    return words;
};

const getWordByName = (username, name) => {
    User.findOne({username})
    .exec((err, user) => {
        const id = user._id;
        Word.findOne({user: id, name}, (err, word)=>{
            return word;
        })
    });
    return null;
}

module.exports = {asyncQueryMethod, generateWords, getWordByName};