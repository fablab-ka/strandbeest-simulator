function Visualizer() {

  this.canvas = document.getElementById("strandbeest");
  this.context = this.canvas.getContext("2d");
  this.context.globalAlpha = 0.4;
  this.canvasA = document.getElementById("analysis");
  this.contextA = this.canvasA.getContext("2d");

  this.paused = false;
  this.optionDrawLabels = false;
  this.nextLoop = null;

  this.lines = ["AB", "AC", "CD", "BD", "BE", "CE", "DF", "BF", "FG", "EG", "GH", "EH"];
  this.magic = ["Bx", "By"].concat(this.lines);

  this.lastAnalysis = {
      linkageBroken: false,
      longestGroundStart: 0,
      longestGround: 0,
      startGroundAngle: 0,
      stopGroundAngle: 0
  };

  this.beest = new Beest();
  this.beest.setValues(this.getValues());
}


Visualizer.prototype.drawPoint = function (p) {
  this.context.beginPath();
  this.context.arc(p.elements[0], p.elements[1], 5, 0, 2 * Math.PI, true);
  this.context.fill();

  if (this.optionDrawLabels && p.label) {
    this.context.fillText(p.label, p.elements[0] + 15, p.elements[1] + 20)
  }
};

Visualizer.prototype.moveTo = function (p) {
  this.context.moveTo(p.elements[0], p.elements[1]);
};

Visualizer.prototype.lineTo = function(p) {
  this.context.lineTo(p.elements[0], p.elements[1]);
};

Visualizer.prototype.drawPoints = function (angleOffset, legs, legColors, mirrored) {
  var updatedPoints = this.beest.leg.update(angleOffset, legs, mirrored);

  this.context.beginPath();
  this.context.strokeStyle = legColors[legs - 1];
  this.context.lineWidth = 2.5;
  for (var k = 0; k < this.lines.length; ++k) {
    this.moveTo(this.beest.getValue(this.lines[k][0]));
    this.lineTo(this.beest.getValue(this.lines[k][1]));
  }

  this.context.stroke();
  for (var j = 0; j < updatedPoints.length; ++j) {
    this.drawPoint(updatedPoints[j]);
  }

  this.context.stroke();
  return {updatedPoints: updatedPoints, k: k, j: j};
};

Visualizer.prototype.draw = function () {
  var xPlotWidth = this.canvas.width - 20;
  var xPlotSteps = 360;
  var xPlotDistance = xPlotWidth / xPlotSteps;
  var legColors = ["#0000BB", "#33FF44", "#DD0000", "#00BBBB"];
  var legCount = document.getElementById("numLegs");
  var numLegs = legCount.options[legCount.selectedIndex].value;
  var angleOffset = 2 * Math.PI / numLegs;

  for (var legs = 1; legs <= numLegs; legs++) {
    this.drawPoints(angleOffset, legs, legColors, false);

    if (this.mirrorLegs) {
      this.drawPoints(angleOffset, legs, legColors, true);
    }

    this.context.beginPath();
    this.context.strokeStyle = "#EEEE00";
    this.context.fillStyle = legColors[numLegs - legs];
    this.context.arc((this.canvas.width - 10) - (((this.beest.angle + 540 - this.lastAnalysis.startGroundAngle - (((360 / numLegs) * legs) % 360)) % 360) * xPlotDistance), this.canvas.height - 10, 5, 0, 2 * Math.PI, true);
    this.context.fill();
    this.context.stroke();
    this.context.fillStyle = "#000000";
  }
};


Visualizer.prototype.drawCircleAroundA = function (analysisResult) {
  var A = this.beest.getValue('A');
  var AC = this.beest.getValue('AC');
  this.contextA.beginPath();
  this.contextA.strokeStyle = "#faa";
  this.contextA.arc(A.elements[0], A.elements[1], AC, radians(analysisResult.startGroundAngle), radians(analysisResult.stopGroundAngle));
  this.contextA.stroke();
  this.contextA.beginPath();
  this.contextA.strokeStyle = "#aaf";
  this.contextA.arc(A.elements[0], A.elements[1], AC, radians(analysisResult.stopGroundAngle), radians(analysisResult.startGroundAngle));
  this.contextA.stroke();
};

