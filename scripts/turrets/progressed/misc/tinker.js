const sBul = require("libs/bulletTypes/sentryBulletType");
const launch = require("libs/turretTypes/launchTurretType");
const eff = require("libs/effect");
const citem = name => Vars.content.getByName(ContentType.item, "prog-mats-" + name + "-sentry-box");
const cunit = name => Vars.content.getByName(ContentType.unit, "prog-mats-" + name);

const trail = eff.trailEffect(150, 240, -1);
trail.layer = Layer.effect + 0.001;

const engi = launch.launchTurret(ItemTurret, ItemTurret.ItemTurretBuild, "tinker", {
  size: 3,
  reloadTime: 60 * 10,
  minRange: 5 * Vars.tilesize,
  range: 40 * Vars.tilesize,
  inaccuracy: 6,
  velocityInaccuracy: 0.4,
  maxAmmo: 3,
  cooldown: 0.03,
  recoilAmount: 6,
  restitution: 0.02,
  shootShake: 2
}, {});

engi.setupRequirements(Category.turret, ItemStack.with(
  Items.copper, 125,
  Items.lead, 75,
  Items.silicon, 30,
  Items.titanium, 50
));

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

const sentryDash = sBul.sentryBullet(cunit("dash-sentry"), true, {
  lifetime: 120,
  speed: 2.25,
  trailEffect: trail
});

engi.ammo(citem("basic"), sentryBasic, citem("strike"), sentryStrike, citem("dash"), sentryDash);