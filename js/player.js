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
  elements.wave = document.querySelector('#wave');
  elements.player = document.querySelector('#player');

  elements.startButton.addEventListener('click', function () {
    var introObject = storyData.filter(function (storyObject) {
      return storyObject.id === 'intro';
    })[0];
    
    elements.player.style.display = 'block';

    setupWave();
    updatePage(introObject);
  });

  elements.playButton = document.querySelector('#play');
  elements.pauseButton = document.querySelector('#pause');
  elements.skipLeftButton = document.querySelector('#skip-left');
  elements.skipRightButton = document.querySelector('#skip-right');

  elements.playButton.addEventListener('click', startPlayer);
  elements.pauseButton.addEventListener('click', pausePlayer);
  elements.skipLeftButton.addEventListener('click', skipLeftPlayer);
  elements.skipRightButton.addEventListener('click', skipRightPlayer);
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

  player.seek(currentPosition - 15);
}

function skipRightPlayer() {
  var currentPosition = player.seek();

  player.seek(currentPosition + 15);
}

function setupWave() {
  wave = new SiriWave({
    container: elements.wave,
    width: window.innerWidth,
    height: window.innerHeight * 0.3,
    cover: true,
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
  