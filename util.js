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

const getWordByName = async (username, name) => {
    const user = await User.findOne({username});
    const id = user._id;
    const word = await Word.findOne({name: {$regex: '.*' + name + '.*', $options: 'i'}, user: id});
    return word;
}

module.exports = {asyncQueryMethod, generateWords, getWordByName};