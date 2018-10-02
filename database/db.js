const monk = require('monk');

let url = `mongodb://dbReadWrite:${
    process.env.MONGO_PW
}@cluster0-shard-00-00-vvrph.gcp.mongodb.net:27017,cluster0-shard-00-01-vvrph.gcp.mongodb.net:27017,cluster0-shard-00-02-vvrph.gcp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true`;

const db = monk(url);
let users = db.get('users');

module.exports = { db, users };
