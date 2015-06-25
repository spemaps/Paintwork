/* © 2009 ROBO Design
 * http://www.robodesign.ro
 */

// Keep everything in anonymous function, called on window load.
////////~~~if(window.addEventListener) {
////////~~~window.addEventListener('load', function () {
  var canvas, context, canvaso, contexto;

  // The active tool instance.
  var tool;
  var tool_default = 'circle';

  function init () {
    // Find the canvas element.
    canvaso = document.getElementById('imageView');

    // Get the 2D canvas context.
    contexto = canvaso.getContext('2d');

    // Add the temporary canvas.
    var container = canvaso.parentNode;
    canvas = document.createElement('canvas');

    canvas.id     = 'imageTemp';
    canvas.width  = canvaso.width;
    canvas.height = canvaso.height;
    container.appendChild(canvas);

    context = canvas.getContext('2d');

    // Get the tool select input.
    var tool_select = document.getElementById('dtool');
    tool_select.addEventListener('change', ev_tool_change, false);

    // Activate the default tool.
    if (tools[tool_default]) {
      tool = new tools[tool_default]();
      tool_select.value = tool_default;
    }

    //work with the lines button
    var coords_select = document.getElementById('button');
    coords_select.addEventListener('click', clickCoords, false);

    function clickCoords(ev) {
      sessionStorage.objects = JSON.stringify(objects);
      window.open("file:///Users/Angela/spe/lists.html"); //change to own directory
    }

    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
  }

  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {
    if (ev.layerX || ev.layerX == 0) { // Firefox
      ev._x = ev.layerX;
      ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
  }

  // The event handler for any changes made to the tool selector.
  function ev_tool_change (ev) {
    if (tools[this.value]) {
      tool = new tools[this.value]();
    }
  }

  // This function draws the #imageTemp canvas on top of #imageView, after which 
  // #imageTemp is cleared. This function is called each time when the user 
  // completes a drawing operation.
  function img_update () {
    contexto.drawImage(canvas, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // This object holds the implementation of each drawing tool.
  var tools = {};

  var objects = [];
  var circles = [];

  // The line tool.
  tools.line = function () {
    var tool = this;
    this.started = false;

    var start_x = 0;
    var start_y = 0;
    var end_x = 0;
    var end_y = 0;

    this.mousedown = function (ev) {
      tool.started = true;
      var coords = closest(ev._x, ev._y);
      start_x = coords[0];
      start_y = coords[1];
    };

    //closest function
    //find circle closest to x, y
    function closest(x, y){
          var close = [];
          var distance = Infinity;
          for (var i = 0; i < circles.length; i++) {
            var c = circles[i];
            var d = (x - c[0])*(x - c[0]) + (y - c[1])*(y - c[1]);
            if (d < distance) {
              close = c;
              distance = d;
            }
          }
          //return array of closest circle center coordinates
          return close;
      };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();
      context.moveTo(start_x, start_y);
      var coords = closest(ev._x, ev._y);
      context.lineTo(coords[0], coords[1]);
      end_x = coords[0];
      end_y = coords[1];
      context.lineWidth = 2;
      context.strokeStyle = 'black';
      context.stroke();
      context.closePath();
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
        //////append new line to list of lists
        objects.push({type:"line", coords:[start_x, start_y, end_x, end_y]});
      }
    }
  };

  //stamp type
  tools.circle = function () {
    var tool = this;
    this.started = false;

    var delta_x, delta_y, radius;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      delta_x = tool.x0 - ev._x;
      delta_y = tool.y0 - ev._y;
      radius = Math.sqrt((delta_x)*(delta_x) + (delta_y)*(delta_y));

      context.clearRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.arc(tool.x0, tool.y0, 5, 0, 2 * Math.PI)
      context.fillStyle = 'black';
      context.fill();
      context.strokeStyle = 'black';
      context.stroke();
      context.closePath();
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
        circles.push([tool.x0, tool.y0]);
        objects.push({type:"circle", coords:[tool.x0, tool.y0]});
      }
    };
  };

  //~~~~~~~~~init();

//~~~~~~~}, false); }

if(window.addEventListener) {
    window.addEventListener('load', init(), false)
}

// vim:set spell spl=en fo=wan1croql tw=80 ts=2 sw=2 sts=2 sta et ai cin fenc=utf-8 ff=unix:
