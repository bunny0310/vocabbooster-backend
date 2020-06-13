const Wordlist = require("./word_list");
const Word = require("./word");

describe('Wordlist', ()=>{
    const wordlist = new Wordlist();
    it('has a property list of type Word[]', ()=>{
        expect(wordlist).toHaveProperty('list');
        expect(wordlist.list instanceof Array).toBe(true); 
    });

    describe('addWord()', ()=>{
        it('adds the word to the list', ()=>{
            const word = new Word({
                name: 'hindsight', 
                type: ['noun'], 
                meaning: 'understanding of an event only after it has happened',
                tags: ['now that I think of it']
            });
            wordlist.addWord(word);
            expect(JSON.stringify(wordlist.list[wordlist.list.length-1])).toEqual(JSON.stringify(word));
        })
    })
})