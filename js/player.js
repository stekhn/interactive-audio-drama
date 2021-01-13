'use strict';

document.addEventListener('DOMContentLoaded', loadData, false);

var storyData;
var player;
var wave;
var elements = {};

function loadData() {
  // Load story data
  fetch('./js/story.json')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return setupPage(data);
    });
}

function setupPage(data) {
  storyData = data;

  elements.startButton = document.querySelector('#start');
  elements.content = document.querySelector('#content');
  elements.player = document.querySelector('#player');
  elements.playButton = document.querySelector('#player .play');
  elements.pauseButton = document.querySelector('#player .pause');
  elements.skipLeftButton = document.querySelector('#player .skip-left');
  elements.skipRightButton = document.querySelector('#player .skip-right');
  elements.progress = document.querySelector('#player .progress');
  elements.progressBar = document.querySelector('#player .progress-bar');
  elements.wave = document.querySelector('#player .wave');

  elements.startButton.addEventListener('click', function () {
    var introObject = storyData.filter(function (storyObject) {
      return storyObject.id === 'intro';
    })[0];
    
    elements.player.style.display = 'block';
    setupWave();
    updatePage(introObject);
  }, false);

  elements.playButton.addEventListener('click', startPlayer, false);
  elements.pauseButton.addEventListener('click', pausePlayer, false);
  elements.skipLeftButton.addEventListener('click', skipLeftPlayer, false);
  elements.skipRightButton.addEventListener('click', skipRightPlayer, false);

  elements.playButton.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) { startPlayer(); }
  }, false);
  elements.pauseButton.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) { pausePlayer(); }
  }, false);
  elements.skipLeftButton.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) { skipLeftPlayer(); }
  }, false);
  elements.skipRightButton.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) { skipRightPlayer(); }
  }, false);

  elements.progress.addEventListener('click', skipTo, false);
}

function updatePage(storyObject) {
  updateContent(storyObject);
  updatePlayer(storyObject);
}

function updateContent(storyObject) {
  elements.content.innerHTML = '';

  var h1 = document.createElement('h1');
  h1.textContent = storyObject.title;
  elements.content.appendChild(h1);

  var p = document.createElement('p');
  p.textContent = storyObject.text;
  elements.content.appendChild(p);

  var optionsWrapper = document.createElement('p');
  optionsWrapper.className = 'options';
  elements.content.appendChild(optionsWrapper);

  storyObject.options.forEach(function (option) {
    var optionButton = document.createElement('button');
    optionButton.textContent = option.description;
    optionsWrapper.appendChild(optionButton);

    optionButton.addEventListener('click', function () {
      var storyObject = storyData.filter(function (storyObject) {
        return storyObject.id === option.link;
      })[0];

      updatePage(storyObject);
    });
  });
}

function updatePlayer(storyObject) {
  Howler.unload();

  player = new Howl({
    src: [storyObject.audio],
    onend: resetPlayer,
    onplay: function () {
      requestAnimationFrame(updateProgressBar);
    },
    onseek: function () {
      requestAnimationFrame(updateProgressBar);
    }
  });

  startPlayer();
}

function startPlayer() {
  elements.playButton.style.display = 'none';
  elements.pauseButton.style.display = 'inline-block';

  player.play();
  wave.start();
}

function pausePlayer() {
  elements.playButton.style.display = 'inline-block';
  elements.pauseButton.style.display = 'none';

  player.pause();
  wave.stop();
}

function resetPlayer() {
  elements.playButton.style.display = 'inline-block';
  elements.pauseButton.style.display = 'none';

  player.stop();
  wave.stop();
}

function skipLeftPlayer() {
  var currentPosition = player.seek();

  if (currentPosition > 15) {
    player.seek(currentPosition - 15);
  } else {
    player.seek(1);
  }

  elements.skipLeftButton.blur();
}

function skipRightPlayer() {
  var currentPosition = player.seek();
  var duration = player.duration();

  if (duration - currentPosition > 15) {
    player.seek(currentPosition + 15);
  } else {
    player.seek(duration - 1);
  }

  elements.skipRightButton.blur();
}

function skipTo(event) {
  var elementWidth = event.target.clientWidth;
  var elementRect = event.target.getBoundingClientRect();
  var clickX = event.clientX - elementRect.left;
  var fractionX = clickX / elementWidth;
  var newPosition = player.duration() * fractionX;

  console.log(event.target);
  console.log(fractionX, player.duration(), newPosition);
  
  player.seek(newPosition);
}

function updateProgressBar() {
  var currentPosition = player.seek() || 0;
  
  if (player.playing()) {
    elements.progressBar.style.width = Math.round(((currentPosition / player.duration()) * 100) || 0) + '%';
    requestAnimationFrame(updateProgressBar);
  }
}

function setupWave() {
  wave = new SiriWave({
    container: elements.wave,
    width: window.innerWidth,
    height: window.innerHeight * 0.3,
    cover: true,
    color: '#ffffff',
    speed: 0.03,
    amplitude: 0.7,
    frequency: 2
  });

  window.addEventListener('resize', updateWave);

  updateWave();
}

function updateWave() {
  var height = window.innerHeight * 0.3;
  var width = window.innerWidth;

  wave.height = height;
  wave.height_2 = height / 2;
  wave.MAX = wave.height_2 - 4;
  wave.width = width;
  wave.width_2 = width / 2;
  wave.width_4 = width / 4;
  wave.canvas.height = height;
  wave.canvas.width = width;
};
