const fLib = this.global.pm.funcLib;

module.exports = {
  newBlackHole(size, horizonColor, horizonRad){
    const clearBullet = (b, succEffect) => {
      var bWidth = b.type.width * ((1 - b.type.shrinkX) + b.type.shrinkX * b.fout());
      var bHeight = b.type.height * ((1 - b.type.shrinkY) + b.type.shrinkY * b.fout());
      var bOffset = -90 + (b.type.spin != 0 ? Mathf.randomSeed(b.id, 360) + b.time * b.type.spin : 0);
      var artilleryScale = 0.7 + b.fslope() * 0.3
      var shape = [bWidth, bHeight, bOffset, artilleryScale];
      var baseShape = [b.type.width, b.type.height, (bWidth + bHeight) / 2];
      
      if(b.type instanceof ContinuousLaserBulletType){
        var fout = 1 - Mathf.curve(b.time, b.lifetime - b.type.fadeTime, b.lifetime);
        var lWidth = (b.type.width + Mathf.absin(Time.time, b.type.oscScl, b.type.oscMag)) * fout;
        var lLengh = Damage.findLaserLength(b, b.type.length) * fout;
        
        baseShape[2] = lLengh;
        var laserData = [lLengh, lWidth, b.type.spaceMag, b.type.tscales, b.type.lenscales, b.type.colors, b.type.strokes];
      }else{
        var laserData = null;
      }
      
      var bulData = [baseShape, shape, b.type.backRegion, b.type];
      
      succEffect.at(b.x, b.y, b.rotation(), [bulData, laserData]);
      
      const bData = [b.type.hitEffect, b.type.despawnEffect, b.type.hitSound, b.type.despawnShake, b.type.fragBullet, b.type.splashDamageRadius, b.type.speed];
      b.type.hitEffect = Fx.none;
      b.type.despawnEffect = Fx.none;
      b.type.hitSound = Sounds.none;
      b.type.despawnShake = 0;
      b.type.fragBullet = null;
      b.type.splashDamageRadius = -1;
      b.damage = 0;
      b.type.speed = 0;
      
      if(b.type instanceof MassDriverBolt){
        b.data = "nein";
      }
      
      b.remove();
      
      b.type.hitEffect = bData[0];
      b.type.despawnEffect = bData[1];
      b.type.hitSound = bData[2];
      b.type.despawnShake = bData[3];
      b.type.fragBullet = bData[4];
      b.type.splashDamageRadius = bData[5];
      b.type.speed = bData[6];
    };

    const swirl = new Effect(90, e => {
      if(!e.data[0]) return;
      Tmp.v1.trns(e.rotation + (e.data[1][1] * e.fin()), e.data[1][0] / 2 * e.fout());
      
      Draw.color(Color.valueOf("000000"));
      Fill.circle(e.data[0].x + Tmp.v1.x , e.data[0].y + Tmp.v1.y, 2 * e.fout());
      
      Drawf.light(e.data[0].x + Tmp.v1.x , e.data[0].y + Tmp.v1.y, (2 + horizonRad) * e.fout(), horizonColor, 0.7);
      Draw.reset();
    });
    swirl.layer = Layer.bullet;
    
    const poof = new Effect(24, e => {
      Draw.color(Color.valueOf("353535"), Color.valueOf("000000"), e.fin());
      
      e.scaled(12, cons(s => {
        Lines.stroke(size / 12 + s.fout());
        Lines.circle(e.x, e.y, s.fin() * 10);
      }))
      
      Lines.stroke(size / 12 + e.fout() * size / 4);
      Angles.randLenVectors(e.id, 4, e.fin() * size * 5, e.rotation, 180, (x, y) => {
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), e.fout() * 4 + 1.5);
      });
      
      Draw.color(e.color);
      Angles.randLenVectors(e.id + 1, 4, e.fin() * size * 5, e.rotation, 180, (x, y) => {
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), e.fout() * 4 + 1.5);
      });
    });
    
    const bulletDissapear = new Effect(24, e => {
      e.scaled(8, cons(s => {
        Draw.color(Color.black);
        Lines.stroke(Interp.pow2Out.apply(s.fout()));
        Lines.circle(e.x, e.y, Interp.pow2Out.apply(s.fout()) * e.data[0][0][2]);
        Draw.reset();
      }))
      
      if(e.data[0][3] instanceof ContinuousLaserBulletType){
        for(var s = 0; s < e.data[1][5].length; s++){
          Draw.color(Tmp.c1.set(e.data[1][5][s]).mul(1 + Mathf.absin(Time.time, 1, 0.1)).shiftValue(-1));
          Draw.alpha(e.fout());
          for(var i = 0; i < e.data[1][3].length; i++){
            Tmp.v1.trns(e.rotation + 180, (e.data[1][4][i] - 1) * e.data[1][2]);
            Lines.stroke(e.data[1][1] * e.data[1][6][s] * e.data[1][3][i]);
            Lines.lineAngle(e.x + Tmp.v1.x, e.y + Tmp.v1.y, e.rotation, e.data[1][0] * e.data[1][4][i], false);
          }
        }
        Draw.reset();
      }else if(e.data[0][3] instanceof LaserBoltBulletType){  
        Draw.color(Color.black);
        Draw.alpha(e.fout());
        Lines.stroke(e.data[0][0][0]);
        Lines.lineAngleCenter(e.x, e.y, e.rotation - 90, e.data[0][0][1]);

        Draw.reset();
      }else if(e.data[0][3] instanceof ArtilleryBulletType){
        Draw.color(Color.black);
        Draw.alpha(e.fout());
        Draw.rect(e.data[0][2], e.x, e.y, e.data[0][1][0] * e.data[0][1][3], e.data[0][1][1] * e.data[0][1][3], e.rotation - 90);

        Draw.reset();
      }else if(e.data[0][3] instanceof BasicBulletType){
        Draw.color(Color.black);
        Draw.alpha(e.fout());
        Draw.rect(e.data[0][2], e.x, e.y, e.data[0][1][0], e.data[0][1][1], e.rotation + e.data[0][1][2]);

        Draw.reset();
      }else if(e.data[0][3] instanceof MassDriverBolt){
        Draw.color(Color.black);
        Draw.alpha(e.fout());
        Draw.rect(Core.atlas.find("shell-back"), e.x, e.y, 11, 13, e.rotation + 90);

        Draw.reset();
      }
    });
    bulletDissapear.layer = Layer.bullet;
    
    const cataclysm = new Effect(60 * 60, 8000, e => {
      var expandTime = 15;
      
      const interp = new Interp.PowOut(2);
      var endGrow = 25 * 60;
      var startShrink = 3450;
      var fslope = Mathf.curve(interp.apply(e.fin()) * e.lifetime, 0, endGrow) - Mathf.curve(e.time, startShrink, e.lifetime);
      var fHalfSlope = Mathf.curve(interp.apply(e.fin()) * e.lifetime, 0, endGrow);
      var fin = Mathf.curve(e.time, 0, 90);
      
      var expand = Mathf.curve(e.time, 0, expandTime) - Mathf.curve(e.time, startShrink, e.lifetime);
      var darkness = Mathf.curve(e.time, 0, 7.5 * 60);
      
      Draw.color(Color.darkGray, Color.black, darkness);
      Draw.alpha(expand);
      Lines.stroke(8);
      Lines.circle(e.x, e.y, expand * e.data[0][0]);
      Fill.circle(e.x, e.y, expand * e.data[0][0]);
      
      e.scaled(expandTime, cons(s => {
        Draw.color(Color.black);
        Lines.stroke(s.fin() * 24);
        Lines.circle(e.x, e.y, s.fin() * e.data[0][0]);
        Draw.reset();
      }))
      
      var number = [Mathf.round(e.data[0][0] * 0.8), Mathf.round(e.data[0][0] * 0.1)];
      var size = fslope * (e.data[0][0] / 5);
      var jiggle = 1;
      
      Angles.randLenVectors(e.id, number[0], interp.apply(fin) * (e.data[0][0] + e.data[0][0] / 2), (x, y) => {
        Draw.color(Color.black);
        Fill.circle(e.x + x + Mathf.range(jiggle), e.y + y + Mathf.range(jiggle), size / 2);
      });
      
      Angles.randLenVectors(e.id + 1, number[1], interp.apply(fin) * (e.data[0][0] + e.data[0][0] / 2), (x, y) => {
        Draw.color(e.data[1][0], Color.black, fHalfSlope);
        Fill.circle(e.x + x + Mathf.range(jiggle), e.y + y + Mathf.range(jiggle), size / 2);
      });
      
      Angles.randLenVectors(e.id - 1, number[1], interp.apply(fin) * (e.data[0][0] + e.data[0][0] / 2), (x, y) => {
        Draw.color(e.data[1][1], Color.black, fHalfSlope);
        Fill.circle(e.x + x + Mathf.range(jiggle), e.y + y + Mathf.range(jiggle), size / 2);
      });
      
      var range = e.data[0][0] * expand;
      Units.nearbyEnemies(null, e.x - range, e.y - range, range * 2, range * 2, unit => {
        if(unit.within(e.x, e.y, range)){
          unit.kill();
        }
      });
      
      fLib.trueEachBlock(e.x, e.y, range, build => {
        if(!build.dead && build.block != null){
          build.kill();
        }
      });
      
      var succMul = e.data[0][1];
      var succRange = e.data[0][0] * e.data[0][2] * expand;
      Units.nearbyEnemies(null, e.x - succRange, e.y - succRange, succRange * 2, succRange * 2, cons(unit => {
        if(unit.within(e.x, e.y, succRange)){
          unit.impulse(Tmp.v1.set(e.x, e.y).sub(unit).limit((e.data[2][0] + Interp.pow3In.apply(1 - (unit.dst(e.x, e.y) - range) / succRange) * e.data[2][1]) * succMul));
        };
      }));
      
      Groups.bullet.intersect(e.x - succRange, e.y - succRange, succRange * 2, succRange * 2, cons(b => {
        if(b != null){
          if(Mathf.within(e.x, e.y, b.x, b.y, succRange) && b.type.speed >= 0.1){
            var dist = Mathf.dst(e.x, e.y, b.x, b.y);
            var strength = e.data[2][2] * succMul - Interp.pow3Out.apply((dist - range) / succRange) * e.data[2][3] * succMul;
            
            b.rotation(Mathf.slerpDelta(b.rotation(), b.angleTo(e.x, e.y), strength));
            
            if(Mathf.within(e.x, e.y, b.x, b.y, range)){
              clearBullet(b, bulletDissapear);
            }
          }
        }
      }));
      
      /*SoundControl.silenced = true;
      
      if(e.time == e.lifetime){
        SoundControl.silenced = false;
      }*/
    });
    cataclysm.layer = Layer.max;

    const blackHole = extend(BasicBulletType, {
      load(){
        this.backRegion = Core.atlas.find("prog-mats-backhole-back"); //not funny
        this.front = [];
        
        for(var i = 0; i < 3; i++){
          this.front[i] = Core.atlas.find("prog-mats-backhole-" + i);
        }
      },
      init(b){
        if(!b) return;
        this.super$init(b);
        
        b.data = ["haha cataclysm go brrr", this.cataclysmRadius, this.force, this.scaledForce, this.bulletForce, this.bulletForceReduction, this.cataclysmForceMul, this.cataclysmRangeMul];
      },
      update(b){
        if(b != null){
          if(b.timer.get(1, 2)){
            //Adapted from Graviton from AdvanceContent, translated to v6 by me.
            Units.nearbyEnemies(b.team, b.x - this.succRadius, b.y - this.succRadius, this.succRadius * 2, this.succRadius * 2, cons(unit => {
              if(unit.within(b.x, b.y, this.succRadius)){
                unit.impulse(Tmp.v1.set(b).sub(unit).limit((this.force + Interp.pow3In.apply(1 - (unit.dst(b) - this.blackholeSize) / this.succRadius) * this.scaledForce)));
              };
            }));
            
            //Adapted from Point Defence from AdvanceContent, translated to v6 by me.
            Groups.bullet.intersect(b.x - this.succRadius, b.y - this.succRadius, this.succRadius * 2, this.succRadius * 2, cons(e => {
              if(e != null){
                if(Mathf.within(b.x, b.y, e.x, e.y, this.succRadius) && e != b && e.team != b.team && e.type.speed >= 0.1){
                  var dist = Mathf.dst(b.x, b.y, e.x, e.y);
                  var strength = this.bulletForce - Interp.pow3Out.apply((dist - this.blackholeSize) / this.succRadius) * this.bulletForceReduction;
                  
                  e.rotation(Mathf.slerpDelta(e.rotation(), e.angleTo(b), strength));
                  
                  if(Mathf.within(b.x, b.y, e.x, e.y, this.blackholeSize)){
                    if(e.data != null && e.data.length > 0 && !(e.type instanceof MassDriverBolt)){
                      if(b.data[0] == e.data[0]){
                        var radius = (b.data[1] + e.data[1]) * 8;
                        var cSuccPower = (b.data[2] + e.data[2]) / 2;
                        var cSuccSlcPower = (b.data[3] + e.data[3]) / 2;
                        var cBulletPower = (b.data[4] + e.data[4]) / 2;
                        var cBulletPowerRed = (b.data[5] + e.data[5]) / 2;
                        var cSuccPowerMul = (b.data[6] + e.data[6]) / 2;
                        var cSuccRangeMul = (b.data[7] + e.data[7]) / 2;
                        
                        var cForce = [cSuccPower, cSuccSlcPower, cBulletPower, cBulletPowerRed]
                        
                        var collideX = (b.x + e.x) / 2;
                        var collideY = (b.y + e.y) / 2;
                        
                        this.cataclysmEffect.at(collideX, collideY, Mathf.random(360), [[radius, cSuccPowerMul, cSuccRangeMul], [b.team.color, e.team.color], cForce]);
                        
                        Effect.shake(radius / 1.5, radius * 1.5, collideX, collideY);
                        
                        clearBullet(e, Fx.none);
                        clearBullet(b, Fx.none);
                      }else{
                        clearBullet(e, this.succEffect);
                      }
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
              swirl.at(b.x, b.y, Mathf.random(360), [b, [this.succRadius, this.swirlAngle]]);
            }
          }
        }
      },
      draw(b){
        Draw.z(Layer.bullet + 0.5);
        Draw.color(Color.black);
        Draw.rect(this.backRegion, b.x, b.y, this.blackholeSize, this.blackholeSize, 0);
        
        Draw.color(b.team.color);
        var f = Mathf.floor(b.time/5) % 3;
        Draw.rect(this.front[f], b.x, b.y, this.blackholeSize, this.blackholeSize,  0);
      },
      despawned(b){
        this.despawnEffect.at(b.x, b.y, b.rotation(), b.team.color);
      }
    });
    blackHole.damage = 575 / 30;
    blackHole.speed = 0.5;
    blackHole.lifetime = 384;
    blackHole.collides = false;
    blackHole.collidesTiles = false;
    blackHole.hitEffect = Fx.none;
    blackHole.despawnEffect = poof;
    blackHole.succEffect = bulletDissapear;
    blackHole.shootEffect = Fx.none;
    blackHole.smokeEffect = Fx.none;

    blackHole.cataclysmEffect = cataclysm;
    blackHole.cataclysmRadius = 15; //In tiles

    blackHole.succRadius = 64;
    blackHole.blackholeSize = size;
    blackHole.swirlAngle = 480;

    blackHole.force = 35;
    blackHole.scaledForce = 480;

    blackHole.bulletForce = 0.5;
    blackHole.bulletForceReduction = 0.5;
    
    blackHole.cataclysmForceMul = 1;
    blackHole.cataclysmRangeMul = 1.5;

    blackHole.hittable = false;
    blackHole.absorbable = false;

    blackHole.lightColor = horizonColor;
    blackHole.lightRadius = size / 2 + horizonRad;
    blackHole.lightOpacity = 0.7;
    
    return blackHole;
  }
}