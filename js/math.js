function fromPoint(p, d, theta) {
  return p.add(Vector.create([Math.cos(theta), Math.sin(theta)]).x(d))
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
    return M.subtract(r);
  } else {
    return R1;
  }
}