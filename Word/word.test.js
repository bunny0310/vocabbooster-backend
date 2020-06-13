const Word = require("./word");

describe("Word", ()=>{
    const name = 'outmaneuver';
    const synonyms = ['outsmart', 'outwit', 'outthink', 'outplay'];
    const type = ['verb'];
    const meaning = "use skill and cunning to secure an advantage over others";
    const sentence = "You really think you're gonna outmanuever me huh?"
    const tags = ['cool']

    const word = new Word({name,synonyms,type, meaning, sentence, tags})
    it('has the property `name`', ()=>{
        expect(word).toHaveProperty('name');
    });
    it('has the property `synonyms`', ()=>{
        expect(word).toHaveProperty('synonyms');
    });
    it('has the property `type`', ()=>{
        expect(word).toHaveProperty('types');
    });
    it('has the property `meaning`', ()=>{
        expect(word).toHaveProperty('meaning');
    });
    it('has the property `tags`', ()=>{
        expect(word).toHaveProperty('tags');
    });
    it('has the property `sentence`', ()=>{
        expect(word).toHaveProperty('sentence');
    });
    it('synonyms and types are of type array', ()=>{
        expect(word.types instanceof Array && word.synonyms instanceof Array).toBe(true);
    });
})