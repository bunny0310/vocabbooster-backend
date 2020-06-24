const Node = require("./node");

describe('Node', ()=>{
    const node = new Node('foo-data');
    it('contains property `data`', ()=>{
        expect(node).toHaveProperty('data');
    });
    it('sets the `data` member to its correct value', ()=>{
        expect(node.data).toEqual('foo-data');
    });
})