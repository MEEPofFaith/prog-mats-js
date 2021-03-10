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
  recoil: -10,
  colors: [Color.valueOf("f3e97966"), col, Color.white],
  itemCapacity: 15,
  range(){
    return this.length * 6;
  }
});

const laser = extendContent(Weapon, sentryDash.name + "-laser", {
  bullet: dash,
  rotate: true,
  rotateSpeed: 60,
  reload: 20,
  x: 0,
  y: -8/4,
  shootY: 17/4,
  mirror: false,
  top: true,
  shootCone: 2,
  shootSound: Sounds.laser
});

sentryDash.weapons.add(laser);