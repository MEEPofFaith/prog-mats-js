const horizon = Color.valueOf("bd5200");
const horizonRad = 5;

const loc = new Vec2();
const vec = new Vec2();

const fLib = this.global.pm.funcLib;

const clearBullet = (b, succEffect) => {
  var bWidth = b.type.width * ((1 - b.type.shrinkX) + b.type.shrinkX * b.fout());
  var bHeight = b.type.height * ((1 - b.type.shrinkY) + b.type.shrinkY * b.fout());
  var bOffset = -90 + (b.type.spin != 0 ? Mathf.randomSeed(b.id, 360) + b.time * b.type.spin : 0);
  var artilleryScale = 0.7 + b.fslope() * 0.3
  var shape = [bWidth, bHeight, bOffset, artilleryScale];
  var baseShape = [b.type.width, b.type.height, b.type.hitSize, (b.type.width + b.type.height) / 2];
  
  var bullData = [baseShape, shape, b.type.backRegion, b.type];
  
  succEffect.at(b.x, b.y, b.rotation(), bullData);
  
  const bData = [b.type.hitEffect, b.type.despawnEffect, b.type.hitSound, b.type.despawnShake, b.type.fragBullet, b.type.splashDamageRadius, b.type.damage];
  b.type.hitEffect = Fx.none;
  b.type.despawnEffect = Fx.none;
  b.type.hitSound = Sounds.none;
  b.type.despawnShake = 0;
  b.type.fragBullet = null;
  b.type.splashDamageRadius = -1;
  b.type.damage = 0;
  
  b.remove();
  
  b.type.hitEffect = bData[0];
  b.type.despawnEffect = bData[1];
  b.type.hitSound = bData[2];
  b.type.despawnShake = bData[3];
  b.type.fragBullet = bData[4];
  b.type.splashDamageRadius = bData[5];
  b.type.damage = bData[6];
};

const swirl = new Effect(90, e => {
  loc.trns(e.rotation + (480 * e.fin()), e.data[1] / 2 * e.fout());
  
	Draw.color(Color.valueOf("000000"));
	Fill.circle(e.data[0].x + loc.x , e.data[0].y + loc.y, 2 * e.fout());
  
  Drawf.light(e.data[0].x + loc.x , e.data[0].y + loc.y, (2 + horizonRad) * e.fout(), horizon, 0.7);
  Draw.reset();
});
swirl.layer = Layer.bullet;

const poof = new Effect(24, e => {
  Draw.color(Color.valueOf("353535"), Color.valueOf("000000"), e.fin());
  
  e.scaled(12, cons(s => {
    Lines.stroke(0.5 + s.fout());
    Lines.circle(e.x, e.y, s.fin() * 10);
  }))
  
  const ln = new Floatc2({get(x, y){
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), e.fout() * 4 + 1.5);
  }})
  
  Lines.stroke(0.5 + e.fout() * 1.5);
  Angles.randLenVectors(e.id, 8, e.fin() * 30, e.rotation, 180, ln);
});

const bulletDissapear = new Effect(24, e => {
  e.scaled(8, cons(s => {
    Draw.color(Color.black);
    Lines.stroke(Interp.pow2Out.apply(s.fout()));
    Lines.circle(e.x, e.y, Interp.pow2Out.apply(s.fout()) * e.data[0][3]);
    Draw.reset();
  }))
  
  if(e.data[3] instanceof BasicBulletType){
    if(e.data[3] instanceof LaserBoltBulletType){
      Draw.color(Color.black);
      Draw.alpha(e.fout());
      Lines.stroke(e.data[0][0]);
      Lines.lineAngleCenter(e.x, e.y, e.rotation - 90, e.data[0][1]);

      Draw.reset();
    }else if(e.data[3] instanceof ArtilleryBulletType){
      Draw.color(Color.black);
      Draw.alpha(e.fout());
      Draw.rect(e.data[2], e.x, e.y, e.data[1][0] * e.data[1][3], e.data[1][1] * e.data[1][3], e.rotation - 90);

      Draw.reset();
    }else{
      Draw.color(Color.black);
      Draw.alpha(e.fout());
      Draw.rect(e.data[2], e.x, e.y, e.data[1][0], e.data[1][1], e.rotation + e.data[1][2]);

      Draw.reset();
    }
  }
});

const chargeBegin = new Effect(50, e => {
  Draw.color(Color.valueOf("000000"));
  Fill.circle(e.x, e.y, e.fin() * (e.data / 2));
  Draw.color();
  
  Drawf.light(e.x , e.y, e.fin() * (e.data / 2 + horizonRad), horizon, 0.7);
  Draw.reset();
});

const charge = new Effect(38, e => {
  Draw.color(Color.valueOf("000000"));
  const ln = new Floatc2({get(x, y){
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), e.fslope() * 3 + 1);
  }})
  Angles.randLenVectors(e.id, 2, 1 + 40 * e.fout(), e.rotation, 180, ln);
});

