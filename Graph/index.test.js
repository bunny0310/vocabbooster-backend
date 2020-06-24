const Graph = require("./index");
const Node = require("./node");
const Edge = require("./edge");
 
describe("Graph", ()=>{
    const node_one = new Node('node1');
    const node_two = new Node('node2');
    //const edge_one = new Edge({u: node_one, v: node_two});
    let graph = new Graph();

    beforeEach(()=>{
        graph = new Graph();
    });

    it('has a map of adjacency lists', ()=>{
        expect(graph).toHaveProperty('adjLists');
        expect(graph.adjLists instanceof Map).toBe(true);
    });

    describe('addNode()', ()=>{
        describe('and it`s of `Node` type', ()=>{
            describe('and the node doesn`t exist', ()=>{
                it('adds the node to the map', ()=>{
                    graph.addNode({node: node_one});
                    expect(graph.adjLists.has(node_one)).toBe(true);
                });
                it('updates the size of the map', ()=>{
                    const size  = graph.adjLists.size;
                    graph.addNode({node: node_one});
                    const size_new = graph.adjLists.size;
                    expect(size_new-size).toEqual(1);
                });
            });
            describe('and the node already exists', ()=>{
                it('simply returns', ()=>{
                    graph.addNode({node: node_one});
                    const size  = graph.adjLists.size;
                    graph.addNode({node: node_one});
                    const size_new = graph.adjLists.size;
                    expect(size_new-size).toEqual(0);
                });
            })
        });
        describe('and it`s not of `Node` type', ()=>{
            it('throws an error', ()=>{
                expect(()=>graph.addNode({node: 5})).toThrow();
            })
        })
    });

    describe('addEdge()', ()=>{
        describe('and both the nodes exist without any edge existing from u to v', ()=>{
            it('adds a directed edge from u to v', ()=>{
                graph.addNode({node: node_one});
                graph.addNode({node: node_two});
                graph.addEdge({u:node_one,v:node_two});
                expect(graph.adjLists.get(node_one).includes(node_two)).toBe(true);
            });
        });
        describe('and one or both of the nodes are missing', ()=>{
            it('throws error', ()=>{
                expect(()=>graph.addEdge({u:node_one,v:node_two})).toThrow();
            })
        })
        describe("And the edge already exists", ()=>{
            it("throws an error", ()=>{
                graph.addNode({node: node_one});
                graph.addNode({node: node_two});
                graph.addEdge({u:node_one,v:node_two});
                expect(()=>graph.addEdge({u:node_one,v:node_two})).toThrow();
            });
        })
    });

    describe('isEdge()', ()=>{
        it('returns true if there`s an edge between the 2 given nodes', ()=>{
            graph.addNode({node: node_one});
            graph.addNode({node: node_two});
            graph.addEdge({u: node_one, v:node_two});
            expect(graph.isEdge({u:node_one,v:node_two})).toBe(true);
        });
        it('returns false if there`s not an edge between the 2 given nodes', ()=>{
            graph.addNode({node: node_one});
            graph.addNode({node: node_two});
            expect(graph.isEdge({u:node_one,v:node_two})).toBe(false);
        });
    })

    describe('containsNode()', ()=>{
        describe('and the node exists', ()=>{
            it('returns true', ()=>{
                graph.addNode({node: node_one});
                expect(graph.containsNode('node1', graph.adjLists.keys())).toBe(true);
            });
        });
        describe('and the node does not exist', ()=>{
            it('returns false', ()=>{
                expect(graph.containsNode('node1',graph.adjLists.keys())).toBe(false);
            });
        });
    })

    describe('getNode()', ()=>{
        describe('and the node with the valid data exists', ()=>{
            it('returns the node', ()=>{
                const data = 'node1';
                graph.addNode({node: node_one});
                expect(graph.getNode(data)).toEqual(node_one);
            })
        });
        describe('and the node doesn`t exist', ()=>{
            it('throws an error', ()=>{
                expect(()=>graph.getNode('nodeone')).toThrow(); 
            })
        });
    })

    describe('serialize()', ()=>{
        describe('it converts the entire graph object into a JSON formatted string', ()=>{
            it('returns a string', ()=>{
                const string = JSON.stringify([...graph.adjLists]);
                expect(graph.serialize()).toEqual(string);
            });
        });
    });

    describe('Deserialize()', ()=>{
        describe('it converts the JSON string into a JSON object describing the graph', ()=>{
            describe('and the JSON string is valid', ()=>{
                it('returns an object', ()=>{
                    expect(graph.adjLists).toEqual(Graph.Deserialize({str: graph.serialize()}));
                });
            });
            describe('and the JSON string is not valid', ()=>{
                const str = 'fake-string';
                expect(()=>Graph.Deserialize(str)).toThrow();
            });
        });
    }); 
})