Visualizer.prototype.drawFootprint = function (mirrored) {
  this.contextA.beginPath();
  var m = 0;
  var lastStatus = this.beest.footprint[m].grounded;
  this.contextA.strokeStyle = (lastStatus ? "#aaf" : "#faa");

  var x = this.beest.footprint[m].elements[0];
  if (mirrored) {
    x = 2 * offsetAx - x;
  }
  this.contextA.moveTo(x, this.beest.footprint[m].elements[1]);
  while (m < this.beest.footprint.length) {
    x = this.beest.footprint[m].elements[0];
    if (mirrored) {
      x = 2 * offsetAx - x;
    }
    this.contextA.lineTo(x, this.beest.footprint[m].elements[1]);
    if (lastStatus != this.beest.footprint[m].grounded) {
      this.contextA.strokeStyle = (lastStatus ? "#faa" : "#aaf");
      lastStatus = this.beest.footprint[m].grounded;
      this.contextA.stroke();
      this.contextA.beginPath();

      x = this.beest.footprint[m].elements[0];
      if (mirrored) {
        x = 2 * offsetAx - x;
      }
      this.contextA.moveTo(x, this.beest.footprint[m].elements[1])
    }

    m++;
  }

  this.contextA.strokeStyle = (lastStatus ? "#faa" : "#aaf");
  x = this.beest.footprint[0].elements[0];
  if (mirrored) {
    x = 2 * offsetAx - x;
  }
  this.contextA.lineTo(x, this.beest.footprint[0].elements[1]);
  this.contextA.stroke();
};

Visualizer.prototype.drawVelocityLineAtBottom = function () {
  this.contextA.beginPath();
  this.contextA.strokeStyle = "#000000";
  this.contextA.moveTo(this.canvasA.width - 10, this.canvasA.height - 10);
  this.contextA.lineTo(10, this.canvasA.height - 10);
  this.contextA.stroke();
};

Visualizer.prototype.drawPlotLines = function (xPlotSteps, xPlotDistance) {
  this.contextA.beginPath();
  this.contextA.strokeStyle = "#334455";
  this.contextA.lineWidth = 0.5;
  for (var i = 0; i <= xPlotSteps; i += 5) {
    this.contextA.moveTo(this.canvasA.width - 10 - (i * xPlotDistance), this.canvasA.height - 5);
    this.contextA.lineTo(this.canvasA.width - 10 - (i * xPlotDistance), this.canvasA.height - 15)
  }
  this.contextA.stroke();
};

Visualizer.prototype.drawGroundPlot = function (analysisResult, xPlotDistance, mirrored) {
  this.contextA.beginPath();
  this.contextA.strokeStyle = "#FF1111";
  this.contextA.lineWidth = 1.5;
  var distance = 0;
  for (var i = 0; i <= 360; i++) {
    var xPos = (540 - analysisResult.startGroundAngle + i) % 360;
    if (mirrored) {
      xPos = (720 - analysisResult.startGroundAngle - i) % 360;
    }

    if (this.beest.footprint[i % 360].grounded) {
      distance = this.beest.footprint[i % 360].elements[0] - this.beest.footprint[(i + 359) % 360].elements[0];
      if (mirrored) {
        if (xPos == 359) {
          this.contextA.moveTo((this.canvasA.width - 10) - (xPos * xPlotDistance), this.canvasA.height - 10 + (distance * 20));
        } else {
          this.contextA.lineTo((this.canvasA.width - 10) - (xPos * xPlotDistance), this.canvasA.height - 10 + (distance * 20));
        }
      } else {
        if (xPos == 0) {
          this.contextA.moveTo((this.canvasA.width - 10), this.canvasA.height - 10 + (distance * 20));
        } else {
          this.contextA.lineTo((this.canvasA.width - 10) - (xPos * xPlotDistance), this.canvasA.height - 10 + (distance * 20));
        }
      }
    } else {
      this.contextA.moveTo((this.canvasA.width - 10) - (xPos * xPlotDistance), this.canvasA.height - 10 + (distance * 20));
    }
  }

  this.contextA.stroke();
};

Visualizer.prototype.drawAnalysis = function (analysisResult) {
  console.log('[Visualizer] drawAnalysis', analysisResult);

  this.drawFootprint(false);

  if (this.mirrorLegs) {
    this.drawFootprint(true);
  }

  this.drawCircleAroundA(analysisResult);

  this.drawVelocityLineAtBottom();

  var xPlotWidth = this.canvasA.width - 20;
  var xPlotSteps = 360;
  var xPlotDistance = xPlotWidth / xPlotSteps;

  this.drawPlotLines(xPlotSteps, xPlotDistance);

  this.drawGroundPlot(analysisResult, xPlotDistance, false);

  if (this.mirrorLegs) {
    this.drawGroundPlot(analysisResult, xPlotDistance, true);
  }
};


