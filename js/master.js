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
  };

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
  };

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
    context.moveTo((i + 0.5) * lineWidth, 300);
    context.lineTo((i + 0.5) * lineWidth, 300 - data[i] * 300);
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
    var r = imageData.data[i*4+0];
    var g = imageData.data[i*4+1];
    var b = imageData.data[i*4+2];
    var l = getLightness(r, g, b);
    histogram[l] += 1;
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

function getLightness(r, g, b) {
  return Math.round(r * 0.299 + g * 0.587 + b * 0.114);
}

function toYuv(r, g, b) {
  var y = r * 0.299 + g * 0.587 + b * 0.114;
  var u = 0.492 * (b - y);
  var v = 0.877 * (r - y);

  return {
    y: y,
    u: u,
    v: v,
  };
}

function toRgb(y, u, v) {
  var r = y + v * 1.14;
  var g = y - u * 0.395 - v * 0.518;
  var b = y + u * 2.033;

  return {
    r: r,
    g: g,
    b: b,
  };
}

function equalise(histogram, imageData) {
  var newImageData = new Object(imageData);
  var size = newImageData.width * newImageData.height;
  var equalised = histogram.accumulated;


  for (var i = 0; i < size; i += 1) {
    var r = newImageData.data[i*4+0];
    var g = newImageData.data[i*4+1];
    var b = newImageData.data[i*4+2];

    var yuv = toYuv(r, g, b);
    var newLightness = equalised[Math.round(yuv.y)] * 255;
    var newRgb = toRgb(newLightness, yuv.u, yuv.v);

    newImageData.data[i*4+0] = Math.round(newRgb.r);
    newImageData.data[i*4+1] = Math.round(newRgb.g);
    newImageData.data[i*4+2] = Math.round(newRgb.b);
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
