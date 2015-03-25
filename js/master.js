var contextInputHistogram;
var contextInputAccumulated;
var contextOutputHistogram;
var contextOutputAccumulated;
var imgInput;
var imgOutput;

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
  loadImage(files[0]);
}

function loadImage(file) {
  var fileReader = new FileReader();


  fileReader.onloadend = function() {
    imgInput.src = fileReader.result;
  }

  imgInput.onload = function() {
    var imageData = getImageData(imgInput);
    var histogram = getHistogram(imageData);
    drawGraph(contextInputHistogram, histogram.normalized);
    drawGraph(contextInputAccumulated, histogram.accumulated);

    var equalisedImage = equalise(histogram, imageData);
    var equalisedHistogram = getHistogram(equalisedImage);
    imgOutput.src=getImage(equalisedImage);
    drawGraph(contextOutputHistogram, equalisedHistogram.normalized);
    drawGraph(contextOutputAccumulated, equalisedHistogram.accumulated);
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

function getImage(imageData) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var result;

  canvas.width = imageData.width;
  canvas.height = imageData.height;

  context.putImageData(imageData, 0, 0);

  result = canvas.toDataURL();
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

function equalise(histogram, imageData) {
  var accumulated = [];
  var acc = 0;
  var newImageData = new Object(imageData);
  var size = newImageData.width * newImageData.height;
  var equalised = histogram.accumulated;


  for (var i = 0; i < size; i += 1) {
    newImageData.data[i*4] = equalised[imageData.data[i*4]] * 255;
    newImageData.data[i*4+1] = equalised[imageData.data[i*4+1]] * 255;
    newImageData.data[i*4+2] = equalised[imageData.data[i*4+2]] * 255;
  }

  return imageData;
}

window.addEventListener('load', function() {
  contextInputHistogram = document.querySelector('.input .histogram').getContext('2d');
  contextInputAccumulated = document.querySelector('.input .accumulated').getContext('2d');
  contextOutputHistogram = document.querySelector('.output .histogram').getContext('2d');
  contextOutputAccumulated = document.querySelector('.output .accumulated').getContext('2d');
  imgInput = document.querySelector('.input .image');
  imgOutput = document.querySelector('.output .image');

  var inputBox = document.querySelector('.input .image');
  inputBox.addEventListener('dragover', dragOverHandler);
  inputBox.addEventListener('drop', dropHandler);
  inputBox.addEventListener('dragenter', dragEnterHandler);
  inputBox.addEventListener('dragleave', dragLeaveHandler);
});
