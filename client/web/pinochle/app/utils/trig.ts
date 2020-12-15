type XYPoint = { x: number; y: number };

export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function radiansToDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}

/**
 * https://www.xarg.org/2018/02/create-a-circle-out-of-three-points/
 *
 * NOTE: this'll likely break if two of the points have the same value for either x or y
 */
export function circleFromThreePoints(p1: XYPoint, p2: XYPoint, p3: XYPoint) {
  let x1 = p1.x;
  let y1 = p1.y;
  let x2 = p2.x;
  let y2 = p2.y;
  let x3 = p3.x;
  let y3 = p3.y;

  let a = x1 * (y2 - y3) - y1 * (x2 - x3) + x2 * y3 - x3 * y2;

  let b =
    (x1 * x1 + y1 * y1) * (y3 - y2) +
    (x2 * x2 + y2 * y2) * (y1 - y3) +
    (x3 * x3 + y3 * y3) * (y2 - y1);

  let c =
    (x1 * x1 + y1 * y1) * (x2 - x3) +
    (x2 * x2 + y2 * y2) * (x3 - x1) +
    (x3 * x3 + y3 * y3) * (x1 - x2);

  let x = -b / (2 * a);
  let y = -c / (2 * a);

  return {
    x: x,
    y: y,
    r: Math.hypot(x - x1, y - y1),
  };
}
