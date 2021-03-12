const wall = require("libs/blockTypes/strobeWall");

const speed = 1.5;

const sandboxWall = wall.strobeWall("sandbox-wall", speed, {
  health: 150000000
}, {});

const sandboxWallLarge = wall.strobeWall("sandbox-wall-large", speed, {
  health: 600000000,
  size: 2
}, {});

const sandboxSurgeWall = wall.strobeWall("sandbox-surge-wall", speed, {
  health: 150000000,
  lightningChance: 1,
  lightningDamage: 5000,
  lightningLength: 100
}, {});

const sandboxSurgeWallLarge = wall.strobeWall("sandbox-surge-wall-large", speed, {
  health: 600000000,
  size: 2,
  lightningChance: 1,
  lightningDamage: 5000,
  lightningLength: 100
}, {});

const sandboxPhaseWall = wall.strobeWall("sandbox-phase-wall", speed, {
  health: 150000000,
  chanceDeflect: 100000000,
  flashHit: true
}, {});

const sandboxPhaseWallLarge = wall.strobeWall("sandbox-phase-wall-large", speed, {
  health: 600000000,
  size: 2,
  chanceDeflect: 100000000,
  flashHit: true
}, {});

const sandboxPlastaniumWall = wall.strobeWall("sandbox-plastanium-wall", speed, {
  health: 150000000,
  insulated: true,
  absorbLasers: true,
  schematicPriority: 10
}, {});

const sandboxPlastaniumWallLarge = wall.strobeWall("sandbox-plastanium-wall-large", speed, {
  health: 600000000,
  size: 2,
  insulated: true,
  absorbLasers: true,
  schematicPriority: 10
}, {});

const sandboxEverythingWall = wall.strobeWall("sandbox-everything-wall", speed, {
  health: 150000000,
  lightningChance: 1,
  lightningDamage: 5000,
  lightningLength: 100,
  chanceDeflect: 100000000,
  flashHit: true,
  insulated: true,
  absorbLasers: true,
  schematicPriority: 10
}, {});

const sandboxEverythingWallLarge = wall.strobeWall("sandbox-everything-wall-large", speed, {
  health: 600000000,
  size: 2,
  lightningChance: 1,
  lightningDamage: 5000,
  lightningLength: 100,
  chanceDeflect: 100000000,
  flashHit: true,
  insulated: true,
  absorbLasers: true,
  schematicPriority: 10
}, {});