const RedisGraph = require("redisgraph.js").RedisGraph;

let graph = new RedisGraph('social');
graph
.query("MERGE (:person{name:'steve',age:29})")
.then( () => {
	return graph.query("MERGE (:person{name:'bob',age:35})");
})
.then( () => {
    return graph.query("MATCH (a:person), (b:person) WHERE (a.name = 'steve' AND b.name='bob') CREATE (a)-[:knows]->(b)")
        .then(() => {
            return graph.query("MATCH (a:person), (b:person) WHERE (a.name = 'steve' AND b.name='bob') CREATE (b)-[:knows]->(a)")
        })
})
.then( () => {
	return graph.query("MATCH (a:person)-[:knows]->(:person) RETURN a")
})
.then( (res) => {
	while(res.hasNext()){
		let record = res.next();
		console.log(record.getString('a.name'));
	}
    console.log(res.getStatistics().queryExecutionTime());
    process.exit();
})
.catch((err) => {
    console.error(err);
    process.exit();
});