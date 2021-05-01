const {User} = require("./models/user");
const {Word, addWord} = require("./models/word");

const {tagsCache, wordsCache, wordNamesCache} = require("./init");

const getTags = async (userId, keyword) => {
    if(userId === undefined || userId === null) {
        return null;
    }
    try {
        let set = new Set();
        const cachedSet = tagsCache.get(userId);
        if(cachedSet != -1) {
            // console.log('getting from cache');
            set = cachedSet;
        }
        else {
            const docs = await Word.find({user: userId}, 'tags -_id');
            for(let obj of docs) {
                for(let tag of obj.tags)
                    set.add(tag);
            }
            tagsCache.put(userId, set);
        }
        const result = [];
        const regex = new RegExp(`${keyword}`, "i");
        for(let tag of set) {
            if(regex.test(tag)) {
                result.push(tag);
            }
        }
        return {
            code: 200,
            json: {status: true,
            msg: `Success`,
            data: result
            }
        }    
    }
    catch (err){
        console.log(err);
        return {
            code: 500,
            json: {status: false,
            msg: `Internal server error ${err}`}
        }
    }
}

const checkWordDuplicate = async (userId, name) => {
    if(userId === undefined || userId === null) {
        return null;
    }
    try {
        let set = new Set();
        const wordsSet = wordNamesCache.get(userId);
        if(wordsSet != -1) {
            set = wordsSet;
            delete wordsSet;
        } else {
            const words = await Word.find({user: userId});
            for(let word of words) {
                console.log(word);
                set.add(word.name.toLowerCase());
            }
            wordNamesCache.put(userId, set);
            delete words;
        }
        const exists = set.has(name.toLowerCase());
        return {
            code: 200,
            json: {
                msg: exists ? "Error, the word with this name already exists" : "Success",
                status: !exists
            }
        }
    } catch(err) {
        console.log(err);
        return {
            code: 500,
            json: {status: false,
            msg: `Internal server error ${err}`}
        }
    }
}

module.exports = {getTags, checkWordDuplicate};