class Word {
    constructor({name,meaning,synonyms,types, tags, sentence})
    {
        this.name = name;
        this.meaning = meaning;
        this.synonyms = synonyms;
        this.types = types || [];
        this.tags = tags || [];
        this.sentence = sentence;
    }

    // constructor({json}) {
    //     const word  = JSON.parse(json);
        
    // }
}

module.exports = Word;