var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Collocations game' });
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'Collocations game' });
});

router.get('/my_account', function(req, res, next) {
  res.render('my_account', { title: 'Collocations game' });
});


router.get('/domain/:topic', function(req, res, next) {
  res.render('domain', { title: req.params.topic + " page", topic: req.params.topic });
});


router.get('/game/:topic/:area', function(req, res, next) {
  res.render('game', { title: req.params.topic + " " + req.params.area + " games page", topic: req.params.topic, area: req.params.area });
});

var loadSentences = function(topic, area) {
  var basePath = "../data/" + topic + "/";
  var dataFile = basePath + area  + ".json";
  console.log("Loading data file " + dataFile);
  var json = require(dataFile);

  return json.sentences;
}

var loadSentenceChoices = function(topic, sentence) {
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
  var basePath = "../data/" + topic + "/";
  choiceFile = basePath + sentence.choices.group + ".json";
  console.log("Loading choices from " + choiceFile);
  var choices = require(choiceFile).items;
  console.log("choiceFile loaded with " + choices.length + " elements");
  return choices;
}

function find(array, predicate) {
  for (var i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return array[i];
    }
  }

  return null;
}

function getFirstElements(array, count) {
  if (array.length <= count) {
    return array;
  }

  var results = [];
  for(var i = 0; i < count; i++) {
    results.push(array[i]);
  }
  return results;
}

function logArray(array){
  for(var i = 0; i<array.length; i++){
    console.log("  " + array[i]);
  }
}

function getShuffledCopy(sourceArray) {
  var array = sourceArray.slice(0);
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

var getRandomTest = function(topic, area) {
  var sentences = loadSentences(topic, area);
  var length = sentences.length;

  var selectedSentenceIndex = Math.floor(Math.random() * length);
  var sentence = sentences[selectedSentenceIndex];
  console.log("Sentence (id:" + sentence.id + "): " + sentence.beginning + " ??? " + sentence.end);

  var chosenPair = null;
  var choices = loadSentenceChoices(topic, sentence);
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
  } else {
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

  console.log("before");
  logArray(choices);
  console.log("after");
  logArray(getFirstElements(choices, 4));

  return {
    id: sentence.id,
    beginning: beginning,
    end: end,
    baseWord: base,
    collocationReversed: hideFirstWord,
    choices: getFirstElements(choices, 4)
  };
}

var checkAnswer = function(topic, area, test, answer) {
  console.log("Checking answer " + answer + " against " + test.choices[0]);
  return test.choices[0] === answer;

  var sentences = loadSentences(topic, area);
  var match = null;
  for (var i = 0; i<sentences.length; i++) {
    if (sentences[i].id == testId) {
      match = sentences[i];
      break;
    }
  }

  if (match === null){
    console.log("Failed to find test for topic " + topic + ", area " + area + ", id " + testId);
    return false;
  }

  var collocation = collocationReversed ? (answer + ' ' + baseWord) :  (baseWord + ' ' + answer) ;
  var choices = loadSentenceChoices(topic, match);
  // Look for the collocation in the sentence's word list
  console.log("Looking for collocation " + collocation);
  for (var i = 0; i < choices.length; i++) {
    var choice = choices[i];
    var choiceCollocation = choice.q + ' ' + choice.a;
    console.log("Testing choice collocation " + choiceCollocation);
    if (choiceCollocation === collocation) {
      console.log("Answer is correct with collocation " + collocation);
      return true;
    }
  }
  console.log("Answer is not correct with collocation " + collocation);
  return false;
}

var runMultipleChoiceGame = function(topic, area, req, res, isPost) {
    var gameType = 'mc';
    var success = null;
    var test = null;
    if (isPost){
      var answer = req.body.answer;
      var postedTest = JSON.parse(req.body.test);
      console.log("Received answer: " + answer);
      console.log("Received input test: " + JSON.stringify(postedTest));
      success = checkAnswer(topic, area, postedTest, answer);
      if (!success) {
        // reissue the same question
        test = postedTest;
      }
    }

    if (test === null) {
      test = getRandomTest(topic, area);
    }

    console.log("Sending test with the following choices:");
    logArray(test.choices);

    res.render(gameType, {
       title: req.params.topic + " " + req.params.area + " games page from custom page",
       topic: req.params.topic,
       area: req.params.area,
       test: test,
       shuffledChoices: getShuffledCopy(test.choices),
       success: success,
       givenAnswer: answer
     });
};

router.get('/game/:topic/:area/mc', function(req, res, next) {
    runMultipleChoiceGame(req.params.topic, req.params.area, req, res, false);
});

router.post('/game/:topic/:area/mc', function(req, res, next) {
  runMultipleChoiceGame(req.params.topic, req.params.area, req, res, true);
});

router.get('/game/:topic/:area/:gameType', function(req, res, next) {
  var gameType = req.params.gameType
  res.render(gameType, { title: req.params.topic + " " + req.params.area + " games page", topic: req.params.topic, area: req.params.area });
});

router.post('/game/:topic/:area/:gameType', function(req, res, next) {
  var gameType = req.params.gameType
  res.render(gameType, { title: req.params.topic + " " + req.params.area + " games page", topic: req.params.topic, area: req.params.area });
});

router.post('/post', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
