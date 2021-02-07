const sentryUnitType = require("libs/unit/sentryUnit");

const sentryI = sentryUnitType.sentryUnit("sentry-i");

const bul = extend(BasicBulletType, {
  sprite: "bullet",
  damage: 20,
  speed: 3,
  width: 3,
  height: 4,
  homingPower: 0.11,
  homingRange: 128,
  lifetime: 80
});

const cannon = extendContent(Weapon, "large-weapon", {});
cannon.bullet = bul;
cannon.rotate = false;
cannon.reload = 6;
cannon.alternate = true;
cannon.x = 16/4;
cannon.y = 9/4;
cannon.recoil = 7/4;
cannon.shootX = -2.5/4;
cannon.ejectEffect = Fx.casing1;
cannon.top = false;

sentryI.weapons.add(cannon);