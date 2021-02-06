const sentryUnitType = require("libs/unitTypes/sentryUnit");

const sentryI = sentryUnitType.sentryUnit("sentry-i");

const cannon = extendContent(Weapon, "large-weapon", {});
cannon.bullet = Bullets.standardHoming;
cannon.rotate = false;
cannon.reload = 13;
cannon.alternate = true;
cannon.x = 16/4;
cannon.y = 7/4;
cannon.recoil = 5/4;
cannon.shootX = -2.5/4;
cannon.ejectEffect = Fx.casing1;
cannon.top = false;

sentryI.weapons.add(cannon);