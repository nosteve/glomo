var xpix = 8;
var ypix = 8;
var mstate = false;
// frame
var fmax = 5;
var f = 1;
var clipboard = "";

var offcolor = "000000";

// Init fx array
var fx = new Array(fmax);
for (var i=0; i < fx.length; i++) {
  fx[i] = new Array(xpix);
  for (var j=0; j < fx[i].length; j++) {
    fx[i][j] = new Array(ypix);
    // create FX objects
    for (var k=0; k < fx[i][j].length; k++) {
      fx[i][j][k] = new FX();
    }
  }
}

// Init px array
var px = new Array(xpix);
for (var i=0; i < px.length; i++) {
  px[i] = new Array(ypix);
}



function PX (canvas_id) {
  var xy = canvas_id.split("_");
  this.x = parseInt(xy[0]);
  this.y = parseInt(xy[1]);
  this.c = offcolor;
  this.cid = canvas_id;
  this.canvas = document.createElement('canvas'); 
  this.canvas.id = this.cid; 
  this.canvas.width = 30; 
  this.canvas.height = 30;
  this.canvas.addEventListener('mousedown', click, false);
  this.canvas.addEventListener('mouseover', over, false);
  this.canvas.addEventListener('mouseup', up, false);
  this.context = this.canvas.getContext("2d");
  
  //draw a box with black frame
  //frame
  this.context.fillStyle = "gray";
  //this.context.fillRect(0,0,30,0);
  //this.context.fillRect(0,0,0,30);
  //this.context.fillRect(30,0,30,30);
  //this.context.fillRect(0,30,30,30);
  this.context.fillRect(0,0,30,30);
  //white space
  this.context.fillStyle = this.c;
  this.context.fillRect(1,1,28,28);
  document.getElementById("content").appendChild(this.canvas);
}

PX.prototype = {
  set: function (color,send) {
    // Only change if it's different color
    if (this.c != color) {
      this.context.fillStyle = color;
      this.context.fillRect(1,1,28,28);
      this.c = color;
      // Set frame also
      fx[f][this.x][this.y].c = this.c;
      // Thanks Codigo Manso for zero-padding trick
      var padx = ("0" + this.x).slice (-2);
      var pady = ("0" + this.y).slice (-2);
      var colorMsg = padx + "," + pady + "," + comma(color) + "\n";
      console.log(colorMsg);
      if (send == true) {
          ws.send(colorMsg);
      }
    }
  }
};

function redraw() {
  for (var x=0; x < xpix; x++) {
    for (var y=0; y < ypix; y++) {
      px[x][y].set(fx[f][x][y].c,true);
    }
  }
}

function FX () {
  this.c = offcolor;
}

function click (ev) {
  mstate = true;
  var tid = ev.target.id;
  var xy = tid.split("_");
  //console.log(xy[0]);
  var x = parseInt(xy[0]);
  var y = parseInt(xy[1]);
  if (ev.shiftKey == true) {
    //console.log("shift on");
    col.color.fromString(px[x][y].c);
  }
  else {
  //Set current color value
    px[x][y].set(col.color.toString(),true);
  }
  //console.log(ev);
}

function over (ev) {
  if (mstate == true) {
    click(ev);
  }
}

function up (ev) {
  mstate = false;
}

function frameUp (ev) {
  if (f < fmax) {
    f++;
    for (x=0; x < xpix; x++) {
      for (y=0; y < ypix; y++) {
        px[x][y].set(fx[f][x][y].c,true);
      }
    }
  }
  console.log("frame up");
  document.getElementById("frame").innerHTML = f;
}

function frameDown (ev) {
  if (f > 1) {
    f--;
    for (x=0; x < xpix; x++) {
      for (y=0; y < ypix; y++) {
        px[x][y].set(fx[f][x][y].c,true);
      }
    }
  }
  console.log("frame down");
  document.getElementById("frame").innerHTML = f;
}

function save (ev) {
    ws.send("S\n");
}

function copyFrame (ev) {
  clipboard = JSON.stringify(fx[f]);
}

function pasteFrame (ev) {
  fx[f] = JSON.parse(clipboard);
  redraw();
}

function pasteAllFrame (ev) {
  for (var i=1; i <= fmax; i++) {
    fx[i] = JSON.parse(clipboard);
  }
  redraw();
}

function comma (color) {
  var r = color.substring(0,2);
  var g = color.substring(2,4);
  var b = color.substring(4,6);
  return(r.toUpperCase() + "," + g.toUpperCase() + "," + b.toUpperCase());
}


