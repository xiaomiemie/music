$(function() {
//柱状和圆圈都是固定的
//对于圆圈，只有在改变resize的时候才会去重新随机计算它的位置，
//一直都是重复调用draw的过程，在draw里只改变他的半径
  $('.add').on('click', function() {
    $('.addinput').click();
  });


  //1.点击左边有效果  发送ajax
  $('#list').on('click', 'li', function() {
    $('#list li').removeClass('selected');
    $(this).addClass('selected');
    mv.play("/media/" + $(this).attr('title'))
  });

  var size = 128;
  var box = $('#box');
  var height, width;
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  box.append(canvas);
  var Dots = [];
  Dots.dotMode = "random";
  var line;
  var mv = new Music({
    size: size,
    visualizer: draw
  })

  $('.addinput').on('change', function() {
    var file = this.files[0];
    var fr = new FileReader();
    fr.onload = function(e) {
      mv.play(e.target.result);
    }
    fr.readAsArrayBuffer(file);
  })

  function random(m, n) {
    return Math.round(Math.random() * (n - m) + m);
  }

  function getDots() {
    Dots = [];

    for (var i = 0; i < size; i++) {
      var x = random(0, width);
      var y = random(0, height);
      var color = "rgba(" + random(0, 255) + "," + random(0, 255) + "," +
        random(0, 255) + ",0.3)";
      var m = random(1, 4)
      Dots.push({
        x: x,
        y: y,
        dx: m,
        dx2: m,
        color: color
      })
    }
  }

  function resize() {
    height = box.height();
    width = box.width();
    canvas.height = height;
    canvas.width = width;
    line = ctx.createLinearGradient(0, 0, 0, height);
    line.addColorStop(0, 'red');
    line.addColorStop(0.5, 'yellow');
    line.addColorStop(1, 'green');
    getDots();
  }
  resize();
  $(window).on('resize', function() {
    resize();
  });

  function draw(arr) {
    ctx.clearRect(0, 0, width, height);
    var w = width / size;
    for (var i = 0; i < size; i++) {
      if (draw.type == 'column') { //重新绘制矩形 重新计算高度
        var h = arr[i] / 256 * height;
        ctx.fillRect(w * i, height - h, w * 0.6, h);
        ctx.fillStyle = line;
      } else { //重新绘制圆，但是圆的坐标颜色都是确定好了，只是根据arr去改变圆的半径
        ctx.beginPath();
        var r = 5 + arr[i] / 256 * (height > width ? width : height) / 10;
        var o = Dots[i];
        ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true);
        var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
        g.addColorStop(0, '#fff');
        g.addColorStop(1, o.color);
        ctx.fillStyle = g;
        ctx.fill();
        o.x += o.dx;
        o.x = o.x > width ? 0 : o.x;
      }

    }
  }

  draw.type = 'dot';
  //形状切换

  $('canvas').on('click', function() {
    if (draw.type == 'dot') {
      for (var i = 0; i < size; i++) {
        Dots.dotMode == "random" ? Dots[i].dx = 0 : Dots[i].dx = Dots[i].dx2
      }
      Dots.dotMode = Dots.dotMode == "random" ? "static" : "random";
    }
  })
  $('.changetype li').on('click', function() {
    $('.changetype li').removeClass('selectedbutton');
    $(this).addClass('selectedbutton');
    draw.type = $(this).data('type');
  })


  $('#volume').on('change', function() {
    mv.changeVolume(this.value / 100);
  });

})