
const groundTolerance = 5.0;

function Leg() {
  this.startGroundAngle = 0;
  this.stopGroundAngle = 0;

  this.points = {
    A : this.enrich('A', Vector.create([0,0])), AC: 0,
    B : this.enrich('B', Vector.create([0,0])), BD: 0, BE: 0, BF: 0,
    C : this.enrich('C', Vector.create([0,0])), CD: 0, CE: 0,
    D : this.enrich('D', Vector.create([0,0])), DF: 0,
    F : this.enrich('E', Vector.create([0,0])), FG: 0,
    E : this.enrich('F', Vector.create([0,0])), EG: 0, EH: 0,
    G : this.enrich('G', Vector.create([0,0])), GH: 0,
    H : this.enrich('H', Vector.create([0,0])),
    Bx: 0, By: 0
  };

  this.angle = 0;
}

Leg.prototype.setValues = function (values) {
  for (var key in values) {
    if (values.hasOwnProperty(key)) {
      this.setValue(key, values[key]);
    }
  }
};

Leg.prototype.setValue = function (key, p) {
  this.points[key] = p;
};

Leg.prototype.getValues = function (keys) {
  var result = [];

  for (var i in keys) {
    if (keys.hasOwnProperty(i)) {
      result.push(this.points[keys[i]]);
    }
  }

  return result;
};

Leg.prototype.enrich = function (key, p) {
  p.angle = this.angle;
  p.label = key;

  return p;
};

Leg.prototype.addPoint = function (key, p) {
  this.setValue(key, this.enrich(key, p));
};

Leg.prototype.tick = function (dt) {
  this.angle += dt;
  this.angle %= 360;
};

Leg.prototype.update = function (angleOffset, index, mirrored) {
  var ps = this.points;

  this.addPoint('A', Vector.create([offsetAx, offsetAy]));
  if (mirrored) {
    this.addPoint('B', Vector.create([offsetAx - ps.Bx, offsetAy - ps.By]));
  } else {
    this.addPoint('B', Vector.create([offsetAx + ps.Bx, offsetAy - ps.By]));
  }
  this.addPoint('C', fromPoint(ps.A, ps.AC, radians(this.angle) + (angleOffset * index)));

  if (!mirrored) {
    this.addPoint('D', inter(ps.C, ps.CD, ps.B, ps.BD));
    this.addPoint('E', inter(ps.B, ps.BE, ps.C, ps.CE));
    this.addPoint('F', inter(ps.D, ps.DF, ps.B, ps.BF));
    this.addPoint('G', inter(ps.F, ps.FG, ps.E, ps.EG));
    this.addPoint('H', inter(ps.G, ps.GH, ps.E, ps.EH));
  } else {
    this.addPoint('D', inter(ps.B, ps.BD, ps.C, ps.CD));
    this.addPoint('E', inter(ps.C, ps.CE, ps.B, ps.BE));
    this.addPoint('F', inter(ps.B, ps.BF, ps.D, ps.DF));
    this.addPoint('G', inter(ps.E, ps.EG, ps.F, ps.FG));
    this.addPoint('H', inter(ps.E, ps.EH, ps.G, ps.GH));
  }

  return this.getValues(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
};