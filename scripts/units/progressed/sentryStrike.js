const sentryUnitType = require("libs/unit/sentryUnit");
const strike = require("libs/bulletTypes/strikeBulletType");
const eff = require("libs/effect");

const sentryStrike = sentryUnitType.sentryUnit("strike-sentry");

const trail = eff.trailEffect(50, 100, -1);
trail.layer = Layer.bullet;

const boom = eff.scaledLargeBlast(0.5);

const mis = strike.strikeBullet(true, 8, true, 4, true, false, true, false, {
  sprite: "prog-mats-storm",
  engineSize: 5,
  trailSize: 0.2,
  damage: 28,
  splashDamage: 72,
  splashDamageRadius: 30,
  speed: 2.4,
  homingPower: 0.035,
  homingRange: 200,
  cooldown: 0.001,
  lifetime: 90,
  elevation: 300,
  riseTime: 30,
  fallTime: 20,
  ammmoMultiplier: 4,
  targetRad: 0.5,
  hitSound: Sounds.explosion,
  collidesAir: false,
  hitShake: 3,
  trailParam: 3,
  trailEffect: trail,
  despawnEffect: boom
});

const silo = extendContent(Weapon, sentryStrike.name + "-hole", {
  bullet: mis,
  rotate: false,
  mirror: false,
  alternate: false,
  top: false,
  reload: 15,
  x: 0,
  y: 0,
  recoil: 0,
  shootY: 0,
  shootCone: 360,
  shootSound: Sounds.missile
});

sentryStrike.weapons.add(silo);