/* © 2009 ROBO Design
 * http://www.robodesign.ro
 */

// Keep everything in anonymous function, called on window load.
if(window.addEventListener) {
window.addEventListener('load', function () {
  var canvas, context, canvaso, contexto;

  // The active tool instance.
  var tool;
  var tool_default = 'line';

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
      window.open("file:///Users/isabellabosetti/spe2015/github/Paintwork/lists.html"); //change to own directory
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
      tool.x0 = ev._x;
      tool.y0 = ev._y;
      //////save start coordinates
      start_x = ev._x;
      start_y = ev._y;
      new_line.coords = [];
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.moveTo(tool.x0, tool.y0);
      context.lineTo(ev._x,   ev._y);
      context.lineWidth = 5;
      context.strokeStyle = 'LightSkyBlue';
      context.stroke();
      context.closePath();
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        end_x = ev._x; //save end coords
        end_y = ev._y; //save end coords
        tool.started = false;
        img_update();
        //////append new line to list of lists
        objects.push({type:"line", coords:[start_x, start_y, end_x, end_y]});
      }
    }
  };

    // The circle tool.
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
      context.arc(tool.x0, tool.y0, radius, 0, 2 * Math.PI);
      context.fillStyle = '#FFFF99';
      context.fill();
      context.strokeStyle = '#FFFF99';
      context.stroke();
      context.closePath();
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
        ///add circle
        objects.push({type:"circle", coords:[tool.x0, tool.y0, radius]});
      }
    };
  };

  tools.circle2 = function () {
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
      context.arc(tool.x0 - delta_x*0.5, tool.y0 - delta_y*0.5, (radius * 0.5), 0, 2 * Math.PI);
      context.fillStyle = 'LightGreen';
      context.fill();
      context.strokeStyle = 'LightGreen';
      context.stroke();
      context.closePath();
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update();
        //add circle to list of circles
        objects.push({type:"circle", coords:[tool.x0 - delta_x*0.5, tool.y0 - delta_y*0.5, (radius * 0.5)]});
      }
    };
  };

  //stamp type
  tools.stamp = function () {
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
      context.arc(tool.x0, tool.y0, 5, 0, 2 * Math.PI);
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
        objects.push({type:"stamp", coords:[tool.x0, tool.y0]});
      }
    };
  };

//rectangle tool
  tools.rectangle = function () {
    var tool = this;
    this.started = false;

    var end_x = 0;
    var end_y = 0;

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
      //first line- horizontal line from start point
        context.beginPath();
      context.moveTo(tool.x0, tool.y0);
      context.lineTo(ev._x,   tool.y0);
      context.lineTo(ev._x,   ev._y);
      context.lineTo(tool.x0,   ev._y);
      context.lineTo(tool.x0,   tool.y0);
      context.closePath();
      context.fillStyle = "LightPink";
      context.fill();
      context.strokeStyle='LightPink';
      context.stroke();

    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        end_x = ev._x; //save end coords
        end_y = ev._y; //save end coords
        tool.started = false;
        img_update();
        //append new rect coord to list of lists of rect
        objects.push({type:"rectangle", coords:[tool.x0, tool.y0, ev._x, ev._y]});
      }
    };
  };


//triangle tool
// The right triangle tool.
  tools.rt_tri = function() {
    var tool = this;
    this.started = false;
    
    var start_x = 0;
    var start_y = 0;
    var end_x = 0;
    var end_y = 0;
    
    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
      //////save start coordinates
      start_x = ev._x;
      start_y = ev._y;
    };
    
    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.moveTo(tool.x0, tool.y0);
      context.lineTo(ev._x,   ev._y);
      context.lineTo(start_x,   ev._y);
      context.lineTo(start_x,   start_y);
      context.strokeStyle = '#F6C0F6';
      context.stroke();
      context.fillStyle = "#F6C0F6";
      context.fill();
      
     
      context.stroke();
      context.closePath();
    };
    
     this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        end_x = ev._x; //save end coords
        end_y= ev._y; //save end coords
        tool.started = false;
        img_update();
        //////append new line to list of lists
        objects.push({type:"triangle", coords:[start_x, start_y, start_x, end_y, end_x, start_y]});
      }
    };
  
  };

tools.region = function() {
  this.mousemove = function (ev) {
    if (objects.length > 0) {
      check_region(ev._x, ev._y);
    } 
  }

  function check_region(x, y) {
    //check pixel color
    var data = context.getImageData(x, y, 1, 1).data;
    var r = data[0];
    var b = data[1];
    var g = data[2];
    if (r == 144 && b == 238 && g == 144 ||
    r == 255 && b == 255 && g == 153 ||
    r == 255 && b == 182 && g == 193 ||
    r == 246 && b == 192 && g == 246 ||
    r == 135 && b == 206 && g == 250){
         check_objects(x, y);
  }
  }

  function check_objects(x, y) {
    //parse through objects
  }

  function object(obj) {
    if(obj.type = '')
      obj.coords = cords;akdfajsdklfasd
  }
}


  init();

}, false); }
