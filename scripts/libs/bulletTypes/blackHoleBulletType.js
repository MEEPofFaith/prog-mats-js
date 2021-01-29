const fLib = this.global.pm.funcLib;

module.exports = {
  newBlackHole(size, horizonColor, horizonRad, absorbEffectTime){
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
      
      const bData = [b.type.hitEffect, b.type.despawnEffect, b.type.hitSound, b.type.despawnShake, b.type.splashDamageRadius, b.type.speed];
      b.type.hitEffect = Fx.none;
      b.type.despawnEffect = Fx.none;
      b.type.hitSound = Sounds.none;
      b.type.despawnShake = 0;
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
      b.type.splashDamageRadius = bData[4];
      b.type.speed = bData[5];
    };

    const swirl = new Effect(90, e => {
      if(!e.data[0]) return;
      Tmp.v1.trns(e.rotation + (e.data[1][1] * e.fin()), e.data[1][0] / 2 * e.fout());
      
      Draw.color(Color.valueOf("000000"));
      Fill.circle(e.data[0].x + Tmp.v1.x , e.data[0].y + Tmp.v1.y, e.data[2] * e.fout());
      
      Drawf.light(e.data[0].x + Tmp.v1.x , e.data[0].y + Tmp.v1.y, (e.data[2] + horizonRad) * e.fout(), horizonColor, 0.7);
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
    
    //haha more stealing from Project Unity
    const absorb = new Effect(absorbEffectTime, 512, e => {
      Draw.mixcol(Color.black, 1);
      Draw.color(1, 1, 1, e.fout());
      Tmp.v1.trns(e.rotation - 90, 0, e.data[1] * e.fout());
      Tmp.v1.add(e.x, e.y);
      
      fLib.simpleUnitDrawerStatic(e.data[0], false, Tmp.v1.x, Tmp.v1.y, e.fout(), e.data[2] - 90, e.data[3]);
      
      Draw.color();
      Draw.mixcol();
    });
    absorb.layer = Layer.flyingUnit + 1;
    
    const cataclysm = extend(BulletType, {
      init(b){
        if(!b) return;
        this.super$init(b);
        b.fdata = -69420;
      },
      update(b){
        if(!b) return;
        if(b.timer.get(1, 2)){
          var expandTime = 15;
          var startShrink = 3450;
          var expand = Mathf.curve(b.time, 0, expandTime) - Mathf.curve(b.time, startShrink, b.lifetime);
          
          var range = b.data[0][0] * expand;
          Units.nearbyEnemies(null, b.x - range, b.y - range, range * 2, range * 2, unit => {
            if(unit.within(b.x, b.y, range)){
              unit.kill();
            }
          });
          
          fLib.trueEachBlock(b.x, b.y, range, build => {
            if(!build.dead && build.block != null){
              build.kill();
            }
          });
          
          if(b.time < expandTime + 5){
            fLib.trueEachTile(b.x, b.y, range, tile => {
              tile.setAir();
              tile.setFloor(Blocks.space);
              Vars.world.notifyChanged(tile);
            });
            Events.fire(new WorldLoadEvent());
          }
          
          var succMul = b.data[0][1];
          var succRange = b.data[0][0] * b.data[0][2] * expand;
          Units.nearbyEnemies(null, b.x - succRange, b.y - succRange, succRange * 2, succRange * 2, cons(unit => {
            if(unit.within(b.x, b.y, succRange)){
              unit.impulse(Tmp.v1.set(b.x, b.y).sub(unit).limit((b.data[2][0] + Interp.pow3In.apply(1 - (unit.dst(b.x, b.y) - range) / succRange) * b.data[2][1]) * succMul));
            };
          }));
          
          Groups.bullet.intersect(b.x - succRange, b.y - succRange, succRange * 2, succRange * 2, cons(e => {
            if(e != null){
              if(e.fdata != -69420){
                if(Mathf.within(b.x, b.y, e.x, e.y, succRange) && e.type.speed >= 0.1){
                  var dist = Mathf.dst(b.x, b.y, e.x, e.y);
                  var strength = b.data[2][2] * succMul - Interp.pow3Out.apply((dist - range) / succRange) * b.data[2][3] * succMul;
                  
                  e.rotation(Mathf.slerpDelta(e.rotation(), e.angleTo(b.x, b.y), strength));
                  
                  if(Mathf.within(b.x, b.y, e.x, e.y, range)){
                    clearBullet(e, bulletDissapear);
                  }
                }
              }
            }
          }));
        }
      },
      draw(b){
        if(!b) return;
        var expandTime = 15;
      
        const interp = new Interp.PowOut(2);
        var endGrow = 25 * 60;
        var startShrink = 3450;
        var fslope = Mathf.curve(interp.apply(b.fin()) * b.lifetime, 0, endGrow) - Mathf.curve(b.time, startShrink, b.lifetime);
        var fHalfSlope = Mathf.curve(interp.apply(b.fin()) * b.lifetime, 0, endGrow);
        var fin = Mathf.curve(b.time, 0, 90);
        
        var expand = Mathf.curve(b.time, 0, expandTime) - Mathf.curve(b.time, startShrink, b.lifetime);
        var darkness = Mathf.curve(b.time, 0, 7.5 * 60);
        
        Draw.z(Layer.max);
        
        Draw.color(Color.darkGray, Color.black, darkness);
        Draw.alpha(expand);
        Lines.stroke(8);
        Lines.circle(b.x, b.y, expand * b.data[0][0]);
        Fill.circle(b.x, b.y, expand * b.data[0][0]);
        
        var scaled = Mathf.curve(b.time, 0, expandTime);
        if(scaled < 1){
          Draw.color(Color.black);
          Lines.stroke(scaled * 24);
          Lines.circle(b.x, b.y, scaled * b.data[0][0]);
          Draw.reset();
        }
        
        var number = [Mathf.round(b.data[0][0] * 0.8), Mathf.round(b.data[0][0] * 0.1)];
        var size = fslope * (b.data[0][0] / 5);
        var jiggle = 1;
        
        Angles.randLenVectors(b.id, number[0], interp.apply(fin) * (b.data[0][0] + b.data[0][0] / 2), (x, y) => {
          Draw.color(Color.black);
          Fill.circle(b.x + x + Mathf.range(jiggle), b.y + y + Mathf.range(jiggle), size / 2);
        });
        
        Angles.randLenVectors(b.id + 1, number[1], interp.apply(fin) * (b.data[0][0] + b.data[0][0] / 2), (x, y) => {
          Draw.color(b.data[1][0], Color.black, fHalfSlope);
          Fill.circle(b.x + x + Mathf.range(jiggle), b.y + y + Mathf.range(jiggle), size / 2);
        });
        
        Angles.randLenVectors(b.id - 1, number[1], interp.apply(fin) * (b.data[0][0] + b.data[0][0] / 2), (x, y) => {
          Draw.color(b.data[1][1], Color.black, fHalfSlope);
          Fill.circle(b.x + x + Mathf.range(jiggle), b.y + y + Mathf.range(jiggle), size / 2);
        });
      }
    });
    cataclysm.speed = 0;
    cataclysm.lifetime = 60 * 60;
    cataclysm.damage = 0;
    cataclysm.collides = false;
    cataclysm.hittable = false;
    cataclysm.absorbable = false;
    cataclysm.drawSize = 8000;

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
        var radii = [this.succRadius, this.blackholeSize, this.damageRadius, this.swirlSize, this.buildingDamageTicks];
        b.data = ["haha cataclysm go brrr", this.cataclysmRadius, this.force, this.scaledForce, this.bulletForce, this.bulletForceReduction, radii, this.cataclysmForceMul, this.cataclysmRangeMul];
      },
      update(b){
        if(b != null){
          if(b.timer.get(1, 2)){
            //Adapted from Graviton from AdvanceContent, translated to v6 by me.
            Units.nearbyEnemies(b.team, b.x - b.data[6][0], b.y - b.data[6][0], b.data[6][0] * 2, b.data[6][0] * 2, cons(unit => {
              if(unit.within(b.x, b.y, b.data[6][0])){
                unit.impulse(Tmp.v1.set(b).sub(unit).limit((b.data[2] + Interp.pow3In.apply(1 - (unit.dst(b) - b.data[6][1]) / b.data[6][0]) * b.data[3])));
              };
            }));
            
            //Adapted from Point Defence from AdvanceContent, translated to v6 by me.
            Groups.bullet.intersect(b.x - b.data[6][0], b.y - b.data[6][0], b.data[6][0] * 2, b.data[6][0] * 2, cons(e => {
              if(e != null){
                if(e.fdata != -69420){
                  if(Mathf.within(b.x, b.y, e.x, e.y, b.data[6][0]) && e != b && e.team != b.team && e.type.speed >= 0.1){
                    var dist = Mathf.dst(b.x, b.y, e.x, e.y);
                    var strength = b.data[4] - Interp.pow3Out.apply((dist - b.data[6][1]) / b.data[6][0]) * b.data[5];
                    
                    e.rotation(Mathf.slerpDelta(e.rotation(), e.angleTo(b), strength));
                    
                    if(Mathf.within(b.x, b.y, e.x, e.y, b.data[6][1])){
                      if(e.data != null && e.data.length > 0 && !(e.type instanceof MassDriverBolt)){
                        if(b.data[0] == e.data[0]){
                          var radius = (b.data[1] + e.data[1]) * 8;
                          var cSuccPower = (b.data[2] + e.data[2]) / 2;
                          var cSuccSlcPower = (b.data[3] + e.data[3]) / 2;
                          var cBulletPower = (b.data[4] + e.data[4]) / 2;
                          var cBulletPowerRed = (b.data[5] + e.data[5]) / 2;
                          var cSuccPowerMul = (b.data[7] + e.data[7]) / 2;
                          var cSuccRangeMul = (b.data[8] + e.data[8]) / 2;
                          
                          var cSize = [radius, cSuccPowerMul, cSuccRangeMul];
                          var cCol = [b.team.color, e.team.color];
                          var cForce = [cSuccPower, cSuccSlcPower, cBulletPower, cBulletPowerRed];
                          
                          var collideX = (b.x + e.x) / 2;
                          var collideY = (b.y + e.y) / 2;
                          
                          cataclysm.create(b.owner, b.team, collideX, collideY, Mathf.random(360), 69, 1, 1, [cSize, cCol, cForce]);
                          
                          Effect.shake(radius / 1.5, radius * 1.5, collideX, collideY);
                          
                          clearBullet(e, Fx.none);
                          clearBullet(b, Fx.none);
                        }else{
                          clearBullet(e, this.succEffect);
                          b.damage += fLib.bulletDamage(e.type) * e.damageMultiplier() * this.bulletAbsorbPercent;
                        }
                      }else{
                        clearBullet(e, this.succEffect);
                        b.damage += fLib.bulletDamage(e.type) * e.damageMultiplier() * this.bulletAbsorbPercent;
                      }
                    }
                  }
                }
              }
            }));
            
            Units.nearbyEnemies(b.team, b.x - b.data[6][2], b.y - b.data[6][2], b.data[6][2] * 2, b.data[6][2] * 2, cons(unit => {
              if(unit.within(b.x, b.y, b.data[6][2]) && Mathf.chance(this.unitAbsorbChance)){
                var interp = Interp.pow3In.apply(1 - (unit.dst(b) - b.data[6][1]) / b.data[6][0]);
                var dealt = b.damage * interp;
                //unit.damage(dealt);
                b.damage += dealt * this.damageIncreasePercent / 30; //Why / 30? Because it hits 30 times a second.
                unit.maxHealth -= dealt * this.maxHealthReduction;
                if(unit.maxHealth < 0) unit.maxHealth = 0.001;
                
                absorb.at(b.x, b.y, Angles.angle(b.x, b.y, unit.x, unit.y), [unit, Mathf.dst(b.x, b.y, unit.x, unit.y), unit.rotation, unit.mounts]);
                
                for(var i = 2; i < 6; i++){
                  b.data[i] += b.data[i] * this.strengthIncreasePercent * interp;
                }
                for(var i = 0; i < 5; i++){
                  b.data[6][i] += b.data[6][i] * this.strengthIncreasePercent * interp;
                }
              };
            }));
            
            Damage.damage(b.team, b.x, b.y, b.data[6][2], b.damage);
            
            var dist = (this.lifetime - b.time) * this.speed;
            var endX = Mathf.sinDeg(b.rotation() + 90) * dist;
            var endY = Mathf.cosDeg(b.rotation() - 90) * dist;
            
            if(b.time <= this.lifetime - 90){
              swirl.at(b.x, b.y, Mathf.random(360), [b, [b.data[6][0], this.swirlAngle], b.data[6][3]]);
            }
          }
          
          /*Vars.world.raycastEach(Vars.world.toTile(b.lastX), Vars.world.toTile(b.lastY), b.tileX(), b.tileY(), (x, y) => {
            const tile = Vars.world.build(x, y);
            if(tile == null) return;
            if(tile.collide(b) && !tile.dead && tile.team != b.team){
              this.hitTile(b, tile, tile.health, true);
            }
          });*/
        }
      },
      draw(b){
        Draw.z(Layer.bullet + 0.5);
        Draw.color(Color.black);
        Draw.rect(this.backRegion, b.x, b.y, b.data[6][1], b.data[6][1], 0);
        
        Draw.color(b.team.color);
        var f = Mathf.floor(b.time/5) % 3;
        Draw.rect(this.front[f], b.x, b.y, b.data[6][1], b.data[6][1],  0);
      },
      despawned(b){
        this.despawnEffect.at(b.x, b.y, b.rotation(), b.team.color);
      },
      hitTile(b, build, initialHealth, direct){
        if(build.team != b.team && direct){
          build.damage(b.damage * b.data[6][4]);
          this.hitEffect.at(b.x, b.y, b.rotation(), b.team.color);
          b.remove();
        }
      }
    });
    blackHole.damage = 575 / 30;
    blackHole.buildingDamageTicks = 10;
    blackHole.unitAbsorbChance = 0.4;
    blackHole.maxHealthReduction = 0.5;
    blackHole.bulletAbsorbPercent = 0.05;
    blackHole.damageIncreasePercent = 0.005;
    blackHole.strengthIncreasePercent = 0.005;
    
    blackHole.speed = 0.5;
    blackHole.lifetime = 420;
    blackHole.collides = false;
    blackHole.collidesTiles = true;
    blackHole.hitEffect = Fx.none;
    blackHole.despawnEffect = poof;
    blackHole.succEffect = bulletDissapear;
    blackHole.shootEffect = Fx.none;
    blackHole.smokeEffect = Fx.none;
    
    blackHole.cataclysmRadius = 15; //In tiles

    blackHole.succRadius = 64;
    blackHole.blackholeSize = size;
    blackHole.damageRadius = 24;
    blackHole.swirlAngle = 480;
    blackHole.swirlSize = 2;

    blackHole.force = 35;
    blackHole.scaledForce = 500;

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