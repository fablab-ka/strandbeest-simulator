const offsetAx = 450;
const offsetAy = 200;

function Beest() {
  this.leg = new Leg();
  this.footprint = [];
}

Beest.prototype.setValues = function (values) {
  this.leg.setValues(values);

  this.tolerance = groundTolerance;
};

Beest.prototype.getValue = function (key) {
  return this.leg.points[key];
};

Beest.prototype.tick = function (dt) {
  this.leg.tick(dt);
};

Beest.prototype.analyzeGeometry = function () {
  var result = {
    linkageBroken: false,
    longestGroundStart: 0,
    longestGround: 0,
    startGroundAngle: 0,
    stopGroundAngle: 0,
    values: {},
    errors: []
  };

  var ps = this.leg.points;

  //two-pass analysis:
  for (var pass = 1; pass <= 2; pass++) {
    this.footprint = [];
    for (var angle = 0; angle < 360; angle++) {
      this.leg.setValue("A", Vector.create([offsetAx, offsetAy]));
      switch (pass) {
        case 1:
          //First loop:  AB with 0°, ground is not horizontal
          this.leg.setValue("B", Vector.create([offsetAx - ps.AB, offsetAy]));
          break;
        case 2:
          //Pass 2:  After Rotation use Bx;By, so ground will be horizontal
          this.leg.setValue("B", Vector.create([offsetAx + ps.Bx, offsetAy - ps.By]));
          break
      }

      this.leg.setValue("C", fromPoint(ps.A, ps.AC, radians(angle)));
      this.leg.setValue("D", inter(ps.C, ps.CD, ps.B, ps.BD));
      this.leg.setValue("E", inter(ps.B, ps.BE, ps.C, ps.CE));
      this.leg.setValue("F", inter(ps.D, ps.DF, ps.B, ps.BF));
      this.leg.setValue("G", inter(ps.F, ps.FG, ps.E, ps.EG));
      this.leg.setValue("H", inter(ps.G, ps.GH, ps.E, ps.EH));

      if (isNaN(ps.H.elements[0]) || isNaN(ps.H.elements[1])) {
        result.linkageBroken = true;
        break;
      } else {
        this.footprint.push(ps.H);
      }
    }

    if (result.linkageBroken == false) {
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
          if (result.longestGround < j) {
            result.longestGround = j;
            result.longestGroundStart = o;
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
        var linePass1 = Line.create(
          this.footprint[result.longestGroundStart].elements,
          $V(this.footprint[(result.longestGroundStart + result.longestGround) % 360].elements).subtract($V(this.footprint[result.longestGroundStart].elements)));
        var bx = parseFloat((ps.AB * linePass1.direction.elements[0]).toFixed(1));
        var by = parseFloat((ps.AB * linePass1.direction.elements[1]).toFixed(1));

        this.leg.setValue('Bx', bx);
        this.leg.setValue('By', by);

        result.values.Bx = bx;
        result.values.By = by;
        result.values.alpha = (Math.atan(linePass1.direction.elements[1] / linePass1.direction.elements[0]) * 180 / Math.PI).toFixed(1);
      }
    } else {
      result.errors.push('Bx');
      result.errors.push('By');
      result.errors.push('alpha');
    }
  }

  result.startGroundAngle = result.longestGroundStart;
  result.stopGroundAngle = (result.longestGroundStart + result.longestGround) % 360;
  for (var i = result.longestGroundStart; i <= result.longestGroundStart + result.longestGround; i++) {
    if (this.footprint[i % 360]) {
      this.footprint[i % 360].grounded = true;
    }
  }

  return result;
};

