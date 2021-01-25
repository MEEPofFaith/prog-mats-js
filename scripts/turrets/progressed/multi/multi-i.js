const multiTLib = require("libs/turretTypes/multiTurretType");
const effect = require("libs/effect");

const unoBullet = extend(BasicBulletType, {});
unoBullet.speed = 2;
unoBullet.damage = 7;
unoBullet.width = 3.5;
unoBullet.height = 4.5;
unoBullet.homingPower = 0.02;
unoBullet.lifetime = 50;
unoBullet.hitEffect = effect.scaledBasicHit(0.75);
unoBullet.despawnEffect = effect.scaledBasicHit(0.6);

const unoMount = multiTLib.newWeapon(unoBullet, "prog-mats-unoM");
unoMount.reloadTime = 15;
unoMount.ammoPerShot = 5;
unoMount.x = 2.75;
unoMount.y = 2.75;
unoMount.recoilAmount = 1;
unoMount.range = 9 * 8;
unoMount.title = "Uno"

const hailBullet = extend(ArtilleryBulletType, {});
hailBullet.speed = 1.5;
hailBullet.damage = 5;
hailBullet.hitEffect = effect.scaledSmallBlast(0.75);
hailBullet.knockback = 0.5;
hailBullet.lifetime = 105;
hailBullet.width = 5.5;
hailBullet.height = 5.5;
hailBullet.splashDamageRadius = 14;
hailBullet.splashDamage = 18;

const hailMount = multiTLib.newWeapon(hailBullet, "prog-mats-hailM");
hailMount.targetAir = false;
hailMount.reloadTime = 60;
hailMount.ammoPerShot = 20;
hailMount.x = -3.75;
hailMount.y = -4;
hailMount.recoilAmount = 2.5;
hailMount.range = 18 * 8;
hailMount.title = "Mini Hail"
hailMount.shootSound = Sounds.bang;

const miniSlag = extend(LiquidBulletType, {});
miniSlag.collidesAir = false;
miniSlag.liquid = Liquids.slag;
miniSlag.damage = 1;
miniSlag.drag = 0.03;
miniSlag.puddleSize = 2;

const waveMount = multiTLib.newWeapon(miniSlag, "prog-mats-waveM");
waveMount.targetAir = false;
waveMount.reloadTime = 3;
waveMount.x = 4.25;
waveMount.y = -3.5;
waveMount.recoilAmount = 1;
waveMount.range = 13 * 8;
waveMount.title = "Mini Wave";
waveMount.loop = true;
waveMount.shootSound = Sounds.none;
waveMount.loopSound = Sounds.spray;

const weapons = [unoMount, waveMount, hailMount];

const mainBullet = extend(BasicBulletType, {});
mainBullet.ammoMultiplier = 45;
mainBullet.speed = 2.5;
mainBullet.damage = 9;
mainBullet.width = 5.5;
mainBullet.height = 7;
mainBullet.lifetime = 60;
mainBullet.shootEffect = Fx.shootSmall;
mainBullet.smokeEffect = Fx.shootSmallSmoke;

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