export function createWeaponSystem() {
  return {
    current: "small",
    isReloading: false,
    reloadTimer: 0,

    ammo: {
      small: { count: Infinity, reloadTime: 0.15, cooldown: 0 },
      big: { count: Infinity, reloadTime: 0.8, cooldown: 0 },
      nuke: { count: 1, reloadTime: 4.0, cooldown: 0 }
    },

    cost: {
      small: 8,
      big: 25,
      nuke: 120
    }
  };
}