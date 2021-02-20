const bul = require("libs/bulletTypes/strikeBulletType");
const particle = require("libs/bulletTypes/particleBulletType");
const paralyze = require("libs/statusEffects/paralizeStatus");
const type = require("libs/turretTypes/missileTurretType");
const eff = require("libs/effect");

const citem = name => Vars.content.getByName(ContentType.item, "prog-mats-" + name);

const smallTrail = eff.trailEffect(120, 200, -1);
smallTrail.layer = Layer.bullet;
const trail = eff.trailEffect(240, 400, -1);
trail.layer = Layer.bullet;

const smallBoom = eff.scaledLargeBlast(1.5);
const boom = eff.scaledNuclearExplosion(4, 0.75, 80, true);

//(autodrop, drop radius, stop?, stop radius, unstop?, start on owner, given data, snap rot, extra stuff);

const missile = bul.strikeBullet(true, 30, true, 20, true, true, false, false, {});
missile.sprite = "prog-mats-nukeb";
missile.riseEngineSize = 24;
missile.fallEngineSize = 14;
missile.trailSize = 0.7;
missile.damage = 300;
missile.splashDamage = 27000;
missile.splashDamageRadius = 240;
missile.speed = 1;
missile.homingPower = 0.05;
missile.homingRange = 2200;
missile.lifetime = 2250;
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

const emp = bul.strikeBullet(true, 80, true, 20, true, true, false, false, {});
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
emp.homingRange = 2200;
emp.lifetime = 1125;
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
emp.fragBullet = particle.particleBullet(Pal.lancerLaser, Sounds.spark, 1, 0.4, 0.7, {});
emp.fragBullet.status = paralyze.paralizeStatus("prog-mats-cease", 0.8, 0.9, 0.02, 0.5, 5, 15, false, 60 * 12 / 2);
emp.fragBullet.speed = 12;
emp.fragBullet.lifetime = 48;
emp.fragBullet.statusDuration = 60 * 12;

const clusterFrag = bul.strikeBullet(false, 15, false, 10, true, true, false, false, {});
clusterFrag.sprite = "prog-mats-cluster-nukeb-frag";
clusterFrag.riseEngineSize = -1;
clusterFrag.fallEngineSize = 8;
clusterFrag.trailSize = 0.7;
clusterFrag.damage = 80;
clusterFrag.splashDamage = 3000;
clusterFrag.splashDamageRadius = 96;
clusterFrag.speed = 1;
clusterFrag.homingPower = -1;
clusterFrag.lifetime = 150;
clusterFrag.elevation = 900;
clusterFrag.riseTime = -1;
clusterFrag.fallTime = 75;
clusterFrag.hitSound = Sounds.bang;
clusterFrag.hitShake = 8;
clusterFrag.trailParam = 5;
clusterFrag.trailChance = 0.2;
clusterFrag.trailEffect = smallTrail;
clusterFrag.despawnEffect = smallBoom;
clusterFrag.riseSpin = 360;
clusterFrag.fallSpin = 135;

const cluster = bul.strikeBullet(true, 60, true, 20, true, true, false, false, {});
cluster.sprite = "prog-mats-cluster-nukeb";
cluster.riseEngineSize = 24;
cluster.fallEngineSize = -1;
cluster.trailSize = 0.7;
cluster.damage = 0;
cluster.splashDamage = -1;
cluster.splashDamageRadius = 0;
cluster.speed = 1;
cluster.homingPower = 0.05;
cluster.homingRange = 2200;
cluster.lifetime = 2250;
cluster.elevation = 900;
cluster.riseTime = 240;
cluster.fallTime = -1;
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
cluster.fragVelocityMin = 0.3;
cluster.fragVelocityMax = 1.5;
cluster.fragLifeMin = 0.8;
cluster.fragLifeMax = 1;

const cUnit = name => Vars.content.getByName(ContentType.unit, "prog-mats-" + name);
const sentryUnits = [cUnit("sentry-i")]; //TODO when I add more sentrys add them to this list.
const items = [Items.blastCompound, Items.pyratite, Items.pyratite]

