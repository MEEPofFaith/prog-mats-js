//4 colors from outside in. Normal meltdown laser has trasnparrency 55 -> aa -> ff (no transparrency) -> ff(no transparrency)
var colors = [Color.valueOf("D99F6B55"), Color.valueOf("E8D174aa"), Color.valueOf("F3E979"), Color.valueOf("ffffff")];
var length = 900;
var width = 16;
var fadeTime = 45;
var oscScl = 0.5;
var oscMag = 1;
var lightStroke = 60;

//Stuff you probably shouldn't edit unless you know what you're doing.
//Width of each section of the beam from thickest to thinnest
var tscales = [1, 0.7, 0.5, 0.2];
//Overall width of each color
var strokes = [2, 1.5, 1, 0.3];
//Determines how far back each section in the start should be pulled
var pullscales = [1, 1.12, 1.15, 1.17];
//Determines how far each section of the end should extend past the main thickest section
var lenscales = [1, 1.12, 1.15, 1.17];

const tmpColor = new Color();
const vec = new Vec2();
const vec2 = new Vec2();

var lightScale = 1;

const chaosChargeBegin = new Effect(180, 400, e => {
  Draw.color(colors[0], colors[2], 0.5 + e.fin() * 0.5);
  Lines.stroke(Mathf.lerp(0, 28, e.fin()));
  Lines.circle(e.x, e.y, 384 * e.fout());
  
  for(var i = 0; i < 36; i++){
    vec.trns(i * 10, 384 * e.fout());
    vec2.trns(i * 10 + 10, 384 * e.fout());
    Drawf.light(e.data[0], e.x + vec.x, e.y + vec.y, e.x + vec2.x, e.y + vec2.y, 14 / 2 + lightStroke * lightScale * e.fin(), Draw.getColor(), 0.7);
  }
});

var chargeLenScale = 0.75;
var chargeBeams = 30 / 2;

const chaosCharge = new Effect(180, 1600 * chargeLenScale, e => {
  var fade = 1 - Mathf.curve(e.time, e.lifetime - fadeTime, e.lifetime);
  var grow = Mathf.curve(e.time, 0, e.lifetime - fadeTime);
  var baseLen = (length + (Mathf.absin(Time.time() / ((i + 1) * 2) + Mathf.randomSeed(e.id), 0.8, 1.5) * (length / 1.5))) * chargeLenScale * fade;
  
  for(var i = 0; i < 4; i++){
    Draw.color(tmpColor.set(colors[i]).mul(1.0 + Mathf.absin(Time.time() / 3 + Mathf.randomSeed(e.id), 1.0, 0.3) / 3));
    for(var j = 0; j < 2; j++){
      var dir = Mathf.signs[j];
      for(var k = 0; k < chargeBeams; k++){
        var side = k * (360 / chargeBeams);
        for(var l = 0; l < 4; l++){
          Lines.stroke((width + Mathf.absin(Time.time(), oscScl, oscMag)) * grow * strokes[i] * tscales[l] * fade);
          Lines.lineAngle(e.x, e.y, (e.rotation + 360 * e.fin() + side) * dir, baseLen * lenscales[l], false);
        }
        
        vec.trns((e.rotation + 360 * e.fin() + side) * dir, baseLen * 1.1);
          
        Drawf.light(e.data[0], e.x, e.y, e.x + vec.x, e.y + vec.y, ((width + Mathf.absin(Time.time(), oscScl, oscMag)) * grow * strokes[i] * tscales[j] * fade) / 2 + lightStroke * lightScale * e.fin(), colors[2], 0.7);
      }
    }
    Draw.reset();
  }
});

const duration = 90;

const chaosBeam = extend(ContinuousLaserBulletType, {
  update(b){
    this.super$update(b);
    
    Effect.shake(this.shake, 120, b);
  }
});
chaosBeam.colors = colors;
chaosBeam.tscales = tscales;
chaosBeam.strokes = strokes;
chaosBeam.lenscales = lenscales;
chaosBeam.length = length;
chaosBeam.width = width;
chaosBeam.oscScl = oscScl;
chaosBeam.oscMag = oscMag;
chaosBeam.lightStroke = lightStroke;
chaosBeam.lightColor = colors[2];
chaosBeam.fadeTime = fadeTime;
chaosBeam.damage = Number.MAX_VALUE;
chaosBeam.lifetime = duration + 16;
chaosBeam.shake = 5.6;