const cataclysmArea = 100;
const cataclysm = new Effect(60 * 60, cataclysmArea * 10, e => {
  var expandTime = 15;
  
  const interp = new Interp.PowOut(6);
  var midPoint = 3450;
  var fslope = Mathf.curve(interp.apply(e.fin()) * e.lifetime, 0, midPoint) - Mathf.curve(e.fin() * e.lifetime, midPoint, e.lifetime);
  var fin = Mathf.curve(e.fin() * e.lifetime, 0, 60);
  
  var expand = Mathf.curve(e.fin() * e.lifetime, 0, expandTime) - Mathf.curve(e.fin() * e.lifetime, midPoint, e.lifetime);
  var darkness = Mathf.curve(e.fin() * e.lifetime, 0, 7.5 * 60);
  
  Draw.color(Color.darkGray, Color.black, darkness);
  Draw.alpha(expand);
  Lines.stroke(24);
  Lines.circle(e.x, e.y, expand * e.data);
  Fill.circle(e.x, e.y, expand * e.data);
  
  e.scaled(expandTime, cons(s => {
    Draw.color(Color.black);
    Lines.stroke(s.fin() * 24);
    Lines.circle(e.x, e.y, s.fin() * e.data);
    Draw.reset();
  }))
  
  Angles.randLenVectors(e.id, 500, interp.apply(fin) * (e.data + e.data / 3), (x, y) => {
    var size = fslope * 96;
    Draw.color(Color.black);
    Fill.circle(e.x + x, e.y + y, size / 2);
  });
  
  /*SoundControl.silenced = true;
  
  if(e.life == e.lifetime){
    SoundControl.silenced = false;
  }*/
});
cataclysm.layer = Layer.max + 256;

const ballOfSucc = extend(BasicBulletType, {
  load(){
    this.backRegion = Core.atlas.find("prog-mats-backhole-back"); //not funny
    this.front = [];
    
    for(var i = 0; i < 3; i++){
      this.front[i] = Core.atlas.find("prog-mats-backhole-" + i);
    }
  },
  update(b){
    if(b != null){
      if(b.timer.get(1, 2)){
        //Adapted from Graviton from AdvanceContent, translated to v6 by me.
        Units.nearbyEnemies(b.team, b.x - this.succRadius, b.y - this.succRadius, this.succRadius * 2, this.succRadius * 2, cons(unit => {
          if(unit.within(b.x, b.y, this.succRadius)){
            unit.impulse(Tmp.v1.set(b).sub(unit).limit((this.force + (1 - unit.dst(b) / this.succRadius) * this.scaledForce)));
          };
        }));
        
        //Adapted from Point Defence from AdvanceContent, translated to v6 by me.
        Groups.bullet.intersect(b.x - this.succRadius, b.y - this.succRadius, this.succRadius * 2, this.succRadius * 2, cons(e => {
          if(e != null){
            if(Mathf.within(b.x, b.y, e.x, e.y, this.succRadius) && e != b && e.team != b.team && e.type instanceof BasicBulletType){
              var dist = Mathf.dst(b.x, b.y, e.x, e.y);
              var strength = this.bulletForce - (dist / this.succRadius) * this.bulletForceReduction;
              
              e.rotation(Mathf.slerpDelta(e.rotation(), e.angleTo(b), strength));
              
              if(Mathf.within(b.x, b.y, e.x, e.y, this.blackholeSize)){
                if(e.type == b.type){
                  this.ohnoEffect.at(b.x, b.y, Mathf.random(360), this.ohnoArea);
                  
                  Units.nearbyEnemies(null, b.x - this.ohnoArea, b.y - this.ohnoArea, this.ohnoArea * 2, this.ohnoArea * 2, unit => {
                    if(unit.within(b.x, b.y, this.ohnoArea)){
                      unit.kill();
                    }
                  });
                  
                  fLib.trueEachBlock(b.x, b.y, this.ohnoArea, build => {
                    if(!build.dead && build.block != null){
                      build.kill();
                    }
                  });
                  
                  Effect.shake(100, 500, b.x, b.y);
                  
                  clearBullet(e, Fx.none);
                  clearBullet(b, Fx.none);
                }else{
                  clearBullet(e, this.succEffect);
                }
              }
            }
          }
        }));
        
        Damage.damage(b.team, b.x, b.y, 24, this.damage, true);
        
        var dist = (this.lifetime - b.time) * this.speed;
        var endX = Mathf.sinDeg(b.rotation() + 90) * dist;
        var endY = Mathf.cosDeg(b.rotation() - 90) * dist;
        
        if(b.time <= this.lifetime - 90){
          swirl.at(b.x, b.y, Mathf.random(360), [b, this.succRadius]);
        }
      }
    }
  },
  draw(b){
    Draw.z(Layer.bullet + 0.5);
    Draw.color(this.backColor);
    Draw.rect(this.backRegion, b.x, b.y, this.blackholeSize, this.blackholeSize, 0);
    
    Draw.color(this.frontColor);
    var f = Mathf.floor(b.time/5) % 3;
    Draw.rect(this.front[f], b.x, b.y, this.blackholeSize, this.blackholeSize,  0);
  }
});
var bhSize = 6;

