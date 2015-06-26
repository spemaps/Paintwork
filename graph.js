/* Inspired by ROBO Design
 * https://dev.opera.com/articles/html5-canvas-painting/
 */


  var canvas, context, canvaso, contexto;
  var nodecounter = 0;

  // The active tool instance.
  var tool;
  var tool_default = 'node';

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

  var nodes = []; //array of nodes
  var edges = []; //array of the id's of the nodes

  // The edge tool.
  tools.edge = function () {
    var tool = this;
    this.started = false;

    var start_x = 0;
    var start_y = 0;
    var start_id;
    var end_id;

    this.mousedown = function (ev) {
      tool.started = true;
      var node = closest(ev._x, ev._y);
      start_x = node[0][0];
      start_y = node[0][1];
      start_id = node[1];

    };

    //closest function
    //find circle closest to x, y
    //!!! returns coords,id
    function closest(x, y){
          var close = [];
          var distance = Infinity;
          var id;
          for (var i = 0; i < nodes.length; i++) {
            var c =  nodes[i].coords; //parsing through the coords of every node
            var d = (x - c[0])*(x - c[0]) + (y - c[1])*(y - c[1]);
            if (d < distance) {
              close = c;
              distance = d;
              id = nodes[i].id;
            }
          }
          //return array of closest node center coordinates
          return [close, id];
      };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();
      context.moveTo(start_x, start_y);
      var node = closest(ev._x, ev._y);
      context.lineTo(node[0][0], node[0][1]);
      end_id = node[1];
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
        //////append new edge to array of edges
        edges.push([start_id, end_id]);
      }
    }
  };
  


  //node tool
  tools.node = function () {
    var tool = this;
    this.started = false;

    function Node(id,coords) {
      this.id = id;
      this.coords = coords;
    };

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

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
        nodes.push(Node(nodecounter,[tool.x0, tool.y0]));
        nodecounter ++; //increment node counter 
        
      }
    };
  };


if(window.addEventListener) {
    window.addEventListener('load', init(), false)
}
