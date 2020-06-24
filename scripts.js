const Graph = require("./Graph");
const Node = require("./Graph/node");
const  WordList = require("./Word/word_list");
const {asyncQueryMethod, getAdjLists, updateAdjListsInDB, getUsers} = require("./util");

const graph = new Graph();
getUsers().then((users)=>{
    for(let user of users)
    {
        graph.addNode({node: new Node(user)});
    }
    graph.addEdge({u:graph.getNode('raghav'), v:graph.getNode('ishkhur')});
    graph.addEdge({u:graph.getNode('ishkhur'), v:graph.getNode('raghav')});
    updateAdjListsInDB(graph.serialize()).then((res)=>{
        console.log(res);
    }).catch((err)=>{
        console.log(err);
    })
})