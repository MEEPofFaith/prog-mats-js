const bul = require("libs/bulletTypes/strikeBulletType");
const shock = require("libs/bulletTypes/empSparkBulletType");
const type = require("libs/turretTypes/missileTurretType");
const eff = require("libs/effect");

const citem = name => Vars.content.getByName(ContentType.item, "prog-mats-" + name);

const trail = eff.trailEffect(240, false, 1);
trail.layer = Layer.bullet;

const boom = eff.scaledNuclearExplosion(4, 0.75, 80, true);

const missile = bul.strikeBullet(true, 30, 20, true, true, false);
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

const emp = bul.strikeBullet(true, 60, 20, true, true, false);
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

const NUKE = type.missileTurret(false, ItemTurret, ItemTurret.ItemTurretBuild, "missile-iii", {}, {});
/**
 * Easy to read research requirement list
 *
 * copper/69
**/
// NUKE.requirements(Category.turret, BuildVisibility.sandboxOnly, ItemStack.with(Items.copper, 69));
NUKE.requirements = ItemStack.with(Items.copper, 69);
NUKE.category = Category.turret;
NUKE.buildVisibility = BuildVisibility.sandboxOnly;

NUKE.reloadTime = 1500;
NUKE.shootLength = 0;
NUKE.ammo(citem("basic-nuke"), missile, citem("emp-nuke"), emp);
NUKE.maxAmmo = 2;
NUKE.unitSort = (u, x, y) => -u.maxHealth;