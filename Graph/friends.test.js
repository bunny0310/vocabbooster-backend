const Friends = require("./friends");
const Node = require("./node");
const Edge = require("./edge");

describe('Friends', ()=>{
    const node_one = new Node('node1');
    const node_two = new Node('node2');
    let friends = new Friends();
    beforeEach(()=>{
        friends = new Friends();
    });
    describe('getNumberFriends()', ()=>{
        describe('and there are no edges in the graph', ()=>{
            it('returns 0', ()=>{
                friends.addNode({node: node_one});
                expect(friends.getNumberFriends(node_one.data)).toEqual(0);
            });
        });
        describe('and there is an edge from u to v but not the other way around', ()=>{
            it('returns 0', ()=>{
                friends.addNode({node: node_one});
                friends.addNode({node: node_two});
                friends.addEdge({u:node_one,v:node_two});
                expect(friends.getNumberFriends(node_one.data)).toEqual(0);
            });
        });
        describe('and there is a bidirectional edge between u and v', ()=>{
            it('returns 1', ()=>{
                friends.addNode({node: node_one});
                friends.addNode({node: node_two});
                friends.addEdge({u:node_one,v:node_two});
                friends.addEdge({u:node_two,v:node_one});
                expect(friends.getNumberFriends(node_one.data)).toEqual(1);
            });
        });
    });
})