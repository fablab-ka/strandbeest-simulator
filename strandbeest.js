// Theo Jansen's STRANDBEEST
// <http://strandbeest.com/>
// Code derived from http://garethrees.org/2011/07/04/strandbeest/
// and 
// <http://stackoverflow.com/questions/6573415/evolutionary-algorithm-for-the-theo-jansen-walking-mechanism>

const offsetAx = 450;
const offsetAy = 200;
const groundTolerance = 5.0;

function fromPoint(p, d, theta) {
  return p.add(Vector.create([Math.cos(theta), Math.sin(theta)]).x(d))
}

function moveTo(p) {
  context.moveTo(p.elements[0], p.elements[1])
}

function lineTo(p) {
  context.lineTo(p.elements[0], p.elements[1])
}

function radians(d) {
  return d * Math.PI / 180
}

// Return 2-dimensional vector cross product of p and q.
function cross2(p, q) {
  var P = p.elements;
  var Q = q.elements;
  return P[0] * Q[1] - P[1] * Q[0]
}

// Return a point R that's distance l1 from p1, and distance l2 from p2,
// and p1-p2-R is clockwise.
function inter(p1, l1, p2, l2) {
  var D = p2.subtract(p1);                // Vector from p1 to p2.
  var d = D.modulus();                    // Dist from p2 to p1.
  var a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);  // Dist from p1 to radical line.
  var M = p1.add(D.x(a / d));             // Intersection of D w/radical line
  var h = Math.sqrt(l1 * l1 - a * a);         // Distance from M to R1 or R2.
  var R = D.x(h / d);
  var r = Vector.create([-R.elements[1], R.elements[0]]);
  // There are two results, but only one (the correct side of the
  // line) must be chosen
  var R1 = M.add(r);
  if (cross2(D, R1.subtract(p1)) < 0) {
    return M.subtract(r)
  } else {
    return R1
  }
}

function drawPoint(p) {
  context.beginPath();
  context.arc(p.elements[0], p.elements[1], 5, 0, 2 * Math.PI, true);
  context.fill();
  if (optionDrawLabels && p.label) {
    context.fillText(p.label, p.elements[0] + 15, p.elements[1] + 20)
  }
}

function Beest() {
  this.angle = 0;
  this.startGroundAngle = 0;
  this.stopGroundAngle = 0;
  this.lines = ["AB", "AC", "CD", "BD", "BE", "CE",
    "DF", "BF", "FG", "EG", "GH", "EH"];
  this.magic = ["Bx", "By"].concat(this.lines);
  this.update();

  this.A  = 0;
  this.AC = 0;
  this.B  = 0;
  this.BD = 0;
  this.BE = 0;
  this.BF = 0;
  this.C  = 0;
  this.CD = 0;
  this.CE = 0;
  this.D = 0;
  this.DF = 0;
  this.F  = 0;
  this.FG = 0;
  this.E  = 0;
  this.EG = 0;
  this.EH = 0;
  this.G  = 0;
  this.GH = 0;
  this.H  = 0;
}

