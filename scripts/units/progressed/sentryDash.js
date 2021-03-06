const sentryUnitType = require("libs/unit/sentryUnit");

const len = 96;

const sentryDash = sentryUnitType.sentryUnit("dash-sentry", {
  health: 450,
  rotateSpeed: 30,
  range: len * 6
});

const col = Pal.surge;

const dash = extend(LaserBulletType, {
  damage: 90,
  length: len,
  recoil: -5,
  colors: [Color.valueOf("f3e97966"), col, Color.white],
  range(){
    return this.length * 6;
  }
});

const laser = extendContent(Weapon, sentryDash.name + "-laser", {
  bullet: dash,
  rotate: false,
  reload: 40,
  x: 0,
  shootY: 9/4,
  mirror: false,
  top: true,
  shootCone: 2
});

sentryDash.weapons.add(laser);