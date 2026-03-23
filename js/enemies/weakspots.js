export function applyWeakspots(enemy) {
  // Preserve existing weakSpots if properly formatted from the enemy file
  if (!enemy.weakSpots || enemy.weakSpots.length === 0 || !enemy.weakSpots[0].offset) {
    if (enemy.type === "infantry") {
      enemy.weakSpots = [
        { offset: { x: 0, y: 1.0, z: -0.2 }, radius: 0.55, multiplier: 1.8 }
      ];
    } else if (enemy.type === "car") {
      enemy.weakSpots = [
        { offset: { x: 0, y: 0.5, z: -1.5 }, radius: 0.8, multiplier: 2.0 }
      ];
    } else if (enemy.type === "jeep") {
      enemy.weakSpots = [
        { offset: { x: 0, y: 0.5, z: -1.4 }, radius: 0.85, multiplier: 2.0 }
      ];
    } else if (enemy.type === "truck") {
      enemy.weakSpots = [
        { offset: { x: 0, y: 1.0, z: -2.2 }, radius: 0.9, multiplier: 1.9 }
      ];
    } else if (enemy.type === "tank") {
      enemy.weakSpots = [
        { offset: { x: 0, y: 0.8, z: -2.4 }, radius: 0.95, multiplier: 2.3 },
        { offset: { x: 0, y: 0.8, z: -0.1 }, radius: 1.0, multiplier: 1.7 }
      ];
    } else if (enemy.type === "chopper") {
      enemy.weakSpots = [
        { offset: { x: 0, y: -0.5, z: -2.0 }, radius: 0.9, multiplier: 2.1 }
      ];
    } else {
      enemy.weakSpots = [];
    }
  }

  return enemy;
}