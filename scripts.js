const Graph = require("./Graph");
const Node = require("./Graph/node");
const  WordList = require("./Word/word_list");
const {asyncQueryMethod, getAdjLists, updateAdjListsInDB, getUsers} = require("./util");
const parseJson = require('parse-json');

// const graph = new Graph();
// getUsers().then((users)=>{
//     for(let user of users)
//     {
//         graph.addNode({node: new Node(user)});
//     }
//     graph.addEdge({u:graph.getNode('raghav'), v:graph.getNode('ishkhur')});
//     graph.addEdge({u:graph.getNode('ishkhur'), v:graph.getNode('raghav')});
//     updateAdjListsInDB(graph.serialize()).then((res)=>{
//         console.log(res);
//     }).catch((err)=>{
//         console.log(err);
//     })
// })

// asyncQueryMethod("SELECT word_json FROM words").then(rows=>{
//     for(let row of rows)
//     {
//         //deconstruct the word from its JSON
//         const word = parseJson(row.word_json);
//         let name = word.name;
//         let meaning = word.meaning;
//         let sentences = '';
//         for(let obj of word.sentence) {
//             sentences += obj.tag + '@';
//         }
//         sentences = sentences.substr(0, sentences.length - 1);

//         let tags = '';
//         for(let obj of word.tags) {
//             tags += obj.tag + '@';
//         }
//         tags = tags.substr(0, tags.length - 1);

//         let types = '';
//         types = word.types.join('@');

//         let synonyms = '';
//         for(let obj of word.synonyms) {
//             synonyms += obj.tag + '@';
//         }
//         synonyms = synonyms.substr(0, synonyms.length - 1);
//         meaning = String(meaning).replace('\'', '');
//         sentences = String(sentences).replace('\'', '');

//         //insert the word to the new table

//         asyncQueryMethod(`INSERT INTO words2 
//         (name, meaning, sentences, tags, type, synonyms) 
//         VALUES ('${name}', '${meaning}', '${sentences}', '${tags}', '${types}', '${synonyms}')`)
//         .catch((err) => {
//             console.log(err);
//         });
//     }
// }).catch((error)=>{
//     console.log(error);
// });