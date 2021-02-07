const sBul = require("libs/bulletTypes/sentryBulletType");
const citem = name => Vars.content.getByName(ContentType.item, "prog-mats-" + name);

const unit = Vars.content.getByName(ContentType.unit, "prog-mats-sentry-i");
const sentry = sBul.sentryBullet(unit, true);
sentry.lifetime = 120;
sentry.speed = 1;

const engi = extend(ItemTurret, "engineer-i", {
  size: 3,
  reloadTime: 60 * 10,
  shootType: sentry,
  range: 40 * Vars.tilesize,
  category: Category.turret,
  requirements: ItemStack.empty,
  buildVisibility: BuildVisibility.sandboxOnly
});

engi.ammo(citem("basic-sentry"), sentry);