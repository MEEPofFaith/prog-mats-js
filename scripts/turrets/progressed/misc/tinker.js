const sBul = require("libs/bulletTypes/sentryBulletType");
const eff = require("libs/effect");
const citem = name => Vars.content.getByName(ContentType.item, "prog-mats-" + name);
const cunit = name => Vars.content.getByName(ContentType.unit, "prog-mats-" + name);

const trail = eff.trailEffect(150, 240, -1);
trail.layer = Layer.effect + 0.001;

const sentryBasic = sBul.sentryBullet(cunit("basic-sentry"), true, {
  lifetime: 120,
  speed: 2,
  trailEffect: trail
});

const sentryStrike = sBul.sentryBullet(cunit("strike-sentry"), true, {
  lifetime: 120,
  speed: 1.5,
  trailEffect: trail
});

const engi = extend(ItemTurret, "tinker", {
  size: 3,
  reloadTime: 60 * 10,
  range: 40 * Vars.tilesize,
  inaccuracy: 20,
  velocityInaccuracy: 0.3,
  category: Category.turret,
  maxAmmo: 3,
  requirements: ItemStack.with(Items.copper, 125, Items.lead, 75, Items.silicon, 30, Items.titanium, 50),
  buildVisibility: BuildVisibility.shown
});

engi.ammo(citem("basic-sentry-box"), sentryBasic, citem("strike-sentry-box"), sentryStrike);