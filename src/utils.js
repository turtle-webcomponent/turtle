export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function angleInRadians(angle) {
  return angle * Math.PI / 180
}

export function angleInDegrees(angle) {
  return angle * (180 / Math.PI)
}

export function positionWithAngle(angle, distance, position) {
  return {
    x: position.x + distance * (Math.cos(angleInRadians(angle))),
    y: position.y + distance * (Math.sin(angleInRadians(angle)))
  }
}
