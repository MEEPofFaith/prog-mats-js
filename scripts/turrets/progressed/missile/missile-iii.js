const bul = require("libs/bulletTypes/strikeBulletType");
const particle = require("libs/bulletTypes/particleBulletType");
const paralyze = require("libs/statusEffects/paralizeStatus");
const type = require("libs/turretTypes/missileTurretType");
const eff = require("libs/PMfx");

const citem = name => Vars.content.getByName(ContentType.item, "prog-mats-" + name);

const smallTrail = eff.trailEffect(120, 200, -1);
smallTrail.layer = Layer.bullet;
const trail = eff.trailEffect(240, 400, -1);
trail.layer = Layer.bullet;

const smallBoom = eff.scaledNuclearExplosion(1.5, 0.25, 50, true);
const boom = eff.mushroomCloud(450, 800, 1);

const rangeMul = 2;

//(autodrop, drop radius, stop?, stop radius, unstop?, start on owner, given data, snap rot, extra stuff);

const missile = bul.strikeBullet(30, 20, true, true, false, false, {
  sprite: "prog-mats-nukeb",
  riseEngineSize: 24,
  fallEngineSize: 14,
  trailSize: 0.7,
  damage: 300,
  splashDamage: 27000,
  splashDamageRadius: 240,
  speed: 1,
  homingPower: 0.05,
  homingRange: 1100 * rangeMul,
  lifetime: 2250 * rangeMul,
  elevation: 900,
  riseTime: 240,
  fallTime: 90,
  hitSound: Sounds.bang,
  hitShake: 30,
  trailParam: 8,
  targetRad: 2,
  trailChance: 0.2,
  trailEffect: trail,
  despawnEffect: boom,
  riseSpin: 720,
  fallSpin: 180
});
missile.unitSort = (u, x, y) => -u.maxHealth + Mathf.dst2(x, y, u.x, u.y)/1000;

const emp = bul.strikeBullet(80, 40, true, true, false, false, {
  sprite: "prog-mats-emp-nukeb",
  reloadMultiplier: 0.75,
  riseEngineSize: 24,
  fallEngineSize: 14,
  trailSize: 0.7,
  damage: 300,
  splashDamage: 1700,
  splashDamageRadius: 170,
  speed: 2,
  homingPower: 0.075,
  homingRange: 1100 * rangeMul,
  lifetime: 1125 * rangeMul,
  elevation: 900,
  riseTime: 180,
  fallTime: 70,
  hitSound: Sounds.bang,
  hitShake: 30,
  trailParam: 8,
  targetRad: 2,
  trailChance: 0.2,
  trailEffect: trail,
  despawnEffect: boom,
  riseSpin: 720,
  fallSpin: 180,
  fragBullets: 360,
  fragVelocityMin: 0.5
});
// (dmgMult, healthMult, speedMult, reloadMult, dmgTick, rotRnd)
emp.fragBullet = particle.particleBullet(Pal.lancerLaser, Sounds.spark, 1, 0.4, 0.7, {});
emp.fragBullet.status = paralyze.paralizeStatus("prog-mats-cease", 0.8, 0.9, 0.02, 0.5, 5, 15, false, 60 * 12 / 2);
emp.fragBullet.speed = 12;
emp.fragBullet.lifetime = 48;
emp.fragBullet.statusDuration = 60 * 12;

const clusterFrag = bul.strikeBullet(0, 0, true, true, false, false, {
  sprite: "prog-mats-cluster-nukeb-frag",
  riseEngineSize: -1,
  fallEngineSize: 8,
  trailSize: 0.7,
  damage: 80,
  splashDamage: 3000,
  splashDamageRadius: 40,
  speed: 1,
  homingPower: -1,
  lifetime: 150,
  elevation: 900,
  riseTime: -1,
  fallTime: 75,
  hitSound: Sounds.bang,
  hitShake: 8,
  trailParam: 5,
  trailChance: 0.2,
  trailEffect: smallTrail,
  despawnEffect: smallBoom,
  riseSpin: 360,
  fallSpin: 135
});

