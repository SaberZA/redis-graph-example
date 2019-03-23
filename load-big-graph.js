const RedisGraph = require("redisgraph.js").RedisGraph;
const fs = require('fs');

console.log(new Date());
var inputFile = 'ca-GrQc.txt';
// Format = (author)-[coauthors]-(author)
var lines = fs.readFileSync(inputFile).toString().split("\n");
var uncommentedLines = removeComments(lines);

let graph = new RedisGraph('general-relativity');
let count = 0;
let tasksToWait = [];

uncommentedLines.forEach((element) => {
    var nodeRelation = element.split("\t");
    var fromNode = nodeRelation[0];
    var toNode = nodeRelation[1];
    toNode = toNode.replace('\r','');
    
    let queryPromise = graph.query('MERGE (:author{id: \'' + fromNode + '\'})')
        .then(() => {
            return graph.query('MERGE (:author{id: \'' + toNode + '\'})')
        })
        .then(() => {
            return graph.query("MATCH (a:author), (b:author) WHERE (a.id = \'"+ fromNode +"\' AND b.id = \'"+ toNode +"\') CREATE (a)-[:coauthors]->(b)-[:coauthors]->(a)")
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




// let graph = new RedisGraph('social');
// graph
// .query("CREATE (:person{name:'roi',age:32})")
// .then( () => {
// 	return graph.query("CREATE (:person{name:'amit',age:30})");
// })
// .then( () => {
// 	return graph.query("MATCH (a:person), (b:person) WHERE (a.name = 'roi' AND b.name='amit') CREATE (a)-[:knows]->(b)")
// })
// .then( () => {
// 	return graph.query("MATCH (a:person)-[:knows]->(:person) RETURN a")
// })
// .then( (res) => {
// 	while(res.hasNext()){
// 		let record = res.next();
// 		console.log(record.getString('a.name'));
// 	}
//     console.log(res.getStatistics().queryExecutionTime());
//     process.exit();
// })
// .catch((err) => {
//     console.error(err);
//     process.exit();
// });