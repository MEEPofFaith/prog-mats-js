const bul = require("libs/bulletTypes/critBulletType");
const eff = require("libs/PMfx");

const sparkle = eff.sparkleEffect(15, 240, 4, 8, 4);

const crit = bul.critBullet(BasicBulletType, {
  critEffect: sparkle,
  damage: 250,
  speed: 6,
  lifetime: 30
});

const blitz = extend(ItemTurret, "blitz", {
  reloadTime: 60,
  inaccuracy: 0,
  size: 2,
  range: 160
});

blitz.ammo(Items.thorium, crit);
blitz.setupRequirements(Category.turret, BuildVisibility.sandboxOnly, ItemStack.empty);