const sBul = require("libs/bulletTypes/sentryBulletType");

const unit = Vars.content.getByName(ContentType.unit, "prog-mats-sentry-i");
const sentry = sBul.sentryBullet(unit, ArtilleryBulletType);
sentry.lifetime = 120;
sentry.speed = 1;

const engi = extend(PowerTurret, "engineer-i", {
  size: 2,
  reloadTime: 60 * 10,
  shootType: sentry,
  range: 20 * Vars.tilesize,
  category: Category.turret,
  requirements: ItemStack.empty,
  buildVisibility: BuildVisibility.sandboxOnly
});