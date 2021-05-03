class LRUCache {
    
    //dummy nodes pointing to the head and tail of the list

    constructor(capacity) {
        this.head = new Node();
        this.tail = new Node();
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.map = new Map();
        this.capacity = capacity;
    }
    
    get(key) {
        const ret = this.map.has(key) ? this.map.get(key) : null;
        if(ret !== null) {
            this.removeNode(ret);
            this.addNode(ret);
            return ret.val;
        }
        
        return -1;
    }
    
    removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    
    addNode(node) {
        this.head.next.prev = node;
        node.next = this.head.next;
        this.head.next = node;
        node.prev = this.head;
    }
    
    put(key, value) {
        const ret = this.map.has(key) ? this.map.get(key) : null;
        
        if(ret !== null) {
            this.removeNode(ret);
            ret.val = value;
            this.map.set(key, ret);
            this.addNode(ret);
        }
        else {
            if(this.capacity == this.map.size) {
                this.map.remove(tail.prev.key);
                this.removeNode(tail.prev);
            }
            const node = new Node(key, value);
            this.addNode(node);
            this.map.set(key, node);
        }
    }
}

class Node {    
    constructor(key, val) {
        this.key = key;
        this.val = val;
        this.prev = null;
        this.next = null;
    }
}

module.exports = LRUCache;
