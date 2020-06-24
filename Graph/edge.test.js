const Edge = require("./edge");
const Node = require("./node");

describe('Edge', ()=>{
    const u = new Node('foo');
    const v = new Node('bar');
    const edge = new Edge({u,v});
    it('has a property `u` of type Node', ()=>{
        expect(edge).toHaveProperty('u');
        expect(edge.u instanceof Node).toBe(true);
    });
    it('has a property `v` of type Node', ()=>{
        expect(edge).toHaveProperty('v');
        expect(edge.v instanceof Node).toBe(true);
    });
})