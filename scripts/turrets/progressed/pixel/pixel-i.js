const bitLib = require("libs/turretTypes/bitTurretType");
const bitBLib = require("libs/bulletTypes/bitBulletType");

const bit = bitLib.new8BitTurret("pixel-i", 8, PowerTurret, PowerTurret.PowerTurretBuild, false);

var size = 8;
var radius = 40;
var w = 2.5;
var l = 3;
const pew = bitBLib.newBitBullet(Color.valueOf("FF84C1"), Color.valueOf("EF4A9D"), 0.05, size, false, 8, w, l, 30, radius + 2 * l, 75, 7.5);
pew.speed = 2;
pew.lifetime = 90;
pew.damage = 5;
pew.splashDamage = 27;
pew.splashDamageRadius = radius;
pew.hitSize = size;
pew.homingPower = 0.01;
pew.homingRange = 160;
pew.knockback = 3;
pew.weaveScale = 10;
pew.weaveMag = 2;

bit.shootType = pew;

/*
  requirements: [
    copper/50
    lead/60
    silicon/40
    titanium/30
  ]
*/
// bit.requirements(Category.turret, ItemStack.with(Items.copper, 50, Items.lead, 60, Items.silicon, 40, Items.titanium, 30));
bit.requirements = ItemStack.with(Items.copper, 50, Items.lead, 60, Items.silicon, 40, Items.titanium, 30);
bit.category = Category.turret;
bit.buildVisibility = BuildVisibility.shown;

bit.reloadTime = 70;
bit.recoilAmount = 4;
bit.inaccuracy = 15;
bit.range = 140;
bit.powerUse = 1.35;
bit.size = 2;