Beest.prototype = {
  constructor: Beest,

  update: function () {
    var form = document.forms[0];
    for (var i = 0; i < this.magic.length; ++i) {
      var m = this.magic[i];
      this[m] = parseFloat(form[m].value)
    }
    this.mirrorLegs = document.forms[0].mirrorLegs.checked;
    this.tolerance = groundTolerance
  },

  addPoint: function (label, p) {
    p.angle = this.angle;
    p.label = label;
    this.points.push(p);
    this[label] = p
  },

  draw: function () {
    var xPlotWidth = canvas.width - 20;
    var xPlotSteps = 360;
    var xPlotDistance = xPlotWidth / xPlotSteps;
    var legColors = ["#0000BB", "#33FF44", "#DD0000", "#00BBBB"];
    var legCount = document.getElementById("numLegs");
    var numLegs = legCount.options[legCount.selectedIndex].value;
    var AngleOffset = 2 * Math.PI / numLegs;
    for (var legs = 1; legs <= numLegs; legs++) {
      this.points = [];
      this.addPoint("A", Vector.create([offsetAx, offsetAy]));
      this.addPoint("B", Vector.create([offsetAx + this.Bx, offsetAy - this.By]));
      this.addPoint("C", fromPoint(this.A, this.AC, radians(this.angle) + (AngleOffset * (legs - 1))));
      this.addPoint("D", inter(this.C, this.CD, this.B, this.BD));
      this.addPoint("E", inter(this.B, this.BE, this.C, this.CE));
      this.addPoint("F", inter(this.D, this.DF, this.B, this.BF));
      this.addPoint("G", inter(this.F, this.FG, this.E, this.EG));
      this.addPoint("H", inter(this.G, this.GH, this.E, this.EH));
      context.beginPath();
      context.strokeStyle = legColors[legs - 1];
      context.lineWidth = 2.5;
      for (var k = 0; k < this.lines.length; ++k) {
        moveTo(this[this.lines[k][0]]);
        lineTo(this[this.lines[k][1]]);
      }
      context.stroke();
      for (var j = 0; j < this.points.length; ++j) {
        drawPoint(this.points[j]);
      }
      context.stroke();
      if (this.mirrorLegs) {
        this.points = [];
        this.addPoint("A", Vector.create([offsetAx, offsetAy]));
        this.addPoint("B", Vector.create([offsetAx - this.Bx, offsetAy - this.By]));
        this.addPoint("C", fromPoint(this.A, this.AC, radians(this.angle) + (AngleOffset * (legs - 1))));
        this.addPoint("D", inter(this.B, this.BD, this.C, this.CD));
        this.addPoint("E", inter(this.C, this.CE, this.B, this.BE));
        this.addPoint("F", inter(this.B, this.BF, this.D, this.DF));
        this.addPoint("G", inter(this.E, this.EG, this.F, this.FG));
        this.addPoint("H", inter(this.E, this.EH, this.G, this.GH));
        context.beginPath();
        context.strokeStyle = legColors[legs - 1];
        context.lineWidth = 2.5;
        for (var l = 0; l < this.lines.length; ++l) {
          moveTo(this[this.lines[l][0]]);
          lineTo(this[this.lines[l][1]]);
        }
        context.stroke();
        for (var i = 0; i < this.points.length; ++i) {
          drawPoint(this.points[i]);
        }
        context.stroke();
      }
      context.beginPath();
      context.strokeStyle = "#EEEE00";
      context.fillStyle = legColors[numLegs - legs];
      context.arc((canvas.width - 10) - (((this.angle + 540 - this.startGroundAngle - (((360 / numLegs) * legs) % 360)) % 360) * xPlotDistance), canvas.height - 10, 5, 0, 2 * Math.PI, true);
      context.fill();
      context.stroke();
      context.fillStyle = "#000000";
    }
  },

  drawAnalysis: function () {
    // Draw footprint.
    contextA.beginPath();
    var m = 0;
    var lastStatus = this.footprint[m].grounded;
    contextA.strokeStyle = (lastStatus ? "#aaf" : "#faa");
    contextA.moveTo(this.footprint[m].elements[0], this.footprint[m].elements[1]);
    while (m < this.footprint.length) {
      contextA.lineTo(this.footprint[m].elements[0], this.footprint[m].elements[1]);
      if (lastStatus != this.footprint[m].grounded) {
        contextA.strokeStyle = (lastStatus ? "#faa" : "#aaf");
        lastStatus = this.footprint[m].grounded;
        contextA.stroke();
        contextA.beginPath();
        contextA.moveTo(this.footprint[m].elements[0], this.footprint[m].elements[1])
      }
      m++
    }
    contextA.strokeStyle = (lastStatus ? "#faa" : "#aaf");
    contextA.lineTo(this.footprint[0].elements[0], this.footprint[0].elements[1]);
    contextA.stroke();

    if (this.mirrorLegs) {
      contextA.beginPath();
      var j = 0;
      var lastStatusMirror = this.footprint[j].grounded;
      contextA.strokeStyle = (lastStatusMirror ? "#aaf" : "#faa");
      var mirroredX = 2 * offsetAx - this.footprint[j].elements[0];
      contextA.moveTo(mirroredX, this.footprint[j].elements[1]);
      while (j < this.footprint.length) {
        mirroredX = 2 * offsetAx - this.footprint[j].elements[0];
        contextA.lineTo(mirroredX, this.footprint[j].elements[1]);
        if (lastStatusMirror != this.footprint[j].grounded) {
          contextA.strokeStyle = (lastStatusMirror ? "#faa" : "#aaf");
          lastStatusMirror = this.footprint[j].grounded;
          contextA.stroke();
          contextA.beginPath();
          mirroredX = 2 * offsetAx - this.footprint[j].elements[0];
          contextA.moveTo(mirroredX, this.footprint[j].elements[1])
        }
        j++
      }
      contextA.strokeStyle = (lastStatusMirror ? "#faa" : "#aaf");
      mirroredX = 2 * offsetAx - this.footprint[0].elements[0];
      contextA.lineTo(mirroredX, this.footprint[0].elements[1]);
      contextA.stroke();
    }
    //draw circle around A
    contextA.beginPath();
    contextA.strokeStyle = "#faa";
    contextA.arc(this.A.elements[0], this.A.elements[1], this.AC, radians(this.startGroundAngle), radians(this.stopGroundAngle));
    contextA.stroke();
    contextA.beginPath();
    contextA.strokeStyle = "#aaf";
    contextA.arc(this.A.elements[0], this.A.elements[1], this.AC, radians(this.stopGroundAngle), radians(this.startGroundAngle));
    contextA.stroke();

    //velocity line at the bottom
    contextA.beginPath();
    contextA.strokeStyle = "#000000";
    contextA.moveTo(canvasA.width - 10, canvasA.height - 10);
    contextA.lineTo(10, canvasA.height - 10);
    contextA.stroke();

    var xPlotWidth = canvasA.width - 20;
    var xPlotSteps = 360;
    var xPlotDistance = xPlotWidth / xPlotSteps;

    contextA.beginPath();
    contextA.strokeStyle = "#334455";
    contextA.lineWidth = 0.5;
    for (var i = 0; i <= xPlotSteps; i += 5) {
      contextA.moveTo(canvasA.width - 10 - (i * xPlotDistance), canvasA.height - 5);
      contextA.lineTo(canvasA.width - 10 - (i * xPlotDistance), canvasA.height - 15)
    }
    contextA.stroke();

    contextA.beginPath();
    contextA.strokeStyle = "#FF1111";
    contextA.lineWidth = 1.5;
    var distance = 0;
    for (i = 0; i <= 360; i++) {
      var xPos = (540 - this.startGroundAngle + i) % 360;
      if (this.footprint[i % 360].grounded) {
        distance = this.footprint[i % 360].elements[0] - this.footprint[(i + 359) % 360].elements[0];
        if (xPos == 0) {
          contextA.moveTo((canvasA.width - 10), canvasA.height - 10 + (distance * 20));
        } else {
          contextA.lineTo((canvasA.width - 10) - (xPos * xPlotDistance), canvasA.height - 10 + (distance * 20));
        }
      } else {
        contextA.moveTo((canvasA.width - 10) - (xPos * xPlotDistance), canvasA.height - 10 + (distance * 20));
      }
    }
    contextA.stroke();

    if (this.mirrorLegs) {
      contextA.beginPath();
      contextA.strokeStyle = "#FF1111";
      contextA.lineWidth = 1.5;
      for (i = 0; i <= 360; i++) {
        xPos = (720 - this.startGroundAngle - i) % 360;
        if (this.footprint[i % 360].grounded) {
          distance = this.footprint[i % 360].elements[0] - this.footprint[(i + 359) % 360].elements[0];
          if (xPos == 359) {
            contextA.moveTo((canvasA.width - 10) - (xPos * xPlotDistance), canvasA.height - 10 + (distance * 20));
          } else {
            contextA.lineTo((canvasA.width - 10) - (xPos * xPlotDistance), canvasA.height - 10 + (distance * 20));
          }
        } else {
          contextA.moveTo((canvasA.width - 10) - (xPos * xPlotDistance), canvasA.height - 10 + (distance * 20));
        }
      }

      contextA.stroke();
    }
  },


  rememberSettings: function () {
    var log = document.getElementById("log");
    var tr = document.createElement("tr");
    log.appendChild(tr);
    var td = document.createElement("td");
    tr.appendChild(td);
    var img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    img.width = 100;
    img.height = 100;
    td.appendChild(img);

    td = document.createElement("td");
    tr.appendChild(td);
    var pre = document.createElement("code");
    td.appendChild(pre);
    var text = "";
    for (var j = 0; j < this.magic.length; ++j) {
      var n = this.magic[j];
      text += n + "=" + this[n] + "; ";
    }
    var dummy = Vector.create(this.footprint[this.startGroundAngle].elements);
    var distance = dummy.distanceFrom(Vector.create(this.footprint[this.stopGroundAngle].elements));

    text += '<br/>ground angle: ' + (360 + (this.stopGroundAngle - this.startGroundAngle)) % 360 + '°  ground distance: ' + distance.toFixed(1);
    text += '<br/>';
    pre.innerHTML = text;

    button = document.createElement("input");
    td.appendChild(button);
    button.type = "button";
    button.value = "Restore";
    button.beest = this;
    for (var i = 0; i < this.magic.length; ++i) {
      var m = this.magic[i];
      button[m] = this[m];
    }
    button.onclick = function () {
      this.beest.restore(this);
    };

    var button = document.createElement("input");
    td.appendChild(button);
    button.type = "button";
    button.value = "Delete";
    button.onclick = function () {
      button.parentElement.parentElement.remove();
    }

  },

  restore: function (button) {
    var form = document.forms[0];
    for (var i = 0; i < this.magic.length; ++i) {
      var m = this.magic[i];
      form[m].value = button[m];
    }
    this.update()
  },

  tick: function (dt) {
    this.angle += dt;
    this.angle %= 360;
  },

  analyzeGeometry: function () {
    this.linkageBroken = false;
    var longestGround = 0;
    var longestGroundStart = 0;

    this.startGroundAngle = 0;
    this.stopGroundAngle = 0;

    //two-pass analysis:
    for (var pass = 1; pass <= 2; pass++) {
      this.footprint = [];
      for (var angle = 0; angle < 360; angle++) {
        this.points = [];
        this.addPoint("A", Vector.create([offsetAx, offsetAy]));
        switch (pass) {
          case 1:
            //First loop:  AB with 0°, ground is not horizontal
            this.addPoint("B", Vector.create([offsetAx - this.AB, offsetAy]));
            break;
          case 2:
            //Pass 2:  After Rotation use Bx;By, so ground will be horizontal
            this.addPoint("B", Vector.create([offsetAx + this.Bx, offsetAy - this.By]));
            break
        }
        this.addPoint("C", fromPoint(this.A, this.AC, radians(angle)));
        this.addPoint("D", inter(this.C, this.CD, this.B, this.BD));
        this.addPoint("E", inter(this.B, this.BE, this.C, this.CE));
        this.addPoint("F", inter(this.D, this.DF, this.B, this.BF));
        this.addPoint("G", inter(this.F, this.FG, this.E, this.EG));
        this.addPoint("H", inter(this.G, this.GH, this.E, this.EH));
        if (isNaN(this.H.elements[0]) || isNaN(this.H.elements[1])) {
          this.linkageBroken = true;
          break
        } else {
          this.footprint.push(this.H);
        }
      }
      var form = document.forms[0];
      if (this.linkageBroken == false) {
        /* Construction is valid and can be further analyzed
         1.) Find the longest straight line in the footprint of "H"
         2.) Check the angle of this line against the X-axis and rotate the construction against this angle that ground is parallel to X
         3.) Rotation is done by setting the angle of AB, in detail: Bx and By
         4.) Calculate the corresponding rotation angle of AC, within H touches plane ground
         */
        for (var o = 0; o < this.footprint.length; o++) {
          var line = Line.create(this.footprint[o].elements, $V(this.footprint[(o + 15) % 360].elements).subtract($V(this.footprint[o].elements)));
          var ground = true;
          var j;
          for (j = 0; j <= 15; j++) {
            if (line.distanceFrom(this.footprint[(o + j) % 360].elements) > this.tolerance) {
              ground = false;
              break
            }
          }
          while (ground) {
            if (longestGround < j) {
              longestGround = j;
              longestGroundStart = o;
            }
            j++;
            line = Line.create(this.footprint[o].elements, $V(this.footprint[(o + j) % 360].elements).subtract(this.footprint[o].elements));
            for (var k = 0; k <= j; k++) {
              if (line.distanceFrom(this.footprint[(o + k) % 360].elements) > this.tolerance) {
                ground = false;
                break
              }
            }
          }
          this.footprint[o].grounded = false; //default
        }
        if (pass == 1) {
          var linePass1 = Line.create(this.footprint[longestGroundStart].elements, $V(this.footprint[(longestGroundStart + longestGround) % 360].elements).subtract($V(this.footprint[longestGroundStart].elements)));
          this.Bx = parseFloat(form["Bx"].value = (this.AB * linePass1.direction.elements[0]).toFixed(1));
          this.By = parseFloat(form["By"].value = (this.AB * linePass1.direction.elements[1]).toFixed(1));
          form["alpha"].value = (Math.atan(linePass1.direction.elements[1] / linePass1.direction.elements[0]) * 180 / Math.PI).toFixed(1);
        }
      } else {
        form["Bx"].value = "Err";
        form["By"].value = "Err";
        form["alpha"].value = "Err";

      }
    }
    this.startGroundAngle = longestGroundStart;
    this.stopGroundAngle = (longestGroundStart + longestGround) % 360;
    for (var i = longestGroundStart; i <= longestGroundStart + longestGround; i++) {
      this.footprint[i % 360].grounded = true;
    }
  }

}; // beest prototype

