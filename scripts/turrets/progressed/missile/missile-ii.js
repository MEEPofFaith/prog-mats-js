const bul = require("libs/bulletTypes/strikeBulletType");
const particle = require("libs/bulletTypes/particleBulletType");
const paralyze = require("libs/statusEffects/paralizeStatus");
const suffering = require("libs/statusEffects/teleportStatus");
const type = require("libs/turretTypes/missileTurretType");
const eff = require("libs/effect");

const citem = name => Vars.content.getByName(ContentType.item, "prog-mats-" + name);

const trail = eff.trailEffect(120, 300, -1);
trail.layer = Layer.bullet;

const boom = eff.scaledLargeBlast(1.5);

//(autodrop, drop radius, stop?, stop radius, unstop?, start on owner, given data, snap rot, extra stuff);

const missile = bul.strikeBullet(true, 15, true, 10, true, true, false, false, {
  sprite: "prog-mats-strikeb",
  riseEngineSize: 16,
  fallEngineSize: 8,
  trailSize: 0.7,
  damage: 80,
  splashDamage: 750,
  splashDamageRadius: 64,
  speed: 2,
  homingPower: 0.05,
  homingRange: 330,
  lifetime: 180,
  elevation: 300,
  riseTime: 45,
  fallTime: 25,
  hitSound: Sounds.bang,
  hitShake: 8,
  trailParam: 5,
  trailChance: 0.2,
  trailEffect: trail,
  despawnEffect: boom,
  riseSpin: 360,
  fallSpin: 135
});
missile.unitSort = (u, x, y) => -u.maxHealth + Mathf.dst2(x, y, u.x, u.y)/1000;

const emp = bul.strikeBullet(true, 35, true, 10, true, true, false, false, {
  sprite: "prog-mats-emp-strikeb",
  reloadMultiplier: 0.25,
  riseEngineSize: 16,
  fallEngineSize: 8,
  trailSize: 0.7,
  damage: 80,
  splashDamage: 150,
  splashDamageRadius: 48,
  speed: 3,
  homingPower: 0.075,
  homingRange: 330,
  lifetime: 120,
  elevation: 300,
  riseTime: 35,
  fallTime: 15,
  hitSound: Sounds.bang,
  hitShake: 8,
  trailParam: 5,
  trailChance: 0.2,
  trailEffect: trail,
  despawnEffect: boom,
  riseSpin: 270,
  fallSpin: 90,
  fragBullets: 360,
  fragVelocityMin: 0.5
});
// (name, dmgMult, healthMult, speedMult, reloadMult, dmgTick, rotRnd)
emp.fragBullet = particle.particleBullet(Pal.lancerLaser, Sounds.spark, 0.5, 0.7, 1, {});
emp.fragBullet.status = paralyze.paralizeStatus("prog-mats-no", 0.9, 1, 0.04, 0.55, 3, 8, false, 60 * 10 / 2);
emp.fragBullet.statusDuration = 60 * 10;

const quantum = bul.strikeBullet(true, 25, true, 10, true, true, false, false, {
  sprite: "prog-mats-quantum-strikeb",
  reloadMultiplier: 0.1,
  riseEngineSize: 16,
  fallEngineSize: 8,
  trailSize: 0.7,
  damage: 80,
  splashDamage: 60,
  splashDamageRadius: 48,
  speed: 1.8,
  homingPower: 0.075,
  homingRange: 330,
  lifetime: 200,
  elevation: 300,
  riseTime: 30,
  fallTime: 25,
  hitSound: Sounds.bang,
  hitShake: 8,
  trailParam: 5,
  trailChance: 0.2,
  trailEffect: trail,
  despawnEffect: boom,
  riseSpin: 270,
  fallSpin: 90,
  fragBullets: 360,
  fragVelocityMin: 0.5
});
// (name, dmgMult, healthMult, speedMult, reloadMult, dmgTick, rotRnd)
quantum.fragBullet = particle.particleBullet(Color.valueOf("EFE4CA"), Sounds.sap, 0.25, 0.7, 1, {});
quantum.fragBullet.status = suffering.teleportStatus("prog-mats-yeeteth", 1, 1, 1, 1, 0, 40, 0.5, 60 * 10 / 2);
quantum.fragBullet.statusDuration = 60 * 10;
quantum.fragBullet.speed = 3;
quantum.fragBullet.lifetime = 48;

const ohnoMissilesReturns = type.missileTurret(false, ItemTurret, ItemTurret.ItemTurretBuild, "missile-ii", {
  health: 2870,
  size: 4,
  range: 330,
  reloadTime: 180,
  shootSound: Sounds.explosionbig,
  cooldown: 0.001,
  shootShake: 5,
  inaccuracy: 5,
  
  maxAmmo: 5,
  nitSort: (u, x, y) => -u.maxHealth
}, {});
/**
 * Easy to read research requirement list
 *
 * copper/69
**/
// ohnoMissilesReturns.requirements(Category.turret, BuildVisibility.sandboxOnly, ItemStack.with(Items.copper, 69));
ohnoMissilesReturns.requirements = ItemStack.with(Items.copper, 69);
ohnoMissilesReturns.category = Category.turret;
ohnoMissilesReturns.buildVisibility = BuildVisibility.sandboxOnly;

ohnoMissilesReturns.ammo(citem("basic-missile"), missile, citem("emp-missile"), emp, citem("quantum-missile"), quantum);

/**
  * Plans:
  *
  * Swarm Missiles (3x3 / 4x4 idk)
  * Name: 
  * Info: Quick, 9 firing silos, lower homing and start in random directions. Shorter lifetime. Don't resume seek. Faster target. Only targets ground.
  * Research: impact0078
  *
  * Strike Missiles (4x4) (this)
  * Name: Strikedown
  * Info: Moderate speed, fires single high damage missile. Longer lifetime. Instantly drops when over target.
  * Research: NPC, launchpad
  *
  * Nuclear Missiles (6x6)
  * Name: Arbiter
  * Info: Slow. Does as the name says. F u c k i n g   n u k e s   e v e r y t h i n g . Slower target.
  * Research: ILC, interplanetary accelerator
**/