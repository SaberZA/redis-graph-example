const RedisGraph = require('redisgraph.js').RedisGraph;

let graph = new RedisGraph('social');

graph.query('MATCH (a:person { name: \'steve\' })<-[c:knows]-(b:person) RETURN a,b,c')
    .then((res) => {
        while(res.hasNext()) {
            let record = res.next();
            console.log(record);
        }
        process.exit();
    })
    .catch((err) => {
        console.error(err);
        process.exit();
    });