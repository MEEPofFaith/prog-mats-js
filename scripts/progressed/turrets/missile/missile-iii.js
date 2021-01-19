const bul = require("libs/bulletTypes/nukeBulletType");
const type = require("libs/turretTypes/stationaryTurretType");
const eff = require("libs/effect");

const trail = eff.trailEffect(240, false, 1);
trail.layer = Layer.flyingUnitLow - 2;

const missile = bul.nukeBullet(true, 8, 8, false, true, false);
missile.sprite = "prog-mats-nuke";
missile.width = 20;
missile.height = 40;
missile.riseEngineSize = 24;
missile.fallEngineSize = 14;
missile.trailSize = 1;
missile.bulletOffset = 20;
missile.damage = 15000;
missile.splashDamage = 30000;
missile.splashDamageRadius = 800;
missile.speed = 1;
missile.homingPower = 0.05;
missile.homingRange = 4440;
missile.lifetime = 4500;
missile.elevation = 900;
missile.riseTime = 240;
missile.fallTime = 90;
missile.ammmoMultiplier = 1;
missile.hitSound = Sounds.bang;
missile.hitShake = 150;
missile.trailParam = 8;
missile.targetRad = 2;
missile.trailChance = 0.2;
missile.trailEffect = trail;
missile.riseSpin = 720;
missile.fallSpin = 180;

const NUKE = type.stationaryTurret(false, ItemTurret, ItemTurret.ItemTurretBuild, "missile-iii", {
  icons(){
    return [this.region];
  }
}, {});  
/**
 * Easy to read research requirement list
 *
 * copper/69
**/
NUKE.requirements = ItemStack.with(Items.copper, 69);
NUKE.ammo(Items.blastCompound, missile);
NUKE.ammoPerShot = 20;
NUKE.maxAmmo = 40;