const bul = require("libs/bulletTypes/strikeBulletType");
const shock = require("libs/bulletTypes/empSparkBulletType");
const type = require("libs/turretTypes/missileTurretType");
const eff = require("libs/effect");

const citem = name => Vars.content.getByName(ContentType.item, "prog-mats-" + name);

const smallTrail = eff.trailEffect(120, false, 1);
smallTrail.layer = Layer.bullet;
const trail = eff.trailEffect(240, false, 1);
trail.layer = Layer.bullet;

const smallBoom = eff.scaledLargeBlast(1.5);
const boom = eff.scaledNuclearExplosion(4, 0.75, 80, true);

//(autodrop, drop radius, stop? stop radius, unstop?, start on owner, given data, rise animation, fall animation);

const missile = bul.strikeBullet(true, 30, true, 20, true, true, false);
missile.sprite = "prog-mats-nukeb";
missile.riseEngineSize = 24;
missile.fallEngineSize = 14;
missile.trailSize = 0.7;
missile.damage = 300;
missile.splashDamage = 27000;
missile.splashDamageRadius = 240;
missile.speed = 1;
missile.homingPower = 0.05;
missile.homingRange = 4440;
missile.lifetime = 4500;
missile.elevation = 900;
missile.riseTime = 240;
missile.fallTime = 90;
missile.hitSound = Sounds.bang;
missile.hitShake = 30;
missile.trailParam = 8;
missile.targetRad = 2;
missile.trailChance = 0.2;
missile.trailEffect = trail;
missile.despawnEffect = boom;
missile.riseSpin = 720;
missile.fallSpin = 180;
missile.unitSort = (u, x, y) => -u.maxHealth + Mathf.dst2(x, y, u.x, u.y)/1000;

const emp = bul.strikeBullet(true, 60, true, 20, true, true, false);
emp.sprite = "prog-mats-emp-nukeb";
emp.reloadMultiplier = 0.25;
emp.riseEngineSize = 24;
emp.fallEngineSize = 14;
emp.trailSize = 0.7;
emp.damage = 300;
emp.splashDamage = 1700;
emp.splashDamageRadius = 170;
emp.speed = 2;
emp.homingPower = 0.075;
emp.homingRange = 4440;
emp.lifetime = 3600;
emp.elevation = 900;
emp.riseTime = 180;
emp.fallTime = 70;
emp.hitSound = Sounds.bang;
emp.hitShake = 30;
emp.trailParam = 8;
emp.targetRad = 2;
emp.trailChance = 0.2;
emp.trailEffect = trail;
emp.despawnEffect = boom;
emp.riseSpin = 720;
emp.fallSpin = 180;
emp.fragBullets = 360;
emp.fragVelocityMin = 0.5;
// (dmgMult, healthMult, speedMult, reloadMult, dmgTick, rotRnd)
emp.fragBullet = shock.spark("prog-mats-cease", 0.8, 0.9, 0.02, 0.5, 30, 15);
emp.fragBullet.speed = 12;
emp.fragBullet.lifetime = 48;
emp.fragBullet.statusDuration = 60 * 12;

const clusterFrag = bul.strikeBullet(false, 15, false, 10, true, true, false);
clusterFrag.sprite = "prog-mats-strikeb";
clusterFrag.riseEngineSize = 16;
clusterFrag.fallEngineSize = 8;
clusterFrag.trailSize = 0.7;
clusterFrag.damage = 500;
clusterFrag.splashDamage = 2500;
clusterFrag.splashDamageRadius = 100;
clusterFrag.speed = 1;
clusterFrag.homingPower = -1;
clusterFrag.lifetime = 150;
clusterFrag.elevation = 900;
clusterFrag.riseTime = 0;
clusterFrag.fallTime = 75;
clusterFrag.hitSound = Sounds.bang;
clusterFrag.hitShake = 8;
clusterFrag.trailParam = 5;
clusterFrag.trailChance = 0.2;
clusterFrag.trailEffect = smallTrail;
clusterFrag.despawnEffect = smallBoom;
clusterFrag.riseSpin = 360;
clusterFrag.fallSpin = 135;

const cluster = bul.strikeBullet(true, 30, true, 20, true, true, false);
cluster.sprite = "prog-mats-cluster-nukeb";
cluster.reloadMultiplier = 0.5;
cluster.riseEngineSize = 24;
cluster.fallEngineSize = 14;
cluster.trailSize = 0.7;
cluster.damage = 0;
cluster.splashDamage = -1;
cluster.splashDamageRadius = 0;
cluster.speed = 1;
cluster.homingPower = 0.05;
cluster.homingRange = 4440;
cluster.lifetime = 4500;
cluster.elevation = 900;
cluster.riseTime = 240;
cluster.fallTime = 0;
cluster.hitSound = Sounds.none;
cluster.hitShake = 0;
cluster.trailParam = 8;
cluster.targetRad = 2;
cluster.trailChance = 0.2;
cluster.trailEffect = trail;
cluster.despawnEffect = Fx.none;
cluster.hitEffect = Fx.none;
cluster.riseSpin = 720;
cluster.fallSpin = 180;
cluster.unitSort = (u, x, y) => -u.maxHealth + Mathf.dst2(x, y, u.x, u.y)/1000;
cluster.fragBullets = 20;
cluster.fragBullet = clusterFrag;
cluster.fragVelocityMin = 0.1;
cluster.fragVelocityMax = 1.6;
cluster.fragLifeMin = 0.8;
cluster.fragLifeMax = 1.2;

const NUKE = type.missileTurret(false, ItemTurret, ItemTurret.ItemTurretBuild, "missile-iii", {
  health: 5950,
  size: 7,
  range: 4400,
  shootSound: Sounds.explosionbig,
  cooldown: 0.001,
  shootShake: 10,
  reloadTime: 1500,
  shootLength: 0,
  
  maxAmmo: 2,
  unitSort: (u, x, y) => -u.maxHealth
}, {});
/**
 * Easy to read research requirement list
 *
 * copper/69
**/
// NUKE.requirements(Category.turret, BuildVisibility.sandboxOnly, ItemStack.with(Items.copper, 69));
NUKE.requirements = ItemStack.with(Items.copper, 69);
NUKE.category = Category.turret;
NUKE.buildVisibility = BuildVisibility.sandboxOnly;

NUKE.ammo(citem("basic-nuke"), missile, citem("emp-nuke"), emp, citem("cluster-nuke"), cluster);