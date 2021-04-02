var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Делимся результатами
router.post('/share', function (req, res) {
  res.send('Hello')
});

module.exports = router;
