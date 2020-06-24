const {connection} = require("./config");
const asyncQueryMethod = async (query)=>{
    try {
        const result = await connection.query(query);
        return result;
    } catch(err){
        console.log(err);
    }
}

const getAdjLists = async()=>{
    const promise = await new Promise((resolve,reject)=>{
        asyncQueryMethod("Select * from graph_json")
        .then((rows)=>{
            if(rows.length>0)
                resolve(rows[0].json);
                else throw "graph json null!";
        }).catch((err)=>{
            reject(err);
        });
    })
    return promise;
}

const updateAdjListsInDB = async(str)=>{
    const promise = await new Promise((resolve,reject)=>{
        asyncQueryMethod("Update graph_json SET json = '"+str+"' WHERE idgraph_json=0")
        .then((rows)=>{
            resolve("success");
        }).catch((err)=>{
            reject(err);
            throw err;
        });
    })
    return promise;
}

const getUsers = async()=>{
    const arr = [];
    const promise = await new Promise((resolve,reject)=>{
        asyncQueryMethod("SELECT * from users")
        .then((rows)=>{
            for(let row of rows) {
                arr.push(row.username);
            }
            resolve(arr);
        }).catch((err)=>{
            reject(err);
            throw err;
        });
    })
    return promise;
}

module.exports = {asyncQueryMethod, getAdjLists, updateAdjListsInDB, getUsers};