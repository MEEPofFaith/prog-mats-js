const bitLib = require("libs/turretTypes/bitTurretType");
const bitBLib = require("libs/bulletTypes/bitBulletType");

var size = 8;
var radius = 40;
var w = 2.5;
var l = 3;
const pew = bitBLib.bitBullet(Color.valueOf("FF84C1"), Color.valueOf("EF4A9D"), 0.05, size, false, 8, w, l, 30, radius + 2 * l, 75, 7.5, {
  speed: 2,
  lifetime: 90,
  damage: 5,
  splashDamage: 27,
  splashDamageRadius: radius,
  hitSize: size,
  homingPower: 0.01,
  homingRange: 160,
  knockback: 3,
  weaveScale: 10,
  weaveMag: 2
});

const bit = bitLib.new8BitTurret("pixel-i", 8, PowerTurret, PowerTurret.PowerTurretBuild, false, {
  reloadTime: 70,
  recoilAmount: 4,
  inaccuracy: 15,
  range: 140,
  powerUse: 1.35,
  size: 2,
  shootType: pew
}, {});

bit.setupRequirements(Category.turret, ItemStack.with(
  Items.copper, 50,
  Items.lead, 60,
  Items.silicon, 40,
  Items.titanium, 30
));