const cluster = bul.strikeBullet(60, 20, true, true, false, false, {
  sprite: "prog-mats-cluster-nukeb",
  riseEngineSize: 24,
  fallEngineSize: -1,
  trailSize: 0.7,
  damage: 0,
  splashDamage: -1,
  splashDamageRadius: 0,
  speed: 1,
  homingPower: 0.05,
  homingRange: 1100 * rangeMul,
  lifetime: 2250 * rangeMul,
  elevation: 900,
  riseTime: 240,
  fallTime: -1,
  hitSound: Sounds.none,
  hitShake: 0,
  trailParam: 8,
  targetRad: 2,
  trailChance: 0.2,
  trailEffect: trail,
  despawnEffect: Fx.none,
  hitEffect: Fx.none,
  riseSpin: 720,
  fallSpin: 180,
  fragBullets: 20,
  fragBullet: clusterFrag,
  fragVelocityMin: 0.1,
  fragVelocityMax: 1,
  fragLifeMin: 0.5,
  fragLifeMax: 1
});
cluster.unitSort = (u, x, y) => -u.maxHealth + Mathf.dst2(x, y, u.x, u.y)/1000;

const cUnit = name => Vars.content.getByName(ContentType.unit, "prog-mats-" + name);
//Repeat values to increase weight on the value
const sentryUnits = [cUnit("basic-sentry"), cUnit("strike-sentry"), cUnit("dash-sentry")]; //TODO when I add more sentrys add them to this list.
const items = [Items.blastCompound, Items.pyratite, Items.pyratite];

const unitDrop = bul.strikeBullet(0, 0, true, true, false, true, {
  init(b){
    if(!b) return;
    this.super$init(b);
    
    // [x, y, angle, reset speed, unit, sprite]
    b.data = [0, 0, 0, false, sentryUnits[Mathf.round(Mathf.random(sentryUnits.length - 1))]];
    b.fdata = -69420;
    
    this.drawSize = this.elevation + 24;
    b.data[5] = b.data[4].icon(Cicon.full);
  },
  despawned(b){
    if(!b) return;
    
    let sentry = b.data[4].spawn(b.team, b.x, b.y);
    sentry.rotation = b.rotation();

    let randomItem = items[Mathf.round(Mathf.random(items.length - 1))];
    let amount = Mathf.round(Mathf.random(0, 10));
    if(amount > 0) sentry.addItem(randomItem, amount);

    for(var i = 0; i < 4; i++) sentry.vel.add(b.vel); //It just fell from the sky, it's got to have quite a bit of velocity.
    if(Mathf.chance(0.25)) sentry.killed();
    
    this.super$despawned(b);
  },
  draw(b){ //Yes the entire thing copied here is just for drawing the different units.
    //Variables
    let fadeIn = Mathf.curve(b.time, b.lifetime - this.fallTime, b.lifetime);
    let fall = 1 - fadeIn;
    let a = Interp.pow5Out.apply(fadeIn);
    let fRocket = Interp.pow5In.apply(Mathf.curve(b.time, b.lifetime - this.fallTime, b.lifetime - this.fallTime + this.fallEngineTime));
    let target = Mathf.curve(b.time, 0, 8) - Mathf.curve(b.time, b.lifetime - 8, b.lifetime);
    let rot = b.rotation() + 90;
    Tmp.v2.trns(225, fall * this.elevation * 2);
    let fY = b.y + fall * this.elevation;
    let side = Mathf.signs[Mathf.round(Mathf.randomSeed(b.id, 1))];
    let weave = Mathf.sin(b.time * this.weaveSpeed) * this.weaveWidth * side;
    let fWeave = this.weaveWidth > 0 ? weave * fall : 0;
    let fX = b.x + fWeave;
    
    //Target
    let radius = this.targetRad * target;
    if(this.targetRad > 0){
      Draw.z(Layer.bullet + 0.002);
      Draw.color(Pal.gray, target);
      Lines.stroke(3);
      Lines.poly(b.x, b.y, 4, 7 * radius, Time.time * 1.5 + Mathf.randomSeed(b.id, 360));
      Lines.spikes(b.x, b.y, 3 * radius, 6 * radius, 4, Time.time * 1.5 + Mathf.randomSeed(b.id, 360));
      Draw.color(b.team.color, target);
      Lines.stroke(1);
      Lines.poly(b.x, b.y, 4, 7 * radius, Time.time * 1.5 + Mathf.randomSeed(b.id, 360));
      Lines.spikes(b.x, b.y, 3 * radius, 6 * radius, 4, Time.time * 1.5 + Mathf.randomSeed(b.id, 360));
      Draw.reset;
    }
    
    //Missile
    Draw.z(Layer.weather - 2);
    Draw.color();
    Draw.alpha(a);
    Draw.rect(b.data[5], fX, fY, b.data[5].width * Draw.scl, b.data[5].height * Draw.scl, rot + 180);
    Drawf.light(b.team, fX, fY, this.lightRadius, this.lightColor, this.lightOpacity);
    //Engine stolen from launchpad
    if(this.fallEngineSize > 0){
      Draw.z(Layer.weather - 1);
      Draw.color(this.engineLightColor);
      Fill.light(fX, fY, 10, this.fallEngineSize * 1.5625 * fRocket, Tmp.c1.set(Pal.engine).mul(1, 1, 1, fRocket), Tmp.c2.set(Pal.engine).mul(1, 1, 1, 0));
      for(let i = 0; i < 4; i++){
        Drawf.tri(fX, fY, this.fallEngineSize * 0.375, this.fallEngineSize * 2.5 * fRocket, i * 90 + (Time.time * 1.5 + Mathf.randomSeed(b.id + 2, 360)));
      }
      Drawf.light(b.team, fX, fY, this.fallEngineLightRadius * fRocket, this.engineLightColor, this.engineLightOpacity * fRocket);
    }
    //Missile shadow
    Draw.z(Layer.flyingUnit + 1);
    Draw.color(0, 0, 0, 0.22 * a);
    Draw.rect(b.data[5], fX + Tmp.v2.x, fY + Tmp.v2.y, b.data[5].width * Draw.scl, b.data[5].height * Draw.scl, rot + this.shadowRot + 180 + Mathf.randomSeed(b.id + 3, 360));


    Draw.reset();
  },
  
  sprite: "clear",
  riseEngineSize: -1,
  fallEngineSize: -1,
  damage: 20,
  splashDamageRadius: -1,
  speed: 0.5,
  homingPower: -1,
  lifetime: 150,
  elevation: 900,
  riseTime: -1,
  fallTime: 75,
  hitSound: Sounds.none,
  hitShake: 0,
  targetRad: 0.5,
  trailEffect: Fx.none,
  despawnEffect: Fx.none,
  riseSpin: 0,
  fallSpin: 0
});

