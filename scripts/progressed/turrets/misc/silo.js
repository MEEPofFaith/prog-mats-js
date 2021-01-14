const bul = require("libs/strikeBulletType");
const missile = bul.strikeBullet();
missile.width = 24;
missile.height = 24;
missile.rocketSize = 16;
missile.trailSize = 0.9;
missile.rocketOffset = -9;
missile.damage = 50;
missile.splashDamage = 100;
missile.splashDamageRadius = 48;
missile.speed = 1;
missile.homingPower = 0.5;
missile.homingRange = 400;
missile.lifetime = 300;

const tisIMissile = extendContent(ItemTurret, "silo", {});
/**
 * Easy to read research requirement list
 *
 * copper/69
**/
tisIMissile.requirements = ItemStack.with(Items.copper, 69);
tisIMissile.ammo(Items.blastCompound, missile);