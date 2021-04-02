var express = require('express');
var router = express.Router();

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://typerProject:typer@typermaincluster-shard-00-00.j5kmc.mongodb.net:27017,typermaincluster-shard-00-01.j5kmc.mongodb.net:27017,typermaincluster-shard-00-02.j5kmc.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-h4rylu-shard-0&authSource=admin&retryWrites=true&w=majority";
const mongoClient = new MongoClient(url, { useUnifiedTopology: true });
mongoClient.connect();
const db = mongoClient.db("Typer");
const collection = db.collection("Scores");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Делимся результатами
//JSON POST body format:
//{
// "name":"test",
// "score":"10"
// }

router.post('/share', function (req, res)
{
  console.log("Name: " + req.body.name);
  console.log("Score: " + req.body.score);

  let user = {Name: req.body.name, Score: req.body.score, Date: new Date().toLocaleDateString()};
  collection.insertOne(user);

  res.send("Success");
});



module.exports = router;
