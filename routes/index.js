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

var getSentence = function(topic, area) {
  var basePath = "../data/" + topic + "/";
  var dataFile = basePath + area  + ".json";
  console.log("Loading data file " + dataFile);
  var json = require(dataFile);

  var sentences = json.sentences;
  var length = sentences.length;
  var selectedSentenceIndex = Math.floor(Math.random() * length);

  var sentence = sentences[selectedSentenceIndex];
  console.log("Selected sentence index: " + selectedSentenceIndex);
  console.log("Sentence (id:" + sentence.id + "): " + sentence.beginning + " ??? " + sentence.end);

  // Load the choices that match the sentence
  // sentence is something like:
  // {
  //  "id": 1,
  //  "beginning": "Today I met Henry on the",
  //  "end": "for a friendly game.",
  //  "choices": {
  //    "group": "places",
  //    "tags": ["gamingVenue"]
  //  }
  choiceFile = basePath + sentence.choices.group + ".json";
  console.log("Loading choices from " + choiceFile);
  var choices = require(choiceFile).items;
  console.log("choiceFile loaded with " + choices.length + " elements");
  var selectedChoiceIndex = Math.floor(Math.random() * choices.length)
  var chosenPair = choices[selectedChoiceIndex]
  console.log("Selected pair: " + chosenPair.q + "," + chosenPair.a)

  // With element do we hide?
  var hideFirstWord = Math.random() > 0.5;
  var base = null;
  var answer = null;
  var beginning = sentence.beginning;
  var end = sentence.end;
  var selectChoice = null;
  var selectBase = null;

  if (hideFirstWord){
    end = chosenPair.a + ' ' + sentence.end;
    answer = chosenPair.q;
    base = chosenPair.a;
    selectChoice = function (c) { return c.q; };
    selectBase = function (c) { return c.a; };
  } else{
    beginning += ' ' + chosenPair.q;
    answer = chosenPair.a;
    base = chosenPair.q;
    selectChoice = function (c) { return c.a; };
    selectBase = function (c) { return c.q; };
  }

  // Get the alternatives among the rest of the choices
  var alternatives = {}
  var invalidAlternatives = {}

  console.log("Selected base: " + base)
  console.log("Selected choice: " + answer)

  for (var i = 0; i < choices.length; i++) {
    var altBase = selectBase(choices[i])
    var altChoice = selectChoice(choices[i])
    if (altBase === base) {
      invalidAlternatives[altChoice] = 1
    } else {
      alternatives[altChoice] = 1;
    }
  }

  outputDictKeys = function (d) {
    var keys = Object.keys(d)
    for (var i=0; i<keys.length;i++){
      console.log(keys[i]);
    }
  }

  console.log("Alternatives choices:");
  outputDictKeys(alternatives);

  console.log("Invalid alternatives:");
  outputDictKeys(invalidAlternatives);

  var choices = [answer]
  var alternativesKeys = Object.keys(alternatives)
  for (var i=0; i<alternativesKeys.length;i++){
    var alt = alternativesKeys[i];
    if (!invalidAlternatives.hasOwnProperty(alt))
    {
      console.log("Valid alternative: " + alt)
      choices.push(alt)
    }
  }

  // for(var i=0;i<alternatives.length;i++) {
  //   console.log("alternative: " + alternatives[i].q + " " + alternatives[i].a);
  // }

  return {
    beginning: beginning,
    end: end,
    choices: choices
  };
}

var runMultipleChoiceGame = function(topic, area, req, res, isPost) {
  var sentence = getSentence(topic, area);

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
       test: sentence,
       success: success
     });
};

router.get('/game/:topic/:area/mc', function(req, res, next) {
    runMultipleChoiceGame(req.params.topic, req.params.area, req, res, false);
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
