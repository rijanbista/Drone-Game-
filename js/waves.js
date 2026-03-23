export function getWaveSetup(wave) {
  if (wave === 1) {
    return {
      infantry: 8,
      car: 0,
      jeep: 0,
      truck: 0,
      tank: 0,
      chopper: 0,
      jammers: 0,
      objective: "Eliminate all infantry"
    };
  }

  if (wave === 2) {
    return {
      infantry: 8,
      car: 3,
      jeep: 3,
      truck: 0,
      tank: 0,
      chopper: 0,
      jammers: 0,
      objective: "Destroy light vehicles"
    };
  }

  if (wave === 3) {
    return {
      infantry: 6,
      car: 2,
      jeep: 2,
      truck: 3,
      tank: 2,
      chopper: 0,
      jammers: 0,
      objective: "Destroy tanks and trucks"
    };
  }

  if (wave === 4) {
    return {
      infantry: 6,
      car: 2,
      jeep: 2,
      truck: 3,
      tank: 2,
      chopper: 2,
      jammers: 0,
      objective: "Take down enemy choppers"
    };
  }

  if (wave === 5) {
    return {
      infantry: 7,
      car: 3,
      jeep: 3,
      truck: 3,
      tank: 2,
      chopper: 2,
      jammers: 2,
      objective: "Destroy jammer units"
    };
  }

  return {
    infantry: 6 + wave,
    car: 2 + Math.floor(wave / 2),
    jeep: 2 + Math.floor(wave / 2),
    truck: 2 + Math.floor(wave / 3),
    tank: 2 + Math.floor(wave / 3),
    chopper: 2 + Math.floor(wave / 4),
    jammers: 1 + Math.floor(wave / 4),
    objective: "Clear all hostile forces"
  };
}

export function spawnWave(enemyManager, wave) {
  const setup = getWaveSetup(wave);

  enemyManager.spawnInfantryGroup(setup.infantry);
  enemyManager.spawnCarGroup(setup.car);
  enemyManager.spawnJeepGroup(setup.jeep);
  enemyManager.spawnTruckGroup(setup.truck);
  enemyManager.spawnTankGroup(setup.tank);
  enemyManager.spawnChopperGroup(setup.chopper);
  enemyManager.assignJammers(setup.jammers);

  return setup;
}