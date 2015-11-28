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

var runMultipleChoiceGame = function(req, res, isPost) {
  var sentences = [{
    id: 0,
    beginning: 'Today I met Henry on the tennis',
    choices: ['court', 'pitch', 'field'],
    end: 'for a friendly game.'}];

    var gameType = 'mc'
    var success = null
    if (isPost){
      var answer = req.body.answer;
      var testId = req.body.testId;
      console.log("Received input: " + answer)
      console.log("Received input: " + testId)
      success = (answer === 'court')
    }
    res.render(gameType, {
       title: req.params.topic + " " + req.params.area + " games page from custom page",
       topic: req.params.topic,
       area: req.params.area,
       test: sentences[0],
       success: success
     });
};

router.get('/game/:topic/:area/mc', function(req, res, next) {
    runMultipleChoiceGame(req, res, false);
});
router.post('/game/:topic/:area/mc', function(req, res, next) {
    runMultipleChoiceGame(req, res, true);
});

router.get('/game/:topic/:area/:gameType', function(req, res, next) {
  var gameType = req.params.gameType
  res.render(gameType, { title: req.params.topic + " " + req.params.area + " games page", topic: req.params.topic, area: req.params.area });
});


router.post('/post', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
