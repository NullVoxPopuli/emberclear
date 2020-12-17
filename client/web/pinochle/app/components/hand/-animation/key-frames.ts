import { circleFromThreePoints } from 'pinochle/utils/trig';
import { radiansToDegrees } from 'pinochle/utils/trig';

export function stackedKeyframes({ path, positions }: ReturnType<typeof getPoints>) {
  return positions.map((_position, i) => {
    return {
      transform: `translate3d(${0 - 0.5 * i}%, ${0 - 0.5 * i}%, 0)`,
      transformOrigin: `50% ${path.y}px`,
    };
  });
}

export function fannedKeyframes({ path, positions }: ReturnType<typeof getPoints>) {
  let { viewportWidth } = path;
  let numCards = positions.length;
  let widthOfCard = viewportWidth / numCards;

  return positions.map((position, i) => {
    return {
      transform: `
        rotate(${radiansToDegrees(position.rad)}deg)
        translate3d(calc(${0 - 0.5 * i}% - ${widthOfCard}px), ${0 - 0.5 * i}%, 0)
      `,
      transformOrigin: `50% ${path.y / 2}px`,
    };
  });
}

export function flatKeyframes({ path, positions }: ReturnType<typeof getPoints>) {
  let { viewportWidth } = path;
  let numCards = positions.length;

  return positions.map((_position, i) => {
    return {
      transform: `
        rotate(0deg)
        translate3d(${((viewportWidth * 0.8) / numCards) * (i - numCards / 2)}px, 0, 0)
      `,
      transformOrigin: `50% ${path.y / 2}px`,
    };
  });
}

/**
 *
 * Returns points along the arc of a circle clipped by the viewport where
 * the outside points have a reasonable amount of padding from the window
 * edge
 *
 * The circle is initally defined by 3 points:
 *  - midpoint along X + some percent height for Y / top of the circle
 *  - bottom-left corner
 *  - bottom-right corner
 *
 * NOTES:
 *   rad = Math.atan2(y - cy, x - cx)
 *
 *   when a is radians:
 *     x = cx + r * cos(a)
 *     y = cy + r * sin(a)
 *
 * It's been a long while since I've done trig. :D
 */
export function getPoints(num: number) {
  let viewportWidth = window.innerWidth;
  let left = 0;
  let right = viewportWidth;
  let bottom = window.innerHeight;

  let { x: circleX, y: circleY, r: circleRadius } = circleFromThreePoints(
    { x: left, y: bottom * 0.8 },
    { x: viewportWidth * 0.6, y: bottom * 0.7 },
    { x: right, y: bottom + 0.8 }
  );

  // given the bottom of the window as an "ok" Y, find the two X values for the circle at that Y
  let leftAngle = Math.atan2(bottom - circleY, left - circleX);
  let rightAngle = Math.atan2(bottom - circleY, right - circleX);

  // divide the angle by num + 2 to account for some padding
  let totalAngle = rightAngle - leftAngle; // leftAngle - rightAngle;
  let arcWidth = totalAngle / (num + 6);

  let positions = Array(num)
    .fill(undefined)
    .map((_, i) => {
      // let angle = rightAngle + i * arcWidth;

      return {
        // x: circleX + circleRadius * Math.cos(angle),
        // y: circleY + circleRadius + Math.sin(angle),
        // rad: rightAngle - (i * arcWidth),
        rad: (i - num / 2) * arcWidth,
      };
    });

  return {
    path: {
      x: circleY,
      y: circleY,
      radius: circleRadius,
      viewportWidth,
    },
    positions,
  };
}
