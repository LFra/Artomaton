/**
 * Created by ludwigfrank on 18/03/2017.
 */

const d = "M0,58.071l51.485,-58.071l21.738,46.693l0,87.448l-54.894,-21.108l-18.329,-54.962Z"
const _scientific = /[\+\-]?\d*\.?\d+e[\+\-]?\d+/ig
const _svgPathExp = /[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig
const _log = console.log
_arcToBeziers = function(lastX, lastY, rx, ry, angle, largeArcFlag, sweepFlag, x, y) {
  if (lastX === x && lastY === y) {
    return;
  }
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  var angleRad = (angle % 360) * _DEG2RAD,
    cosAngle = Math.cos(angleRad),
    sinAngle = Math.sin(angleRad),
    dx2 = (lastX - x) / 2,
    dy2 = (lastY - y) / 2,
    x1 = (cosAngle * dx2 + sinAngle * dy2),
    y1 = (-sinAngle * dx2 + cosAngle * dy2),
    rx_sq = rx * rx,
    ry_sq = ry * ry,
    x1_sq = x1 * x1,
    y1_sq = y1 * y1,
    radiiCheck = x1_sq / rx_sq + y1_sq / ry_sq;
  if (radiiCheck > 1) {
    rx = Math.sqrt(radiiCheck) * rx;
    ry = Math.sqrt(radiiCheck) * ry;
    rx_sq = rx * rx;
    ry_sq = ry * ry;
  }
  var sign = (largeArcFlag === sweepFlag) ? -1 : 1,
    sq = ((rx_sq * ry_sq) - (rx_sq * y1_sq) - (ry_sq * x1_sq)) / ((rx_sq * y1_sq) + (ry_sq * x1_sq));
  if (sq < 0) {
    sq = 0;
  }
  var coef = (sign * Math.sqrt(sq)),
    cx1 = coef * ((rx * y1) / ry),
    cy1 = coef * -((ry * x1) / rx),
    sx2 = (lastX + x) / 2,
    sy2 = (lastY + y) / 2,
    cx = sx2 + (cosAngle * cx1 - sinAngle * cy1),
    cy = sy2 + (sinAngle * cx1 + cosAngle * cy1),
    ux = (x1 - cx1) / rx,
    uy = (y1 - cy1) / ry,
    vx = (-x1 - cx1) / rx,
    vy = (-y1 - cy1) / ry,
    n = Math.sqrt((ux * ux) + (uy * uy)),
    p = ux;
  sign = (uy < 0) ? -1 : 1;
  var angleStart = (sign * Math.acos(p / n)) * _RAD2DEG;

  n = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
  p = ux * vx + uy * vy;
  sign = (ux * vy - uy * vx < 0) ? -1 : 1;
  var angleExtent = (sign * Math.acos(p / n)) * _RAD2DEG;
  if (!sweepFlag && angleExtent > 0) {
    angleExtent -= 360;
  } else if (sweepFlag && angleExtent < 0) {
    angleExtent += 360;
  }
  angleExtent %= 360;
  angleStart %= 360;

  var bezierPoints = _normalizedArcToBeziers(angleStart, angleExtent),
    a = cosAngle * rx,
    b = sinAngle * rx,
    c = sinAngle * -ry,
    d = cosAngle * ry,
    l = bezierPoints.length - 2,
    i, px, py;
  //translate all the bezier points according to the matrix...
  for (i = 0; i < l; i +=  2) {
    px = bezierPoints[i];
    py = bezierPoints[i+1];
    bezierPoints[i] = px * a + py * c + cx;
    bezierPoints[i+1] = px * b + py * d + cy;
  }
  bezierPoints[bezierPoints.length-2] = x; //always set the end to exactly where it's supposed to be
  bezierPoints[bezierPoints.length-1] = y;
  return bezierPoints;
}

pathDataToBezier = function(d) {
  var a = (d + "").replace(_scientific, function(m) { var n = +m; return (n < 0.0001 && n > -0.0001) ? 0 : n; }).match(_svgPathExp) || [], //some authoring programs spit out very small numbers in scientific notation like "1e-5", so make sure we round that down to 0 first.
    path = [],
    relativeX = 0,
    relativeY = 0,
    elements = a.length,
    l = 2,
    points = 0,
    i, j, x, y, command, isRelative, segment, startX, startY, difX, difY, beziers, prevCommand;
  if (!d || !isNaN(a[0]) || isNaN(a[1])) {
    _log("ERROR: malformed path data: " + d);
    return path;
  }
  for (i = 0; i < elements; i++) {
    prevCommand = command;
    if (isNaN(a[i])) {
      command = a[i].toUpperCase();
      isRelative = (command !== a[i]); //lower case means relative
    } else { //commands like "C" can be strung together without any new command characters between.
      i--;
    }
    x = +a[i+1];
    y = +a[i+2];
    if (isRelative) {
      x += relativeX;
      y += relativeY;
    }
    if (i === 0) {
      startX = x;
      startY = y;
    }

    // "M" (move)
    if (command === "M") {
      if (segment && segment.length < 8) { //if the path data was funky and just had a M with no actual drawing anywhere, skip it.
        path.length-=1;
        l = 0;
      }
      relativeX = startX = x;
      relativeY = startY = y;
      segment = [x, y];
      points += l;
      l = 2;
      path.push(segment);
      i += 2;
      command = "L"; //an "M" with more than 2 values gets interpreted as "lineTo" commands ("L").

      // "C" (cubic bezier)
    } else if (command === "C") {
      if (!segment) {
        segment = [0, 0];
      }
      segment[l++] = x;
      segment[l++] = y;
      if (!isRelative) {
        relativeX = relativeY = 0;
      }
      segment[l++] = relativeX + a[i + 3] * 1; //note: "*1" is just a fast/short way to cast the value as a Number. WAAAY faster in Chrome, slightly slower in Firefox.
      segment[l++] = relativeY + a[i + 4] * 1;
      segment[l++] = relativeX = relativeX + a[i + 5] * 1;
      segment[l++] = relativeY = relativeY + a[i + 6] * 1;
      //if (y === segment[l-1] && y === segment[l-3] && x === segment[l-2] && x === segment[l-4]) { //if all the values are the same, eliminate the waste.
      //	segment.length = l = l-6;
      //}
      i += 6;

      // "S" (continuation of cubic bezier)
    } else if (command === "S") {
      if (prevCommand === "C" || prevCommand === "S") {
        difX = relativeX - segment[l - 4];
        difY = relativeY - segment[l - 3];
        segment[l++] = relativeX + difX;
        segment[l++] = relativeY + difY;
      } else {
        segment[l++] = relativeX;
        segment[l++] = relativeY;
      }
      segment[l++] = x;
      segment[l++] = y;
      if (!isRelative) {
        relativeX = relativeY = 0;
      }
      segment[l++] = relativeX = relativeX + a[i + 3] * 1;
      segment[l++] = relativeY = relativeY + a[i + 4] * 1;
      //if (y === segment[l-1] && y === segment[l-3] && x === segment[l-2] && x === segment[l-4]) { //if all the values are the same, eliminate the waste.
      //	segment.length = l = l-6;
      //}
      i += 4;

      // "Q" (quadratic bezier)
    } else if (command === "Q") {
      difX = x - relativeX;
      difY = y - relativeY;
      segment[l++] = relativeX + difX * 2 / 3;
      segment[l++] = relativeY + difY * 2 / 3;
      if (!isRelative) {
        relativeX = relativeY = 0;
      }
      relativeX = relativeX + a[i + 3] * 1;
      relativeY = relativeY + a[i + 4] * 1;
      difX = x - relativeX;
      difY = y - relativeY;
      segment[l++] = relativeX + difX * 2 / 3;
      segment[l++] = relativeY + difY * 2 / 3;
      segment[l++] = relativeX;
      segment[l++] = relativeY;

      i += 4;

      // "T" (continuation of quadratic bezier)
    } else if (command === "T") {
      difX = relativeX - segment[l-4];
      difY = relativeY - segment[l-3];
      segment[l++] = relativeX + difX;
      segment[l++] = relativeY + difY;
      difX = (relativeX + difX * 1.5) - x;
      difY = (relativeY + difY * 1.5) - y;
      segment[l++] = x + difX * 2 / 3;
      segment[l++] = y + difY * 2 / 3;
      segment[l++] = relativeX = x;
      segment[l++] = relativeY = y;

      i += 2;

      // "H" (horizontal line)
    } else if (command === "H") {
      y = relativeY;
      //if (x !== relativeX) {
      segment[l++] = relativeX + (x - relativeX) / 3;
      segment[l++] = relativeY + (y - relativeY) / 3;
      segment[l++] = relativeX + (x - relativeX) * 2 / 3;
      segment[l++] = relativeY + (y - relativeY) * 2 / 3;
      segment[l++] = relativeX = x;
      segment[l++] = y;
      //}
      i += 1;

      // "V" (horizontal line)
    } else if (command === "V") {
      y = x; //adjust values because the first (and only one) isn't x in this case, it's y.
      x = relativeX;
      if (isRelative) {
        y += relativeY - relativeX;
      }
      //if (y !== relativeY) {
      segment[l++] = x;
      segment[l++] = relativeY + (y - relativeY) / 3;
      segment[l++] = x;
      segment[l++] = relativeY + (y - relativeY) * 2 / 3;
      segment[l++] = x;
      segment[l++] = relativeY = y;
      //}
      i += 1;

      // "L" (line) or "Z" (close)
    } else if (command === "L" || command === "Z") {
      if (command === "Z") {
        x = startX;
        y = startY;
        segment.closed = true;
      }
      if (command === "L" || Math.abs(relativeX - x) > 0.5 || Math.abs(relativeY - y) > 0.5) {
        segment[l++] = relativeX + (x - relativeX) / 3;
        segment[l++] = relativeY + (y - relativeY) / 3;
        segment[l++] = relativeX + (x - relativeX) * 2 / 3;
        segment[l++] = relativeY + (y - relativeY) * 2 / 3;
        segment[l++] = x;
        segment[l++] = y;
        if (command === "L") {
          i += 2;
        }
      }
      relativeX = x;
      relativeY = y;

      // "A" (arc)
    } else if (command === "A") {
      beziers = _arcToBeziers(relativeX, relativeY, a[i+1]*1, a[i+2]*1, a[i+3]*1, a[i+4]*1, a[i+5]*1, (isRelative ? relativeX : 0) + a[i+6]*1, (isRelative ? relativeY : 0) + a[i+7]*1);
      for (j = 0; j < beziers.length; j++) {
        segment[l++] = beziers[j];
      }
      relativeX = segment[l-2];
      relativeY = segment[l-1];
      i += 7;

    } else {
      _log("Error: malformed path data: " + d);
    }
  }
  path.totalPoints = points + l;
  return path;
}
let data = pathDataToBezier(d)
let real = data[0]
let coordinates = []
for (let i = 0; i < real.length; i += 2) {
  let arr = []
  arr.push(Math.round( real[i] * 1e3 ) / 1e3, Math.round( real[i + 1] * 1e3 ) / 1e3)
  coordinates.push(arr)
}


console.log(JSON.stringify(coordinates))




