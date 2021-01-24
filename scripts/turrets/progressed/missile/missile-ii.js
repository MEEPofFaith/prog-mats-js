const bul = require("libs/bulletTypes/nukeBulletType");
const type = require("libs/turretTypes/missileTurretType");
const eff = require("libs/effect");

const trail = eff.trailEffect(120, false, 1);
trail.layer = Layer.bullet;

const boom = eff.scaledLargeBlast(1.5);

const missile = bul.nukeBullet(true, 15, 10, true, true, false);
missile.sprite = "prog-mats-strike";
missile.width = 12;
missile.height = 24;
missile.riseEngineSize = 16;
missile.fallEngineSize = 8;
missile.trailSize = 0.7;
missile.damage = 80;
missile.splashDamage = 750;
missile.splashDamageRadius = 64;
missile.speed = 1;
missile.homingPower = 0.05;
missile.homingRange = 320;
missile.lifetime = 300;
missile.elevation = 600;
missile.riseTime = 90;
missile.fallTime = 45;
missile.ammmoMultiplier = 1;
missile.hitSound = Sounds.bang;
missile.hitShake = 8;
missile.trailParam = 5;
missile.trailChance = 0.2;
missile.trailEffect = trail;
missile.despawnEffect = boom;
missile.riseSpin = 360;
missile.fallSpin = 135;
missile.unitSort = (u, x, y) => -u.maxHealth;

const ohnoMissilesReturns = type.missileTurret(false, ItemTurret, ItemTurret.ItemTurretBuild, "missile-ii", "prog-mats-strike", {}, {});
/**
 * Easy to read research requirement list
 *
 * copper/69
**/
ohnoMissilesReturns.requirements = ItemStack.with(Items.copper, 69);
ohnoMissilesReturns.ammo(Items.blastCompound, missile);
ohnoMissilesReturns.ammoPerShot = 3;
ohnoMissilesReturns.maxAmmo = 6;
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