Visualizer.prototype.beestTick = function () {
  window.clearTimeout(this.nextLoop); //avoid zombie loops through double-clicking start

  this.optionDrawLabels = document.forms[0].drawLabels.checked;

  if (this.mirrorLegs !== document.forms[0].mirrorLegs.checked) {
    this.mirrorLegs = document.forms[0].mirrorLegs.checked;

    var analysisResult = this.beest.analyzeGeometry();
    if (!analysisResult.linkageBroken) {
      var canvasRoot = document.getElementById("canvasbox");
      this.canvasA.width = parseInt(canvasRoot.style.width);
      this.canvasA.height = parseInt(canvasRoot.style.height);
      this.drawAnalysis(analysisResult);
    }
  }

  this.beest.tick(1); // one degree per tick
  var canvasRoot = document.getElementById("canvasbox");
  this.canvas.width = parseInt(canvasRoot.style.width);
  this.canvas.height = parseInt(canvasRoot.style.height);

  this.context.font = "italic small-caps normal 26px arial";
  this.context.fillStyle = "#000";
  this.context.textAlign = "center";
  this.context.textBaseline = "middle";

  if (!this.lastAnalysis.linkageBroken) {
    this.draw();
    this.nextLoop = window.setTimeout(this.beestTick.bind(this), 5 * document.getElementById("speed").value);
  }
};

Visualizer.prototype.beestPause = function (button) {
  console.log('[Visualizer] beestPause');

  // stop drawing, when paused. Avoid unnecessary loops!
  this.paused = !this.paused;
  if (this.paused) {
    window.clearTimeout(this.nextLoop);
    button.value = "Play "
  } else {
    button.value = "Pause";
    this.beestTick();
  }
};

Visualizer.prototype.getValues = function () {
  var form = document.forms[0];

  var values = {};
  for (var i = 0; i < this.magic.length; ++i) {
    var m = this.magic[i];
    values[m] = parseFloat(form[m].value);
  }

  return values;
};

Visualizer.prototype.beestUpdate = function () {
  console.log('[Visualizer] beestUpdate');

  window.clearTimeout(this.nextLoop);

  this.beest.setValues(this.getValues());

  var analysisResult = this.beest.analyzeGeometry();
  this.lastAnalysis = analysisResult;

  var form = document.forms[0];

  for (var key in analysisResult.values) {
    if (analysisResult.values.hasOwnProperty(key)) {
      form[key].value = analysisResult.values[key];
    }
  }

  for (var i=0; i<analysisResult.errors; i++) {
    form[analysisResult.errors[i]].value = 'Err';
  }

  if (!analysisResult.linkageBroken) {
    var canvasRoot = document.getElementById("canvasbox");
    this.canvasA.width = parseInt(canvasRoot.style.width);
    this.canvasA.height = parseInt(canvasRoot.style.height);
    this.drawAnalysis(analysisResult);
    this.rememberSettings(analysisResult);
    this.beestTick()
  }
};


Visualizer.prototype.rememberSettings = function (analysisResult) {
  console.log('[Visualizer] rememberSettings');

  var me = this;

  var log = document.getElementById("log");
  var tr = document.createElement("tr");
  log.appendChild(tr);
  var td = document.createElement("td");
  tr.appendChild(td);
  var img = document.createElement("img");
  img.src = this.canvas.toDataURL("image/png");
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
    text += n + "=" + this.beest.getValue(n) + "; ";
  }
  var dummy = Vector.create(this.beest.footprint[analysisResult.startGroundAngle].elements);
  var distance = dummy.distanceFrom(Vector.create(this.beest.footprint[analysisResult.stopGroundAngle].elements));

  text += '<br/>ground angle: ' + (360 + (analysisResult.stopGroundAngle - analysisResult.startGroundAngle)) % 360 + '°  ground distance: ' + distance.toFixed(1);
  text += '<br/>';
  pre.innerHTML = text;

  button = document.createElement("input");
  td.appendChild(button);
  button.type = "button";
  button.value = "Restore";
  button.beest = this;
  for (var i = 0; i < this.magic.length; ++i) {
    var m = this.magic[i];
    button[m] = this.beest.getValue(m);
  }
  button.onclick = function () {
    me.beest.restore(this);
  };

  var button = document.createElement("input");
  td.appendChild(button);
  button.type = "button";
  button.value = "Delete";
  button.onclick = function () {
    button.parentElement.parentElement.remove();
  }
};

Visualizer.prototype.restore = function (button) {
  console.log('[Visualizer] restore');

  var form = document.forms[0];

  var values = {};
  for (var i = 0; i < this.magic.length; ++i) {
    var m = this.magic[i];
    form[m].value = values[m] = button[m];
  }

  this.beest.setValues(values);
};

Visualizer.prototype.beestSave = function () {
  console.log('[Visualizer] beestSave');

  window.open(this.canvas.toDataURL("image/png"), new Date().getTime().toString());
};


function ready() {
  console.log('Simulator starting up...');

  window.visualizer = new Visualizer();
  visualizer.beestUpdate();
}

window.onload = ready;