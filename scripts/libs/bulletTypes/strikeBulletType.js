module.exports = {
  strikeBullet(autoDropRad, stopRad, resumeSeek, startOnOwner, givenData, snapRot, obj){
    let autoDrop = autoDropRad > 0;
    let stop = stopRad > 0;

    if(obj == undefined) obj = {};
    obj = Object.assign({
      init(b){
        if(!b) return;
        this.super$init(b);
        
        // (Owner x, Owner y, angle, reset speed)
        // Owner coords are placed in data in case it dies while the bullet is still active. Don't want null errors.
        if(!givenData || givenData && b.data == null){
          let x = startOnOwner ? b.owner.x : b.x;
          let y = startOnOwner ? b.owner.y : b.y;
          b.data = [x, y, 0, false];
        }
        b.fdata = -69420;
        
        this.drawSize = this.elevation + 24;
      },
      update(b){
        if(!b) return;
        
        let x = b.data[0];
        let y = b.data[1];
        let rise = Interp.pow5In.apply(Mathf.curve(b.time, 0, this.riseTime));
        let rRocket = Interp.pow5In.apply(Mathf.curve(b.time, 0, this.riseEngineTime)) - Interp.pow5In.apply(Mathf.curve(b.time, this.riseEngineTime, this.riseTime));
        let weave = this.weaveWidth > 0 ? Mathf.sin(b.time * this.weaveSpeed) * this.weaveWidth * Mathf.signs[Mathf.round(Mathf.randomSeed(b.id, 1))] * rise : 0;
        if(rise < 0.999 && Mathf.chanceDelta(this.smokeTrailChance)){
          this.rocketEffect.at(x + weave + Mathf.range(this.trailRnd * rRocket), y + rise * this.elevation + this.engineOffset + Mathf.range(this.trailRnd * rRocket), this.trailSize * rRocket);
        }
        
        let target = Units.bestTarget(b.team, b.x, b.y, this.homingRange, e => !e.dead && (e.isGrounded() && this.collidesGround) || (e.isFlying() && this.collidesAir), b => true, this.unitSort);
        
        //Instant drop
        let dropTime = (1 - Mathf.curve(b.time, 0, this.riseTime)) + Mathf.curve(b.time, b.lifetime - this.fallTime, b.lifetime);
        if(autoDrop && dropTime == 0 && target != null){
          if(Mathf.within(b.x, b.y, target.x, target.y, autoDropRad)){
            b.time = b.lifetime - this.fallTime;
          }
        }
        //Stop/Start when over target
        if(target != null && stop){
          let inRange = Mathf.within(b.x, b.y, target.x, target.y, stopRad);
          if(inRange && !b.data[3]){
            b.data[2] = b.vel.len();
            b.data[3] = true;
            b.vel.trns(b.vel.angle(), 0.001);
          }else if(resumeSeek && (!inRange || target.dead || target.health < 0) && b.data[3]){
            b.vel.trns(b.vel.angle(), b.data[2]);
            b.data[3] = false;
          }
        }
        
        if(this.homingPower > 0 && b.time >= this.homingDelay){
          if(target != null){
            b.vel.setAngle(Mathf.slerpDelta(b.rotation(), b.angleTo(target), this.homingPower));
          }
        }

        if(this.weaveMag > 0){
          let scl = Mathf.randomSeed(b.id, 0.9, 1.1);
          b.vel.rotate(Mathf.sin(b.time + Mathf.PI * this.weaveScale/2 * scl, this.weaveScale * scl, this.weaveMag) * Time.delta);
        }
        
        if(!b.data[3]){
          if(this.trailChance > 0){
            if(Mathf.chanceDelta(this.trailChance)){
              this.trailEffect.at(b.x, b.y, this.trailParam, this.teamTrail ? b.team.color : this.trailColor);
            }
          }
        }
      },
      draw(b){
        //Variables
        let x = b.data[0];
        let y = b.data[1];
        let rise = Interp.pow5In.apply(Mathf.curve(b.time, 0, this.riseTime));
        let fadeOut = 1 - rise;
        let fadeIn = Mathf.curve(b.time, b.lifetime - this.fallTime, b.lifetime);
        let fall = 1 - fadeIn;
        let a = fadeOut + Interp.pow5Out.apply(fadeIn);
        let rRocket = Interp.pow5In.apply(Mathf.curve(b.time, 0, this.riseEngineTime)) - Interp.pow5In.apply(Mathf.curve(b.time, this.riseEngineTime, this.riseTime));
        let fRocket = Interp.pow5In.apply(Mathf.curve(b.time, b.lifetime - this.fallTime, b.lifetime - this.fallTime + this.fallEngineTime));
        let target = Mathf.curve(b.time, 0, 8) - Mathf.curve(b.time, b.lifetime - 8, b.lifetime);
        let rot = snapRot ? b.rotation() + 90 : rise * this.riseSpin + fadeIn * this.fallSpin;
        Tmp.v1.trns(225, rise * this.elevation * 2);
        Tmp.v2.trns(225, fall * this.elevation * 2);
        let rY = y + rise * this.elevation;
        let fY = b.y + fall * this.elevation;
        let side = Mathf.signs[Mathf.round(Mathf.randomSeed(b.id, 1))];
        let weave = Mathf.sin(b.time * this.weaveSpeed) * this.weaveWidth * side;
        let rWeave = this.weaveWidth > 0 ? weave * rise : 0;
        let fWeave = this.weaveWidth > 0 ? weave * fall : 0;
        let rX = x + rWeave;
        let fX = b.x + fWeave;
        
        //Target
        let radius = this.targetRad * target;
        if(autoDrop){
          let dropAlpha = Mathf.curve(b.time, this.riseTime * 2/3, this.riseTime) - Mathf.curve(b.time, b.lifetime - 8, b.lifetime);
          Draw.z(Layer.bullet + 0.001);
          Draw.color(Color.red, (0.25 + 0.5 * Mathf.absin(16, 1)) * dropAlpha);
          Fill.circle(b.x, b.y, autoDropRad);
        }
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
        if(fadeOut > 0 && fadeIn == 0){
          //Engine stolen from launchpad
          if(this.riseEngineSize > 0){
            Draw.z(Layer.effect + 0.001);
            Draw.color(this.engineLightColor);
            Fill.light(rX, rY, 10, this.riseEngineSize * 1.5625 * rRocket, Tmp.c1.set(Pal.engine).mul(1, 1, 1, rRocket), Tmp.c2.set(Pal.engine).mul(1, 1, 1, 0));
            for(let i = 0; i < 4; i++){
              Drawf.tri(rX, rY, this.riseEngineSize * 0.375, this.riseEngineSize * 2.5 * rRocket, i * 90 + (Time.time * 1.5 + Mathf.randomSeed(b.id, 360)));
            }
            Drawf.light(b.team, rX, rY, this.riseEngineLightRadius * rRocket, this.engineLightColor, this.engineLightOpacity * rRocket);
          }
          //Missile itself
          Draw.z(Layer.weather - 1);
          Draw.color();
          Draw.alpha(a);
          Draw.rect(this.frontRegion, rX, rY, this.frontRegion.width * Draw.scl, this.frontRegion.height * Draw.scl, rot);
          Drawf.light(b.team, rX, rY, this.lightRadius, this.lightColor, this.lightOpacity);
          //Missile shadow
          Draw.z(Layer.flyingUnit + 1);
          Draw.color(0, 0, 0, 0.22 * a);
          Draw.rect(this.frontRegion, rX + Tmp.v1.x, rY + Tmp.v1.y, this.frontRegion.width * Draw.scl, this.frontRegion.height * Draw.scl, rot + this.shadowRot);
        }else if(fadeOut == 0 && fadeIn > 0){
          //Missile itself
          Draw.z(Layer.weather - 2);
          Draw.color();
          Draw.alpha(a);
          Draw.rect(this.backRegion, fX, fY, this.backRegion.width * Draw.scl, this.backRegion.height * Draw.scl, rot + 180);
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
          Draw.rect(this.backRegion, fX + Tmp.v2.x, fY + Tmp.v2.y, this.backRegion.width * Draw.scl, this.backRegion.height * Draw.scl, rot + this.shadowRot + 180 + Mathf.randomSeed(b.id + 3, 360));
        }

        Draw.reset();
      },
      drawLight(b){
      },
      sprite: "error",
      trailChance: 0.5,
      smokeTrailChance: 0.75,
      teamTrail: true,
      rocketEffect: Fx.rocketSmoke,
      ammoMultiplier: 1,
      backMove: false,
      
      shadowRot: 0,
      
      weaveWidth: 0,
      weaveSpeed: 0,
      
      targetRad: 1,
      
      riseEngineTime: 0,
      riseEngineSize: 8,
      fallEngineTime: 8,
      fallEngineSize: 6,
      engineOffset: 0,
      
      trailRnd: 3,
      trailSize: 0.5,
      
      riseTime: 60,
      fallTime: 20,
      elevation: 200,
      
      collides: false,
      hittable: false,
      absorbable: false,
      
      hitEffect: Fx.blockExplosionSmoke,
      despawnEffect: Fx.massiveExplosion,
      shootEffect: Fx.none,
      smokeEffect: Fx.none,
      
      lightRadius: 32,
      lightOpacity: 0.6,
      lightColor: Pal.engine,
      
      riseEngineLightRadius: 56,
      fallEngineLightRadius: 42,
      engineLightOpacity: 0.8,
      engineLightColor: Pal.engine,
      
      riseSpin: 0,
      fallSpin: 0
    }, obj);
    
    const strike = extend(BasicBulletType, obj);
    strike.unitSort = (u, x, y) => Mathf.dst2(x, y, u.x, u.y);
    
    return strike;
  }
}