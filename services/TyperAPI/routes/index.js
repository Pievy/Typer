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
// "score":250,
// "misprints": 0,
// "rate": 113
// }
router.post('/share', function (req, res)
{
  console.log("Name: " + req.body.name);
  console.log("Score: " + req.body.score);
  console.log("Misprints: " + req.body.misprints);
  console.log("Rate: " + req.body.rate);
  let result = {Name: req.body.name, Score: req.body.score,
    Misprints: req.body.misprints, Rate: req.body.rate , Date: new Date()};
  collection.insertOne(result);

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

//Фильтр по ошибкам.
//JSON POST body format:
//{
// "misprints": 10 <- (вернет результаты где ошибок больше 10)
// }
router.post('/resultsMisprintsFilter', function (req, res)
{
  misprintsFilter(req.body.misprints, res);
});

//Фильтр по скорости.
//JSON POST body format:
//{
// "rate": 100 <- (вернет результаты где скорость больше 100)
// }
router.post('/resultsRateFilter', function (req, res)
{
  rateFilter(req.body.rate, res);
});

//Генерация текста
//Параметр sentCount отвечает за количество предложений в тексте
router.get('/getText', function (req, res)
{
    fishText(res, 7);
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

function misprintsFilter(misprints, res) {
  let filter = { Misprints: { $gt: misprints } };
  collection.find(filter).sort({"Misprints": -1}).toArray(function(err, result) {
    res.send(result)});
}

function rateFilter(rate, res) {
  let filter = { Rate: { $gt: rate } };
  collection.find(filter).sort({"Rate": -1}).toArray(function(err, result) {
    res.send(result)});
}

function fishText(res,sentCount) {
  const https = require('https')
  const options = {
    hostname: 'fish-text.ru',
    path: '/get?type=sentence&number=' + sentCount,
    method: 'GET'
  }

  const req = https.request(options, response => {
    response.on('data', d => {
      var jsonBody = JSON.parse(d.toString());
      res.send(jsonBody.text)
    })
  })

  req.on('error', error => {
    console.error(error)
  })

  req.end()
}