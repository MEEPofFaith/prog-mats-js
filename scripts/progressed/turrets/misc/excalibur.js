const bul = require("libs/bulletTypes/crossLaserBulletType");
const sword = bul.crossLaser(0.3, 0.7, 2, 1, 8, 150, 500, true, true, true);
sword.length = 400;
sword.width = 16;
sword.colors = [Color.valueOf("F3E979").mul(1, 1, 1, 0.4), Color.valueOf("F3E979"), Color.white];

const arthur = extendContent(PowerTurret, "excalibur", {});
arthur.shootType = sword;