function Music(obj) {
  this.source = null;
  this.count = 0;
  this.analyser = Music.ac.createAnalyser();
  this.size = obj.size;
  this.analyser.fftSize = this.size * 2;
  this.gainNode = Music.ac[Music.ac.createGain ? "createGain" : "createGainNode"]();
  this.gainNode.connect(Music.ac.destination);
  this.analyser.connect(this.gainNode);
  this.xhr = new XMLHttpRequest();
  this.visualizer = obj.visualizer;
  this.visualize();
  this.initCallback=null;
}

Music.ac = new(window.AudioContext || window.webkitAudioContext)();

Music.prototype.play = function(path) {
  //1ajax请求
  var n = ++this.count;
  var self = this;
  this.source && this.stop();
  if(path instanceof ArrayBuffer){
    self.decode(path,function(buffer){
      if (n != self.count) return;
      var bs = Music.ac.createBufferSource();
      bs.connect(self.analyser);
      bs.buffer = buffer;
      bs[bs.start ? "start" : "noteOn"](0);
      self.source = bs;
    })
  }
  if(typeof(path)==='string'){
      this.load(path, function(arraybuffer) {
    if (n != self.count) return;
    self.decode(arraybuffer, function(buffer) {
      if (n != self.count) return;
      var bs = Music.ac.createBufferSource();
      bs.connect(self.analyser);
      bs.buffer = buffer;
      bs[bs.start ? "start" : "noteOn"](0);
      self.source = bs;
    })
  });
  }

  //2解码
}

Music.prototype.load = function(url, fun) {
  
  this.xhr.abort();
  this.xhr.open('GET', url);
  this.xhr.responseType = 'arraybuffer';
  var self = this;
  this.xhr.onload = function() {
    fun(self.xhr.response);
  }
  this.xhr.send();
}

Music.prototype.decode = function(arraybuffer, fun) {
  Music.ac.decodeAudioData(arraybuffer, function(buffer) {
    fun(buffer);
  }, function(err) {})
}
Music.prototype.stop = function() {
  this.source[this.source.stop ? "stop" : "noteOff"](0);
}
Music.prototype.changeVolume = function(percent) {
  this.gainNode.gain.value = percent * percent;
}
Music.prototype.visualize = function() {
  var self = this;
  var arr = new Uint8Array(self.analyser.frequencyBinCount);
  requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame;

  function v() {
    self.analyser.getByteFrequencyData(arr);
    self.visualizer(arr);
    requestAnimationFrame(v);
  }
  requestAnimationFrame(v);
}