const dropPod = bul.strikeBullet(30, 20, true, true, false, false, {
  sprite: "prog-mats-drop-podb",
  reloadMultiplier: 1.25,
  riseEngineSize: 24,
  fallEngineSize: 14,
  trailSize: 0.7,
  damage: 0,
  splashDamage: -1,
  splashDamageRadius: 0,
  speed: 2.25,
  homingPower: 0.05,
  homingRange: 1100 * rangeMul,
  lifetime: 1000 * rangeMul,
  elevation: 900,
  riseTime: 240,
  fallTime: -1,
  hitSound: Sounds.none,
  hitShake: 0,
  trailParam: 8,
  targetRad: 2,
  trailChance: 0.2,
  trailEffect: trail,
  despawnEffect: Fx.none,
  hitEffect: Fx.none,
  riseSpin: 720,
  fallSpin: 180,
  fragBullets: 30,
  fragBullet: unitDrop,
  fragVelocityMin: 0.1,
  fragVelocityMax: 1.5,
  fragLifeMin: 0.5,
  fragLifeMax: 1
});
dropPod.unitSort = (u, x, y) => -u.maxHealth + Mathf.dst2(x, y, u.x, u.y)/1000;

const NUKE = type.missileTurret(false, ItemTurret, ItemTurret.ItemTurretBuild, "missile-iii", {
  health: 5950,
  size: 7,
  range: 2200 * rangeMul,
  shootSound: Sounds.explosionbig,
  cooldown: 0.001,
  shootShake: 10,
  reloadTime: 1500,
  shootLength: 0,
  
  maxAmmo: 2,
  unitSort: (u, x, y) => -u.maxHealth
}, {});

NUKE.setupRequirements(Category.turret, ItemStack.with(
  Items.copper, 4000,
  Items.graphite, 2200,
  Items.silicon, 2000,
  Items.titanium, 1300,
  Items.thorium, 650,
  Items.surgeAlloy, 200,
  citem("techtanite"), 800
));

NUKE.ammo(citem("basic-nuke"), missile, citem("emp-nuke"), emp, citem("cluster-nuke"), cluster, citem("sentry-nuke"), dropPod);