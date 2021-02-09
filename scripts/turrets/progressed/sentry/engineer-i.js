const sBul = require("libs/bulletTypes/sentryBulletType");
const eff = require("libs/effect");
const citem = name => Vars.content.getByName(ContentType.item, "prog-mats-" + name);

const trail = eff.trailEffect(120, -1);
trail.layer = Layer.bullet;

const unit = Vars.content.getByName(ContentType.unit, "prog-mats-sentry-i");
const sentry = sBul.sentryBullet(unit, true);
sentry.lifetime = 120;
sentry.speed = 1;
sentry.trailEffect = trail;

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