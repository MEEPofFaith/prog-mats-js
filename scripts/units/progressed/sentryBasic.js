const sentryUnitType = require("libs/unit/sentryUnit");

const sentryBasic = sentryUnitType.sentryUnit("basic-sentry", {
  duration: 15 * 60
});

const bul = extend(BasicBulletType, {
  sprite: "bullet",
  damage: 20,
  speed: 3,
  width: 7,
  height: 9,
  homingPower: 0.11,
  homingRange: 128,
  lifetime: 80
});

const cannon = extendContent(Weapon, "large-weapon", {
  bullet: bul,
  rotate: false,
  reload: 6,
  alternate: true,
  x: 16/4,
  y: 9/4,
  recoil: 7/4,
  shootX: -2.5/4,
  ejectEffect: Fx.casing1,
  top: false
});

sentryBasic.weapons.add(cannon);