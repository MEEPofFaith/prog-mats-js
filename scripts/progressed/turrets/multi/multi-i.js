const multiTLib = this.global.pm.multiTurret;

const t1 = multiTLib.newMount(Bullets.missileExplosive, "error");
t1.x = 18;
t1.shots = 3;
t1.burstSpacing = 3;
t1.spread = 5;
t1.range = 15 * 8;
t1.ejectEffect = Fx.casing2;
t1.ammoPerShot = 0.1;

const t2 = multiTLib.newMount(Bullets.standardHoming, "error");
t2.y = -18;
t2.shots = 15;
t2.reloadTime = 60;
t2.burstSpacing = 1;
t2.range = 10 * 8;
t2.altEject = false;
t2.ejectEffect = Fx.casing1;
t2.ammoPerShot = 0.05;

const t3 = multiTLib.newMount(Bullets.artilleryIncendiary, "error");
t3.x = -18;
t3.shots = 3;
t3.velocityInaccuracy = 0.2;
t3.inaccuracy = 10;
t3.range = 45 * 8;
t3.ammoPerShot = 0.11;
t3.targetAir = false;

const weapons = [t1, t2, t3];

//Jumble -> Amalgamation -> Conglomeration
const jumble = multiTLib.newMultiTurret("multi-i", weapons, Items.copper, Bullets.standardThoriumBig);
jumble.size = 3;
jumble.range = 20 * 8;
jumble.maxAmmo = 60;