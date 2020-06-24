const Graph = require("./index");
const Node = require("./node");
const Edge = require("./edge");

class Friends extends Graph{

    constructor() {
        super();
    }

    getNumberFriends(user) {
        let node = null;
        for(let key of this.adjLists.keys()) {
            if(key.data === user)node=key;
        }
        if(node===null)throw 'user doesn`t exist';
        let count = 0;
        //console.log(this.adjLists.get(node));
        try {
            for(let neighbor of this.adjLists.get(node)) {
                console.log(count);
                if(this.isEdge({u:neighbor,v:node}))count++;
               
            }
        }catch(err) {
            throw err;
        }
        console.log('count');
        return count;
    }

}

module.exports = Friends;