const unitDrop = bul.strikeBullet(false, 15, false, 10, true, true, false, true, {
  init(b){
    if(!b) return;
    this.super$init(b);
    
    // (Owner x, Owner y, angle, reset speed)
    // Owner coords are placed in data in case it dies while the bullet is still active. Don't want null errors.
    var x = b.owner.x;
    var y = b.owner.y;
    b.data = [x, y, 0, false];
    b.fdata = -69420;
    
    this.drawSize = this.elevation + 24;
    this.unit = sentryUnits[Mathf.round(Mathf.random(sentryUnits.length - 1))];
    this.backRegion = this.unit.icon(Cicon.full);
  },
  despawned(b){
    if(!b) return;
    
    let sentry = this.unit.spawn(b.team, b.x, b.y);
    sentry.rotation = b.rotation();
    let randomItem = items[Mathf.round(Mathf.random(items.length - 1))];
    sentry.addItem(randomItem, Mathf.random(Math.min(1, sentry.maxAccepted(randomItem)), sentry.maxAccepted(randomItem)));
    for(var i = 0; i < 4; i++) sentry.vel.add(b.vel); //It just fell from the sky, it's got to have quite a bit of velocity.
    if(Mathf.chance(0.25)) sentry.killed();
    
    this.super$despawned(b);
  },
  unit: null
});
unitDrop.sprite = "clear";
unitDrop.riseEngineSize = -1;
unitDrop.fallEngineSize = -1;
unitDrop.damage = 20;
unitDrop.splashDamageRadius = -1;
unitDrop.speed = 0.5;
unitDrop.homingPower = -1;
unitDrop.lifetime = 140;
unitDrop.elevation = 900;
unitDrop.riseTime = -1;
unitDrop.fallTime = 75;
unitDrop.hitSound = Sounds.none;
unitDrop.hitShake = 0;
unitDrop.targetRad = 0.5;
unitDrop.trailEffect = Fx.none;
unitDrop.despawnEffect = Fx.none;
unitDrop.riseSpin = 0;
unitDrop.fallSpin = 0;

const dropPod = bul.strikeBullet(true, 30, true, 20, true, true, false, false, {});
dropPod.sprite = "prog-mats-drop-podb";
dropPod.reloadMultiplier = 1.5;
dropPod.riseEngineSize = 24;
dropPod.fallEngineSize = 14;
dropPod.trailSize = 0.7;
dropPod.damage = 0;
dropPod.splashDamage = -1;
dropPod.splashDamageRadius = 0;
dropPod.speed = 2.25;
dropPod.homingPower = 0.05;
dropPod.homingRange = 2200;
dropPod.lifetime = 1000;
dropPod.elevation = 900;
dropPod.riseTime = 240;
dropPod.fallTime = -1;
dropPod.hitSound = Sounds.none;
dropPod.hitShake = 0;
dropPod.trailParam = 8;
dropPod.targetRad = 2;
dropPod.trailChance = 0.2;
dropPod.trailEffect = trail;
dropPod.despawnEffect = Fx.none;
dropPod.hitEffect = Fx.none;
dropPod.riseSpin = 720;
dropPod.fallSpin = 180;
dropPod.unitSort = (u, x, y) => -u.maxHealth + Mathf.dst2(x, y, u.x, u.y)/1000;
dropPod.fragBullets = 30;
dropPod.fragBullet = unitDrop;
dropPod.fragVelocityMin = 0.1;
dropPod.fragVelocityMax = 1.2;
dropPod.fragLifeMin = 0.5;
dropPod.fragLifeMax = 1.5;

const NUKE = type.missileTurret(false, ItemTurret, ItemTurret.ItemTurretBuild, "missile-iii", {
  health: 5950,
  size: 7,
  range: 2200,
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

NUKE.ammo(citem("basic-nuke"), missile, citem("emp-nuke"), emp, citem("cluster-nuke"), cluster, citem("sentry-nuke"), dropPod);