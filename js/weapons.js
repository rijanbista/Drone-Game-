export function createWeaponSystem() {
  return {
    current: "small",

    ammo: {
      small: { count: Infinity, reload: 0.2, cooldown: 0 },
      big: { count: Infinity, reload: 0.6, cooldown: 0 },
      nuke: { count: 1, reload: 3, cooldown: 0 }
    },

    cost: {
      small: 5,
      big: 10,
      nuke: 50
    }
  };
}