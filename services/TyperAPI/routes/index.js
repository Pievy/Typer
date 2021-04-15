var express = require('express');
var moment = require('moment')
const MongoClient = require("mongodb").MongoClient;

var router = express.Router();
module.exports = router;

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
// "score":10
// }
router.post('/share', function (req, res)
{
  console.log("Name: " + req.body.name);
  console.log("Score: " + req.body.score);

  let user = {Name: req.body.name, Score: req.body.score, Date: new Date()};
  collection.insertOne(user);

  res.send("Success");
});

///Все результаты
router.get('/resultsAll', function (req, res)
{
  collection.find({}).toArray(function(err, result) {
    if (err) throw err;
    res.send(result);
  });
})

//Фильтр по дате
//JSON POST body format:
//{
// "amount": 1, <-количество часов/дней/месяцев/
// "unit":"month" <- hour/day/week/month/year
// }
//unit из moment.js может принимать значения начиная от second и заканчивая year
//работает со мн. числом, можно писать 10 minute == 10 minutes

router.post('/resultsDateFilter', function (req, res)
{
  dateFilter(req.body.amount, req.body.unit, res);
});

//Фильтр по результату.
//JSON POST body format:
//{
// "score": 10 <- (вернет результаты больше 10)
// }
router.post('/resultsScoreFilter', function (req, res)
{
  scoreFilter(req.body.score, res);
});

function dateFilter(amount, unit, res) {
  var dateTimeTofilter = moment().subtract(amount, unit);
  var filter = {
    "Date": {
      $gte: new Date(dateTimeTofilter._d)
    }
  };
  collection.find(filter).sort({"Date": -1}).toArray(function(err, result) {
    res.send(result);
  });
}

function scoreFilter(score, res) {

  let filter = { Score: { $gt: score } };
    collection.find(filter).sort({"Score": -1}).toArray(function(err, result) {
      res.send(result)});
}