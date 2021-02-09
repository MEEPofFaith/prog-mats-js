const bul = require("libs/bulletTypes/strikeBulletType");
const particle = require("libs/bulletTypes/particleBulletType");
const paralyze = require("libs/statusEffects/paralizeStatus");
const suffering = require("libs/statusEffects/teleportStatus");
const type = require("libs/turretTypes/missileTurretType");
const eff = require("libs/effect");

const citem = name => Vars.content.getByName(ContentType.item, "prog-mats-" + name);

const trail = eff.trailEffect(120, -1);
trail.layer = Layer.bullet;

const boom = eff.scaledLargeBlast(1.5);

//(autodrop, drop radius, stop?, stop radius, unstop?, start on owner, given data);

const missile = bul.strikeBullet(true, 15, true, 10, true, true, false);
missile.sprite = "prog-mats-strikeb";
missile.riseEngineSize = 16;
missile.fallEngineSize = 8;
missile.trailSize = 0.7;
missile.damage = 80;
missile.splashDamage = 750;
missile.splashDamageRadius = 64;
missile.speed = 2;
missile.homingPower = 0.05;
missile.homingRange = 320;
missile.lifetime = 175;
missile.elevation = 300;
missile.riseTime = 45;
missile.fallTime = 25;
missile.hitSound = Sounds.bang;
missile.hitShake = 8;
missile.trailParam = 5;
missile.trailChance = 0.2;
missile.trailEffect = trail;
missile.despawnEffect = boom;
missile.riseSpin = 360;
missile.fallSpin = 135;
missile.unitSort = (u, x, y) => -u.maxHealth + Mathf.dst2(x, y, u.x, u.y)/1000;

const emp = bul.strikeBullet(true, 30, true, 10, true, true, false);
emp.sprite = "prog-mats-emp-strikeb";
emp.reloadMultiplier = 0.25;
emp.riseEngineSize = 16;
emp.fallEngineSize = 8;
emp.trailSize = 0.7;
emp.damage = 80;
emp.splashDamage = 150;
emp.splashDamageRadius = 48;
emp.speed = 3;
emp.homingPower = 0.075;
emp.homingRange = 320;
emp.lifetime = 120;
emp.elevation = 300;
emp.riseTime = 35;
emp.fallTime = 15;
emp.hitSound = Sounds.bang;
emp.hitShake = 8;
emp.trailParam = 5;
emp.trailChance = 0.2;
emp.trailEffect = trail;
emp.despawnEffect = boom;
emp.riseSpin = 270;
emp.fallSpin = 90;
emp.fragBullets = 360;
emp.fragVelocityMin = 0.5;
// (name, dmgMult, healthMult, speedMult, reloadMult, dmgTick, rotRnd)
emp.fragBullet = particle.particleBullet(Pal.lancerLaser);
emp.fragBullet.status = paralyze.paralizeStatus("prog-mats-no", 0.9, 1, 0.04, 0.55, 3, 8, 60 * 10 / 2);
emp.fragBullet.statusDuration = 60 * 10;

const quantum = bul.strikeBullet(true, 30, true, 10, true, true, false);
quantum.sprite = "prog-mats-quantum-strikeb";
quantum.reloadMultiplier = 0.1;
quantum.riseEngineSize = 16;
quantum.fallEngineSize = 8;
quantum.trailSize = 0.7;
quantum.damage = 80;
quantum.splashDamage = 60;
quantum.splashDamageRadius = 48;
quantum.speed = 2.3;
quantum.homingPower = 0.075;
quantum.homingRange = 320;
quantum.lifetime = 135;
quantum.elevation = 300;
quantum.riseTime = 30;
quantum.fallTime = 25;
quantum.hitSound = Sounds.bang;
quantum.hitShake = 8;
quantum.trailParam = 5;
quantum.trailChance = 0.2;
quantum.trailEffect = trail;
quantum.despawnEffect = boom;
quantum.riseSpin = 270;
quantum.fallSpin = 90;
quantum.fragBullets = 360;
quantum.fragVelocityMin = 0.5;
// (name, dmgMult, healthMult, speedMult, reloadMult, dmgTick, rotRnd)
quantum.fragBullet = particle.particleBullet(Color.valueOf("EFE4CA"));
quantum.fragBullet.status = suffering.teleportStatus("prog-mats-yeeteth", 1, 1, 1, 1, 20, 40, 60 * 10 / 2);
quantum.fragBullet.statusDuration = 60 * 10;
quantum.fragBullet.speed = 3;
quantum.fragBullet.lifetime = 96;

const ohnoMissilesReturns = type.missileTurret(false, ItemTurret, ItemTurret.ItemTurretBuild, "missile-ii", {
  health: 2870,
  size: 4,
  range: 280,
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