const Node = require("./node");
const {asyncQueryMethod} = require("../util");

class Graph {
    constructor() {
        this.adjLists = new Map();
    }


    addNode({node}) {
        if(!(node instanceof Node)) throw "Invalid node!";
        if(this.adjLists.has(node))
            return;
        this.adjLists.set(node,[]);
    }

    getNode(data) {
        let node = null;
        for(let key of this.adjLists.keys()) {
            if(key.data === data)node = key;
        }
        if(node===null)throw "Node not found!";
        return node;
    }

    addEdge({u,v}) {
        if(!(u instanceof Node) || !(v instanceof Node))
        {
            throw "Please supply valid nodes";
        }
        if(!(this.containsNode(u.data, this.adjLists.keys())) || !(this.containsNode(v.data, this.adjLists.keys())))
        {
            throw "Node doesn't exist!";
        }
        try {
            for(let neighbor of this.adjLists.get(u)) {
                if(neighbor.data === v.data) {
                    throw "Edge already exists!";
                }
            }
            this.adjLists.get(u).push(v);
        } catch(err) {
            throw "Error: "+err;
        }
    }

    containsNode(data, arr) {
        if(typeof data !== 'string') {
            throw "Data needs to be of type string";
        }
        for(let node of arr) {
            if(node.data === data)return true;
        }
        return false;
    }

    isEdge({u,v}) {
        try {
            return this.containsNode(v.data,this.adjLists.get(this.getNode(u.data)));
        }catch(err) {
            throw err;
        }
    }

    serialize() {
        return JSON.stringify([...this.adjLists]);
    }

    static Deserialize({str}) {
        try {
            return new Map(JSON.parse(str));
        } catch(err) {
            throw "invalid JSON: "+err;
        }
    }

}
module.exports = Graph;