//4 colors from outside in. Normal meltdown laser has trasnparrency 55 -> aa -> ff (no transparrency) -> ff(no transparrency)
var colors = [Color.valueOf("D99F6B55"), Color.valueOf("E8D174aa"), Color.valueOf("F3E979"), Color.valueOf("ffffff")];
var length = 900;
var width = 16;
var fadeTime = 16;
var oscScl = 0.5;
var oscMag = 1;

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

const chaosChargeBegin = new Effect(180, 400, e => {
  Draw.color(colors[0], colors[3], e.fin());
  Lines.stroke(Mathf.lerp(4, 24, e.fin()));
  Lines.circle(e.x, e.y, 384 * e.fout());
});

var chargeLenScale = 1.5;

const chaosCharge = new Effect(180, 1600 / chargeLenScale, e => {
  var fade = 1 - Mathf.curve(e.time, e.lifetime - fadeTime / 4, e.lifetime);
  var baseLen = (length + (Mathf.absin(Time.time() / ((i + 1) * 2) + Mathf.randomSeed(e.id), 0.8, 1.5) * (length / 1.5))) / chargeLenScale;
  
  for(var j = 0; j < 2; j++){
    var side = (j - 0.5) * 2;
    for(var s = 0; s < 4; s++){
      Draw.color(tmpColor.set(colors[s]).mul(1.0 + Mathf.absin(Time.time() / 3 + Mathf.randomSeed(e.id), 1.0, 0.3) / 3));
      Draw.alpha(fade);
      for(var i = 0; i < 4; i++){
        vec.trns(e.rotation + 360 * e.fin(), (lenscales[i] - 1) * 35);
        Lines.stroke((width / 2 + Mathf.absin(Time.time(), oscScl, oscMag)) * e.fin() * strokes[s] * tscales[i]);
        Lines.lineAngle(e.x + vec.x, e.y + vec.y, e.rotation + 360 * e.fin() * side, baseLen * lenscales[i], false);
      }
    }
  }
});

const duration = 90;

const chaosBeam = extend(ContinuousLaserBulletType, {});
chaosBeam.colors = colors;
chaosBeam.tscales = tscales;
chaosBeam.strokes = strokes;
chaosBeam.lenscales = lenscales;
chaosBeam.length = length;
chaosBeam.width = width;
chaosBeam.oscScl = oscScl;
chaosBeam.oscMag = oscMag;
chaosBeam.damage = Number.MAX_VALUE;
chaosBeam.lifetime = duration + 16;
chaosBeam.shake = 10;

const chaosArray = extendContent(ChargeTurret, "chaos-array", {});
chaosArray.shootType = chaosBeam;
chaosArray.chargeTime = 180;
chaosArray.shootSound = loadSound("braaaagh");
chaosArray.chargeSound = loadSound("octagonapus");
chaosArray.chargeBeginEffect = chaosChargeBegin;
chaosArray.chargeEffect = chaosCharge;
chaosArray.chargeEffects = 10;
chaosArray.chargeMaxDelay = 0;
chaosArray.size = 8;
chaosArray.shootDuration = duration;
chaosArray.shots = 30;
chaosArray.spread = 90;
chaosArray.inaccuracy = 6;

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
      
      if(this.reload >= chaosArray.reloadTime){
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
      chaosArray.chargeBeginEffect.at(this.x + shootLoc.x, this.y + shootLoc.y, this.rotation);
      chaosArray.chargeSound.at(this.x + shootLoc.x, this.y + shootLoc.y, 1);
      
      Time.run(Mathf.random(chaosArray.chargeMaxDelay), run(() => {
        Angles.shotgun(chaosArray.chargeEffects, 360 / chaosArray.chargeEffects, this.rotation, (rot) => {
          chaosArray.chargeEffect.at(this.x + shootLoc.x, this.y + shootLoc.y, rot + Mathf.range(chaosArray.inaccuracy));
        });
      }));
      
      this.shooting = true;

      Time.run(chaosArray.chargeTime, run(() => {
        this.recoil = chaosArray.recoilAmount;
        this.heat = 1;
        this._bulletLife = chaosArray.shootDuration;
        Angles.shotgun(chaosArray.shots, chaosArray.spread / chaosArray.shots, this.rotation, (rot) => {
          shootLoc.trns(this.rotation - 90, 0, chaosArray.size * 4 - this.recoil);
          this.bullet(ammo, rot + Mathf.range(chaosArray.inaccuracy));
          chaosArray.shootSound.at(this.x + shootLoc.x, this.y + shootLoc.y, 1);
        });
      }));
    },
    bullet(type, angle){
      shootLoc.trns(this.rotation, chaosArray.size * 4 - this.recoil);
      
      type.create(this, this.team, this.x + shootLoc.x, this.y + shootLoc.y, angle);
    },
  });
  
  return chaosEntity;
};