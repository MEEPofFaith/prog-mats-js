const multiTLib = require("libs/turretTypes/multiTurretType");
const effect = require("libs/effect");

const unoBullet = extend(BasicBulletType, {
  speed: 2,
  damage: 7,
  width: 3.5,
  height: 4.5,
  homingPower: 0.02,
  lifetime: 50,
  hitEffect: effect.scaledBasicHit(0.75),
  despawnEffect: effect.scaledBasicHit(0.6)
});

const unoMount = multiTLib.newWeapon(unoBullet, "prog-mats-unoM");
unoMount.reloadTime = 15;
unoMount.ammoPerShot = 5;
unoMount.x = 2.75;
unoMount.y = 2.75;
unoMount.shootY = 13/4;
unoMount.recoilAmount = 1;
unoMount.range = 9 * 8;
unoMount.title = "Uno"

const hailBullet = extend(ArtilleryBulletType, {
  speed: 1.5,
  damage: 5,
  hitEffect: effect.scaledSmallBlast(0.75),
  knockback: 0.5,
  lifetime: 105,
  width: 5.5,
  height: 5.5,
  splashDamageRadius: 14,
  splashDamage: 18
});

const hailMount = multiTLib.newWeapon(hailBullet, "prog-mats-hailM");
hailMount.targetAir = false;
hailMount.reloadTime = 60;
hailMount.ammoPerShot = 20;
hailMount.x = -3.75;
hailMount.y = -4;
hailMount.shootY = 18/4;
hailMount.recoilAmount = 2.5;
hailMount.range = 18 * 8;
hailMount.title = "Mini Hail"
hailMount.shootSound = Sounds.bang;

const miniSlag = extend(LiquidBulletType, {
  collidesAir: false,
  liquid: Liquids.slag,
  damage: 1,
  drag: 0.03,
  puddleSize: 2,
  orbSize: 1
});

const waveMount = multiTLib.newWeapon(miniSlag, "prog-mats-waveM");
waveMount.targetAir = false;
waveMount.reloadTime = 3;
waveMount.x = 4.25;
waveMount.y = -3.5;
waveMount.shootY = 16/4;
waveMount.recoilAmount = 1;
waveMount.range = 13 * 8;
waveMount.title = "Mini Wave";
waveMount.loop = true;
waveMount.shootSound = Sounds.none;
waveMount.loopSound = Sounds.spray;

const weapons = [unoMount, waveMount, hailMount];

const mainBullet = extend(BasicBulletType, {
  ammoMultiplier: 45,
  speed: 2.5,
  damage: 9,
  width: 5.5,
  height: 7,
  lifetime: 60,
  shootEffect: Fx.shootSmall,
  smokeEffect: Fx.shootSmallSmoke
});

//Aggregate -> Assimilation -> Amalgamation
const jumble = multiTLib.newMultiTurret("multi-i", weapons, Items.graphite, mainBullet, 80, 20, "Aggregate");
jumble.size = 2;
jumble.range = 15 * 8;
jumble.maxAmmo = 225;
jumble.ammoPerShot = 12;
jumble.recoil = 2;
jumble.reloadTime = 21;

/*
  requirements: [
    copper/135
    lead/75
    metaglass/40
    graphite/80
    silicon/50
  ]
*/
// jumble.requirements(Category.turret, ItemStack.with(Items.copper, 135, Items.lead, 75, Items.metaglass, 40, Items.graphite, 80, Items.silicon, 50));
jumble.requirements = ItemStack.with(Items.copper, 135, Items.lead, 75, Items.metaglass, 40, Items.graphite, 80, Items.silicon, 50);
jumble.category = Category.turret;
jumble.buildVisibility = BuildVisibility.shown;