var canvas;
var context;
var canvasA;
var contextA;
var paused = false;
var optionDrawLabels = false;
var beest;
var nextLoop;

function beestTick() {
  window.clearTimeout(nextLoop); //avoid zombie loops through double-clicking start

  optionDrawLabels = document.forms[0].drawLabels.checked;
  beest.tick(1); // one degree per tick
  var canvasRoot = document.getElementById("canvasbox");
  canvas.width = parseInt(canvasRoot.style.width);
  canvas.height = parseInt(canvasRoot.style.height);

  context.font = "italic small-caps normal 26px arial";
  context.fillStyle = "#000";
  context.textAlign = "center";
  context.textBaseline = "middle";

  if (!beest.linkageBroken) {
    beest.draw();
    nextLoop = window.setTimeout(beestTick, 5 * document.getElementById("speed").value);
  }
}

function beestPause(button) {
  // stop drawing, when paused. Avoid unnecessary loops!
  paused = !paused;
  if (paused) {
    window.clearTimeout(nextLoop);
    button.value = "Play "
  } else {
    button.value = "Pause";
    beestTick();
  }
}

function beestUpdate() {
  window.clearTimeout(nextLoop);
  beest.update();
  beest.analyzeGeometry();
  if (!beest.linkageBroken) {
    var canvasRoot = document.getElementById("canvasbox");
    canvasA.width = parseInt(canvasRoot.style.width);
    canvasA.height = parseInt(canvasRoot.style.height);
    beest.drawAnalysis();
    beest.rememberSettings();
    beestTick()
  }
}

function beestSave() {
  window.open(canvas.toDataURL("image/png"), new Date().getTime().toString());
}


function beestStart() {
  canvas = document.getElementById("strandbeest");
  context = canvas.getContext("2d");
  context.globalAlpha = 0.4;
  canvasA = document.getElementById("analysis");
  contextA = canvasA.getContext("2d");
  beest = new Beest();
  beestUpdate();
}

window.onload = beestStart;


