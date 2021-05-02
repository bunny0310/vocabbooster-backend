const {User} = require("./models/user");
const {Word, addWord} = require("./models/word");

const {tagsCache, wordsCache, wordNamesCache} = require("./init");

// method to get words
// option can be 'r', 'f', 'rf' which mean random, filter, and random+filter respectively
// filter is an object of all the keywords
const getWords = async (userId, option=null, filter=null, offset=0) => {
    try {
        let result = new Array();
        offset = parseInt(offset);
        const cachedWords = wordsCache.get(userId);
        if(cachedWords != -1) {
            result = Array.from(cachedWords.values());
            delete cachedWords;
        } else {
            result = await Word.find({user: userId});
            const map = new Map();
            for(const word of result) {
                map.set(word.id, word);
            }
            wordsCache.put(userId, map);
            delete map;
        }
        if(option === 'r') {
            shuffle(result);
            result = result.slice(0, Math.min(result.length, 5));
        } else filterIf:if(option === 'f' || option === 'rf') {
            if(filter == null) {
                break filterIf;
            }
            const nameKeyword = filter.name;
            const meaningKeyword = filter.meaning;
            const sentenceKeyword = filter.sentence;
            const tagKeyword = filter.tag;
            const typeKeyword = filter.type;
            const synonymKeyword = filter.synonym;
            result = result.filter((word) => {
                let filter1 = true;
                if(nameKeyword != undefined || nameKeyword != null) {
                    const regex = new RegExp(`${nameKeyword}`, "i");
                    filter1 = regex.test(word.name);
                }
                let filter2 = true;
                if(meaningKeyword != undefined || meaningKeyword != null) {
                    const regex = new RegExp(`${meaningKeyword}`, "i");
                    filter2 = regex.test(word.meaning);
                }
                let filter3 = true;
                sentenceCheck:if(sentenceKeyword != undefined || sentenceKeyword != null) {
                    const regex = new RegExp(`${sentenceKeyword}`, "i");
                    for(let sentence of word.sentences) {
                        if(regex.test(sentence)) {
                            filter3 = true;
                            break sentenceCheck;
                        }
                    }
                    filter3 = false;
                }
                let filter4 = true;
                tagCheck:if(tagKeyword != undefined || tagKeyword != null) {
                    const regex = new RegExp(`${tagKeyword}`, "i");
                    for(let tag of word.tags) {
                        if(regex.test(tag)) {
                            filter4 = true;
                            break tagCheck;
                        }
                    }
                    filter4 = false;
                }

                let filter5 = true;
                typeCheck:if(typeKeyword != undefined || typeKeyword != null) {
                    const regex = new RegExp(`${typeKeyword}`, "i");
                    for(let type of word.types) {
                        if(regex.test(type)) {
                            filter5 = true;
                            break typeCheck;
                        }
                    }
                    filter5 = false;
                }
                let filter6 = true;
                synonymCheck:if(synonymKeyword != undefined || synonymKeyword != null) {
                    const regex = new RegExp(`${synonymKeyword}`, "i");
                    for(let synonym of word.synonyms) {
                        if(regex.test(synonym)) {
                            filter6 = true;
                            break synonymCheck;
                        }
                    }
                    filter6 = false;
                }
                const overallFilter = filter1 && filter2 && filter3 && filter4 && filter5 && filter6;
                return overallFilter;
            })
            if(option.charAt(0) == 'r') {
                shuffle(result);
                result = result.slice(0, Math.min(result.length, 5));
            }
        }
        if(option !== 'r' || option !=='rf') {
            result = result.slice(offset, offset + 5);
        }
        result = result.reverse();
        return {
            code: 200,
            json: {
                status: true,
                data: result,
                count: result.length,
                msg: "Success"
            }
        }
    } catch(err) {
        return {
            code: 500,
            json: {
                status: false,
                data: null,
                msg: `Internal server error ${err}`
            }
        }
    }
}

// method to get a single word
const getWord = async (userId, wordId) => {
    try {
        let wordsMap = wordsCache.get(userId);
        let word = null;
        if(wordsMap != -1) {
            word = wordsMap.get(wordId);
            delete wordsMap;
        } else {
            word = await Word.findOne({_id: wordId, user: userId});
        }
        return {
            code: word == null ? 404 : 200,
            json: {
                status: word != null,
                data: word,
                msg: word == null ? "Word not found!" : "Success"
            }
        }
    } catch (err) {
        return {
            code: 500,
            json: {
                status: false,
                data: null,
                msg: `Internal Server Error: ${err}`
            }
        } 
    }
}

const shuffle = (arr) => {
    for(let i = 0; i < arr.length; ++i) {
        const idx = Math.floor(Math.random() * (arr.length - i) + i);
        const temp = arr[i];
        arr[i] = arr[idx];
        arr[idx] = temp;
    }
}

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

module.exports = {getTags, checkWordDuplicate, getWords, getWord};