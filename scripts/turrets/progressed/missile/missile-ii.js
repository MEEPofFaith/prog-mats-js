const bul = require("libs/bulletTypes/strikeBulletType");
const shock = require("libs/bulletTypes/empSparkBulletType");
const type = require("libs/turretTypes/missileTurretType");
const eff = require("libs/effect");

const citem = name => Vars.content.getByName(ContentType.item, "prog-mats-" + name);

const trail = eff.trailEffect(120, false, 1);
trail.layer = Layer.bullet;

const boom = eff.scaledLargeBlast(1.5);

//(autodrop, drop radius, stop radius, unstop?, start on owner, given data);

const missile = bul.strikeBullet(true, 15, 10, true, true, false);
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
missile.lifetime = 300;
missile.elevation = 600;
missile.riseTime = 90;
missile.fallTime = 45;
missile.hitSound = Sounds.bang;
missile.hitShake = 8;
missile.trailParam = 5;
missile.trailChance = 0.2;
missile.trailEffect = trail;
missile.despawnEffect = boom;
missile.riseSpin = 360;
missile.fallSpin = 135;
missile.unitSort = (u, x, y) => -u.maxHealth + Mathf.dst2(x, y, u.x, u.y)/1000;

const emp = bul.strikeBullet(true, 30, 10, true, true, false);
emp.sprite = "prog-mats-emp-strikeb";
emp.reloadMultiplier = 0.75;
emp.riseEngineSize = 16;
emp.fallEngineSize = 8;
emp.trailSize = 0.7;
emp.damage = 80;
emp.splashDamage = 150;
emp.splashDamageRadius = 48;
emp.speed = 3;
emp.homingPower = 0.075;
emp.homingRange = 320;
emp.lifetime = 240;
emp.elevation = 600;
emp.riseTime = 70;
emp.fallTime = 30;
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
emp.fragBullet = shock.spark("prog-mats-no", 0.9, 1, 0.04, 0.55, 10, 20);

const ohnoMissilesReturns = type.missileTurret(false, ItemTurret, ItemTurret.ItemTurretBuild, "missile-ii", {}, {});
/**
 * Easy to read research requirement list
 *
 * copper/69
**/
// ohnoMissilesReturns.requirements(Category.turret, BuildVisibility.sandboxOnly, ItemStack.with(Items.copper, 69));
ohnoMissilesReturns.requirements = ItemStack.with(Items.copper, 69);
ohnoMissilesReturns.category = Category.turret;
ohnoMissilesReturns.buildVisibility = BuildVisibility.sandboxOnly;

ohnoMissilesReturns.ammo(citem("basic-missile"), missile, citem("emp-missile"), emp);
ohnoMissilesReturns.maxAmmo = 5;
ohnoMissilesReturns.unitSort = (u, x, y) => -u.maxHealth;

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