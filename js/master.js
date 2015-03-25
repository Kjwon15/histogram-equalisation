var contextInputImage;
var contextInputHistogram;
var contextInputAccumulated;
var contextOutputImage;
var contextOutputHistogram;
var contextOutputAccumulated;

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

  loadImage(files[0]);
}

function loadImage(file) {
  var fileReader = new FileReader();
  var img = new Image();


  fileReader.onloadend = function() {
    img.src = fileReader.result;
  }

  img.onload = function() {
    contextInputImage.clearRect(0, 0, 400, 300);
    contextInputImage.drawImage(img, 0, 0, 400, 300);

    var histogram = getHistogram(getImageData(img));
    drawGraph(contextInputHistogram, histogram.normalized);
    drawGraph(contextInputAccumulated, histogram.accumulated);
  }

  fileReader.readAsDataURL(file);
}

function getImageData(img) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var result;

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  context.drawImage(img, 0, 0);
  result = context.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
  canvas.remove();
  return result;
}

function drawGraph(context, data) {
  var lineWidth = 400 / 256;
  context.clearRect(0, 0, 400, 300);
  context.beginPath();
  context.lineWidth = lineWidth;
  for (var i = 0; i < 256 ; i += 1) {
    context.moveTo(i * lineWidth, 300);
    context.lineTo(i * lineWidth, 300 - data[i] * 300);
  }
  context.strokeStyle = '#ff0000';
  context.stroke();
}

function getHistogram(imageData) {
  var size = imageData.width * imageData.height;
  var histogram = [];
  var accumulated = [];
  var acc = 0;

  for (var i = 0; i< 256; i += 1) {
    histogram[i] = 0;
    accumulated[i] = 0;
  }
  for (var i = 0; i < size; i += 1) {
    histogram[imageData.data[i*4+1]] += 1;
  }

  for (var i = 0; i < 256; i += 1) {
    histogram[i] /= size;
  }

  for (var i = 0; i< 256; i += 1) {
    acc += histogram[i];
    accumulated[i] = acc;
  }

  return {
    normalized: histogram,
    accumulated: accumulated,
  };
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
