const bul = require("libs/bulletTypes/nukeBulletType");
const type = require("libs/turretTypes/missileTurretType");
const eff = require("libs/effect");

const trail = eff.trailEffect(240, false, 1);
trail.layer = Layer.bullet;

const boom = eff.scaledNuclearExplosion(4, 0.75, 80, true);

const missile = bul.nukeBullet(true, 30, 20, true, true, false);
missile.sprite = "prog-mats-nuke";
missile.width = 20;
missile.height = 40;
missile.riseEngineSize = 24;
missile.fallEngineSize = 14;
missile.trailSize = 0.7;
missile.damage = 15000;
missile.splashDamage = 30000;
missile.splashDamageRadius = 240;
missile.speed = 1;
missile.homingPower = 0.05;
missile.homingRange = 4440;
missile.lifetime = 4500;
missile.elevation = 900;
missile.riseTime = 240;
missile.fallTime = 90;
missile.ammmoMultiplier = 1;
missile.hitSound = Sounds.bang;
missile.hitShake = 30;
missile.trailParam = 8;
missile.targetRad = 2;
missile.trailChance = 0.2;
missile.trailEffect = trail;
missile.despawnEffect = boom;
missile.riseSpin = 720;
missile.fallSpin = 180;
missile.unitSort = (u, x, y) => -u.maxHealth + Mathf.dst2(x, y, u.x, u.y);

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
NUKE.ammo(Items.blastCompound, missile);
NUKE.ammoPerShot = 20;
NUKE.maxAmmo = 40;
NUKE.unitSort = (u, x, y) => -u.maxHealth;