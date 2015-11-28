var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Collocations game' });
});

router.get('/domain/:topic', function(req, res, next) {
  res.render('domain', { title: req.params.topic + " page", topic: req.params.topic });
});


router.get('/game/:topic/:area', function(req, res, next) {
  res.render('game', { title: req.params.topic + " " + req.params.area + " games page", topic: req.params.topic, area: req.params.area });
});

router.post('/post', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
