if (String.prototype.startsWith === undefined) {
  String.prototype.startsWith = function(str) {
    return this.indexOf(str) === 0;
  };
}

if (Element.prototype.remove === undefined) {
  Element.prototype.remove = function() {
    if (this.parentElement) {
      this.parentElement.removeChild(this);
    }
  };
}