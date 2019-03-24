const RedisGraph = require("redisgraph.js").RedisGraph;
const fs = require('fs');

console.log(new Date());
var inputFile = 'wiki-Talk.txt';
// Format = (user)-[edits]-(user)
var lines = fs.readFileSync(inputFile).toString().split("\n");
var uncommentedLines = removeComments(lines);

let graph = new RedisGraph('wiki-talk');
let count = 0;
let tasksToWait = [];

uncommentedLines.forEach((element) => {
    var nodeRelation = element.split("\t");
    var fromNode = nodeRelation[0];
    var toNode = nodeRelation[1];
    toNode = toNode.replace('\r','');
    
    let queryPromise = graph.query('MERGE (:user{id: \'' + fromNode + '\'})')
        .then(() => {
            return graph.query('MERGE (:user{id: \'' + toNode + '\'})')
        })
        .then(() => {
            return graph.query("MATCH (a:user), (b:user) WHERE (a.id = \'"+ fromNode +"\' AND b.id = \'"+ toNode +"\') CREATE (a)-[:edits]->(b)-[:edits]->(a)")
        })
        .catch((err) => {
            console.error(err);
        });
    tasksToWait.push(queryPromise);
});

Promise.all(tasksToWait)
.then(() => {
    console.log(new Date());
    console.log('finished import.');
    process.exit();
})

function removeComments(lines, removeEmptyLines) {
    removeEmptyLines = removeEmptyLines == undefined ? true : removeEmptyLines;
    var uncommentedLines = [];
    lines.forEach(element => {
        if (element.trim().indexOf('#') == 0) return;
        if (removeEmptyLines && element.trim().length == 0) return;
        uncommentedLines.push(element);
    });
    return uncommentedLines;
}