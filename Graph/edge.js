const Node = require("./node");

class Edge {
    constructor({u,v}) {
        this.u = u;
        this.v = v;
    }
}

module.exports = Edge;