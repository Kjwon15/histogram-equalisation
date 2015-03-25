var contextInputImage;
var contextInputHistogram;
var contextInputAccumulated;
var contextOutputImage;
var contextOutputHistogram;
var contextOutputAccumulated;

var imageWidth;
var imageHeight;

function dragOverHandler(event) {
  event.preventDefault();
  event.stopPropagation();

  event.dataTransfer.dropEffect = 'copy';
}

function dragEnterHandler(event) {
  this.classList.add('over');
}

function dragLeaveHandler(event) {
  this.classList.remove('over');
}

function dropHandler(event) {
  event.preventDefault();
  event.stopPropagation();

  this.classList.remove('over');

  var files = event.dataTransfer.files;

  var context = this.getContext('2d');

  drawImage(files[0]);
}

function drawImage(file) {
  var fileReader = new FileReader();
  var img = new Image();
  var imageData;


  fileReader.onloadend = function() {
    imageData = fileReader.result;
    img.src = imageData;
  }

  img.onload = function() {
    imageWidth = img.naturalWidth;
    imageHeight = img.naturalHeight;
    contextInputImage.drawImage(img, 0, 0, 400, 300);
    drawHistogram(contextInputHistogram, imageData);
  }

  fileReader.readAsDataURL(file);
}

function drawHistogram(context, data) {
}

window.addEventListener('load', function() {
  contextInputImage = document.querySelector('.input .image').getContext('2d');
  contextInputHistogram = document.querySelector('.input .histogram').getContext('2d');
  contextInputAccumulated = document.querySelector('.input .accumulated').getContext('2d');
  contextOutputImage = document.querySelector('.output .image').getContext('2d');
  contextOutputHistogram = document.querySelector('.output .histogram').getContext('2d');
  contextOutputAccumulated = document.querySelector('.output .accumulated').getContext('2d');

  var inputBox = document.querySelector('.input .image');
  inputBox.addEventListener('dragover', dragOverHandler);
  inputBox.addEventListener('drop', dropHandler);
  inputBox.addEventListener('dragenter', dragEnterHandler);
  inputBox.addEventListener('dragleave', dragLeaveHandler);
});