ballOfSucc.damage = 575 / 30;
ballOfSucc.speed = 0.5;
ballOfSucc.lifetime = 384;
ballOfSucc.collides = false;
ballOfSucc.collidesTiles = false;
ballOfSucc.hitEffect = poof;
ballOfSucc.despawnEffect = poof;
ballOfSucc.succEffect = bulletDissapear;
ballOfSucc.shootEffect = Fx.none;
ballOfSucc.smokeEffect = Fx.none;

ballOfSucc.ohnoEffect = cataclysm;
ballOfSucc.ohnoArea = cataclysmArea * 8;

ballOfSucc.succRadius = 64;
ballOfSucc.blackholeSize = bhSize;

ballOfSucc.force = 35;
ballOfSucc.scaledForce = 480;

ballOfSucc.bulletForce = 0.8;
ballOfSucc.bulletForceReduction = 0.6;

ballOfSucc.hittable = false;
ballOfSucc.absorbable = false;

ballOfSucc.backColor = Color.valueOf("000000");
ballOfSucc.frontColor = Color.valueOf("353535");
ballOfSucc.lightColor = horizon;
ballOfSucc.lightRadius = bhSize / 2 + horizonRad;
ballOfSucc.lightOpacity = 0.7;

const blackhole = extendContent(PowerTurret, "blackhole", {
  setStats(){
    this.super$setStats();
    
    //damages every 5 ticks
    this.stats.remove(Stat.damage);
    this.stats.add(Stat.damage, this.shootType.damage * 30, StatUnit.perSecond);
  },
  load(){
    this.super$load();
    
    this.spaceRegion = Core.atlas.find(this.name + "-space");
  }
});

blackhole.shootType = ballOfSucc;
blackhole.chargeEffect = charge;
blackhole.chargeBeginEffect = chargeBegin;
blackhole.chargeTime = 50;
blackhole.chargeMaxDelay = 30;
blackhole.chargeEffects = 16;
blackhole.recoilAmount = 2;
blackhole.heatColor = Color.valueOf("000000");
blackhole.restitution = 0.015;
blackhole.cooldown = 0.005;
blackhole.shootY = -16;

const tmpCol = new Color();
const pow6In = new Interp.PowIn(6);

//More stolen code :D
blackhole.heatDrawer = tile => {
	if(tile.heat <= 0.00001) return;
	var r = pow6In.apply(tile.heat);
	var g = (Interp.pow3In.apply(tile.heat) + ((1 - Interp.pow3In.apply(tile.heat)) * 0.12)) / 2;
	var b = Interp.pow2Out.apply(tile.heat);
	var a = Interp.pow2Out.apply(tile.heat);
	tmpCol.set(r, g, b, a);
	Draw.color(tmpCol);

	Draw.blend(Blending.additive);
	Draw.rect(blackhole.heatRegion, tile.x + blackhole.tr2.x, tile.y + blackhole.tr2.y, tile.rotation - 90);
	Draw.blend();
	Draw.color();
};

const spaceColor = new Color.valueOf("140017");

blackhole.buildType = () => {
  var succEntity = extendContent(PowerTurret.PowerTurretBuild, blackhole, {
    setEff(){
      this._spaceAlpha = 0;
    },
    draw(){
      this.super$draw();
      
      vec.trns(this.rotation - 90, 0, -this.recoil);
      
      Draw.color(spaceColor.cpy().shiftHue(Time.time / 2).shiftValue(Mathf.absin(Time.time, 4, 0.15)));
      Draw.alpha(this._spaceAlpha);
      Draw.rect(blackhole.spaceRegion, this.x + vec.x, this.y + vec.y, this.rotation - 90);
      Draw.reset();
    },
    updateTile(){
      this.super$updateTile();
      
      this._spaceAlpha = Mathf.lerpDelta(this._spaceAlpha, Mathf.num(this.cons.valid()), 0.1);
    },
    shoot(type){
      this.useAmmo();

      vec.trns(this.rotation - 90, 0, blackhole.size * 4 - this.recoil + blackhole.shootY);
      blackhole.chargeBeginEffect.at(this.x + vec.x, this.y + vec.y, this.rotation);
      
      for(var i = 0; i < blackhole.chargeEffects; i++){
        Time.run(Mathf.random(blackhole.chargeMaxDelay), run(() => {
          blackhole.chargeEffect.at(this.x + vec.x, this.y + vec.y, this.rotation, blackhole.shootType.blackHoleSize);
        }));
      }
      
      this.charging = true;

      Time.run(blackhole.chargeTime, run(() => {
        this.recoil = blackhole.recoilAmount;
        this.heat = 1;
        type.create(this, this.team, this.x + vec.x, this.y + vec.y, this.rotation, 1, 1);
        this.charging = false;
      }));
    }
  });
  succEntity.setEff();
  
  return succEntity;
};