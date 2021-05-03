const {connection} = require("./config");
const {User} = require("./models/user");
const {Word} = require("./models/word");
const {
    wordsCache
} = require("./init");
const asyncQueryMethod = async (query)=>{
    try {
        const result = await connection.query(query);
        return result;
    } catch(err){
        console.log(err);
    }
}

// Overall Time Complexity O(m + n)
const generateWords = async ({username, random, userId}) => {
    try {
        let wordsFromCache = wordsCache.get(userId);
        let words = [];
        if(wordsFromCache != -1) {
            console.log('caching');
            words = wordsFromCache;
            delete wordsCache;
        }
        else {
            words = await Word.find({user:userId});
            wordsCache.put(userId, words);
        }
        if(random) {
            // O(n) time complexity
            for(let i = 0; i < words.length; ++i) {
                const idx = Math.floor(Math.random() * (words.length - i) + i);
                const temp = words[i];
                words[i] = words[idx];
                words[idx] = temp;
            }
    
            // O(n) time complexity
            return words.slice(0, 5);
        }
        return words;
    }catch(err){
        console.log(err);
        return null;
    }
};

const shuffle = (words) => {
    for(let i = 0; i < words.length; ++i) {
        const idx = Math.floor(Math.random() * (words.length - i) + i);
        const temp = words[i];
        words[i] = words[idx];
        words[idx] = temp;
    }
    return words.slice(0, 5);
}

const getWordByName = async (username, name) => {
    const user = await User.findOne({username});
    const id = user._id;
    const words = await Word.find({name: {$regex: '.*' + name + '.*', $options: 'i'}, user: id});
    return words;
}

module.exports = {asyncQueryMethod, generateWords, getWordByName, shuffle};