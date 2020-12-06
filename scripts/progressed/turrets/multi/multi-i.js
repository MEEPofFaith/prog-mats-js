const multiTLib = this.global.pm.multiTurret;

const unoMount = multiTLib.newMount(Bullets.standardHoming, "prog-mats-unoM");
unoMount.reloadTime = 25;
unoMount.ammoPerShot = 5;
unoMount.x = 2.75;
unoMount.y = 2.75;
unoMount.recoilAmount = 1;
unoMount.range = 9 * 8;

const hailMount = multiTLib.newMount(Bullets.artilleryDense, "prog-mats-hailM");
hailMount.targetAir = false;
hailMount.reloadTime = 60;
hailMount.ammoPerShot = 20;
hailMount.x = -3.75;
hailMount.y = -4;
hailMount.recoilAmount = 2.5;
hailMount.range = 18 * 8;

const waveMount = multiTLib.newMount(Bullets.slagShot, "prog-mats-waveM");
waveMount.reloadTime = 7;
waveMount.x = 4.25;
waveMount.y = -3.5;
waveMount.recoilAmount = 1;
waveMount.range = 13 * 8;

const weapons = [unoMount, hailMount, waveMount];

const mainBullet = extend(BasicBulletType, {});
mainBullet.ammoMultiplier = 45;

//Jumble -> Amalgamation -> Conglomeration
const jumble = multiTLib.newMultiTurret("multi-i", weapons, Items.copper, mainBullet, 80, 20);
jumble.size = 2;
jumble.range = 15 * 8;
jumble.maxAmmo = 225;
jumble.ammoPerShot = 12;
jumble.recoil = 2;