const chaosArray = extendContent(ChargeTurret, "chaos-array", {
  setStats(){
    this.super$setStats();
    
    this.stats.remove(Stat.damage);
    this.stats.add(Stat.damage, "oh no");
  }
});
chaosArray.shootType = chaosBeam;
chaosArray.powerUse = 150.016667;
chaosArray.chargeTime = 180;
chaosArray.shootSound = loadSound("braaaagh");
chaosArray.chargeSound = loadSound("octagonapus");
chaosArray.chargeBeginEffect = chaosChargeBegin;
chaosArray.chargeEffect = chaosCharge;
chaosArray.chargeMaxDelay = 0;
chaosArray.size = 8;
chaosArray.shootDuration = duration;
chaosArray.shots = 100;
chaosArray.inaccuracy = 45;
chaosArray.shootShake = 3200;

const tmpCol = new Color();
const pow6In = new Interp.PowIn(6);

chaosArray.heatDrawer = tile => {
	if(tile.heat <= 0.00001) return;
	var r = Interp.pow2Out.apply(tile.heat);
	var g = Interp.pow3In.apply(tile.heat) + ((1 - Interp.pow3In.apply(tile.heat)) * 0.12);
	var b = pow6In.apply(tile.heat);
	var a = Interp.pow2Out.apply(tile.heat);
	tmpCol.set(r, g, b, a);
	Draw.color(tmpCol);

	Draw.blend(Blending.additive);
	Draw.rect(chaosArray.heatRegion, tile.x + chaosArray.tr2.x, tile.y + chaosArray.tr2.y, tile.rotation - 90);
	Draw.blend();
	Draw.color();
};

const shootLoc = new Vec2();

chaosArray.buildType = () => {
	var chaosEntity = extendContent(ChargeTurret.ChargeTurretBuild, chaosArray, {
    setEff(){
      this._bulletLife = 0;
    },
    updateTile(){
      this.super$updateTile();
      shootLoc.trns(this.rotation, chaosArray.size * 4 - this.recoil);
      
      if(this._bulletLife > 0){
        this.heat = 1;
        this.recoil = chaosArray.recoilAmount;
        this._bulletLife -= Time.delta;
        
        if(this._bulletLife <= 0){
          this.shooting = false;
        }
      }
    },
    updateShooting(){
      if(this._bulletLife > 0){
        return;
      }
      
      if(this.reload >= chaosArray.reloadTime && !this.shooting){
        var type = this.peekAmmo();
        
        this.shoot(type);
        
        this.reload = 0;
      }else{
        this.reload += this.delta() * this.baseReloadSpeed();
      }
    },
    shoot(ammo){
      this.useAmmo();

      shootLoc.trns(this.rotation - 90, 0, chaosArray.size * 4 - this.recoil);
      chaosArray.chargeEffect.at(this.x + shootLoc.x, this.y + shootLoc.y, Mathf.random(360), [this.team]);
      chaosArray.chargeBeginEffect.at(this.x + shootLoc.x, this.y + shootLoc.y, this.rotation, [this.team]);
      chaosArray.chargeSound.at(this.x + shootLoc.x, this.y + shootLoc.y, 1);
      
      this.shooting = true;

      Time.run(chaosArray.chargeTime, run(() => {
        this.recoil = chaosArray.recoilAmount;
        this.heat = 1;
        this._bulletLife = chaosArray.shootDuration;
        for(var i = 0; i < chaosArray.shots; i++){
          shootLoc.trns(this.rotation - 90, 0, chaosArray.size * 4 - this.recoil);
          this.bullet(ammo, this.rotation + Mathf.range(chaosArray.inaccuracy));
          chaosArray.shootSound.at(this.x + shootLoc.x, this.y + shootLoc.y, 1);
        };
      }));
    },
    bullet(type, angle){
      shootLoc.trns(this.rotation, chaosArray.size * 4 - this.recoil);
      
      type.create(this, this.team, this.x + shootLoc.x, this.y + shootLoc.y, angle);
    },
  });
  
  return chaosEntity;
};