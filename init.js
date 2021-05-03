const lruCache = require("./lru_cache");

const tagsCache = new lruCache(10);
const wordsCache = new lruCache(10); // to store all the words
const wordNamesCache = new lruCache(10); // to store all the words

module.exports = {
    tagsCache,
    wordsCache,
    wordNamesCache
}