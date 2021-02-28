'use strict';

// Lade JavaScript erst, wenn die HTML-Seite vollständig geladen ist
document.addEventListener('DOMContentLoaded', loadData, false);

// Definiere die wichtigsten globales Variablen zur späteren Verwendung
var storyData;
var player;
var wave;
var elements = {};

// Lade Story-Daten aus einer externen JSON-Datei
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

  // Wähle die wichtigsten Elemente der Seite aus und speichere eine Referenz im Objekt-Elementen, um später einfacher darauf zugreifen zu können
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

  // Verknüpfe Elemente mit Aktion
  elements.startButton.addEventListener('click', loadIntro, false);
  elements.playButton.addEventListener('click', startPlayer, false);
  elements.pauseButton.addEventListener('click', pausePlayer, false);
  elements.skipLeftButton.addEventListener('click', skipLeftPlayer, false);
  elements.skipRightButton.addEventListener('click', skipRightPlayer, false);
  elements.progress.addEventListener('click', skipTo, false);

  // Erlaube zusätzlich, dass die bestimmte Player-Buttons mit der Enter-Taster bedient werden können  
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

}

// Erste Ansicht „Intro“ laden
function loadIntro() {
  // Suche in den Story-Daten nach dem Kapitel mit der ID „intro“
  var introObject = storyData.filter(function (storyObject) {
    return storyObject.id === 'intro';
  })[0];
  
  elements.player.style.display = 'block';
  setupWave();
  updatePage(introObject);
}

// Aktualisiere die Inhalte der Seite und den Audio-Player
function updatePage(storyObject) {
  updateContent(storyObject);
  updatePlayer(storyObject);
}

// Aktualisiere Titel, Text und Optionen mit den Inhalten des jeweils ausgewählten Kapitels
function updateContent(storyObject) {
  elements.content.innerHTML = '';

  // Erstelle die Überschrift
  var title = document.createElement('h1');
  title.className = 'title';
  title.textContent = storyObject.title || '';
  elements.content.appendChild(title);

  // Erstelle Text
  var text = document.createElement('p');
  text.className = 'text';
  text.textContent = storyObject.text  || '';
  elements.content.appendChild(text);

  // Erstelle Verpackung für die Buttons
  var optionsWrapper = document.createElement('p');
  optionsWrapper.className = 'options';
  elements.content.appendChild(optionsWrapper);

  // Erstelle Buttons für die jeweils zur Auswahl stehenden Kapitel
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

  // Erstelle Untertitel
  var caption = document.createElement('p');
  caption.className = 'caption';
  caption.textContent = storyObject.caption  || '';
  elements.content.appendChild(caption);
}

// Erstelle einen neuen Audio-Player, der die Audiospur (MP3) des jeweils ausgewählten Kapitels abspielt
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
    color: '#cccccc',
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
