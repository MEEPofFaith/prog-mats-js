module.exports = {
  strikeBullet(autoDrop, autoDropRad, stopRad, resumeSeek, startOnOwner, givenData){
    const strike = extend(BasicBulletType, {
      init(b){
        if(!b) return;
        this.super$init(b);
        
        // (Owner x, Owner y, angle, reset speed)
        // Owner coords are placed in data in case it dies while the bullet is still active. Don't want null errors.
        if(!givenData){
          var x = startOnOwner ? b.owner.x : b.x;
          var y = startOnOwner ? b.owner.y : b.y;
          b.data = [x, y, 0, false];
        }
      },
      update(b){
        if(!b) return;
        
        var owner = b.owner;
        var x = b.data[0];
        var y = b.data[1];
        var rise = Interp.pow2In.apply(Mathf.curve(b.time, 0, this.riseTime));
        var rocket = Interp.pow2In.apply(Mathf.curve(b.time, 0, this.engineTime)) - Interp.pow2In.apply(Mathf.curve(b.time, this.engineTime, this.riseTime));
        if(rise < 0.999){
          Fx.rocketSmoke.at(x + Mathf.range(this.trailRnd * rocket), y + rise * this.elevation + this.engineOffset + Mathf.range(this.trailRnd * rocket), this.trailSize * rocket);
        }
        
        var target = Units.closestTarget(b.team, b.x, b.y, this.homingRange, e => (e.isGrounded() && this.collidesGround) || (e.isFlying() && this.collidesAir), t => this.collidesGround);
        //Instant drop
        var dropTime = (1 - Mathf.curve(b.time, 0, this.riseTime)) + Mathf.curve(b.time, b.lifetime - this.fallTime, b.lifetime);
        if(autoDrop && dropTime == 0 && target != null){
          if(Mathf.within(b.x, b.y, target.x, target.y, autoDropRad)){
            b.time = b.lifetime - this.fallTime;
          }
        }
        //Stop/Start when over target
        if(target != null){
          var inRange = Mathf.within(b.x, b.y, target.x, target.y, stopRad);
          if(inRange && !b.data[3]){
            b.data[2] = b.vel.len();
            b.data[3] = true;
            b.vel.trns(b.vel.angle(), 0.001);
          }else if(!inRange && resumeSeek && b.data[3]){
            b.vel.trns(b.vel.angle(), b.data[2]);
            b.data[3] = false;
          }
        }
        
        this.super$update(b);
      },
      draw(b){
        //Variables
        var x = b.data[0];
        var y = b.data[1];
        var rise = Interp.pow2In.apply(Mathf.curve(b.time, 0, this.riseTime));
        var fadeOut = 1 - rise;
        var fadeIn = Mathf.curve(b.time, b.lifetime - this.fallTime, b.lifetime);
        var fall = 1 - fadeIn;
        var a = fadeOut + fadeIn;
        var rocket = Interp.pow2In.apply(Mathf.curve(b.time, 0, this.engineTime)) - Interp.pow2In.apply(Mathf.curve(b.time, this.engineTime, this.riseTime));
        var target = Mathf.curve(b.time, 0, 8) - Mathf.curve(b.time, b.lifetime - 8, b.lifetime);
        
        //Target
        var radius = this.targetRad * target;
        Draw.z(Layer.turret + 1);
        Draw.color(Pal.gray, target);
        Lines.stroke(3);
        Lines.poly(b.x, b.y, 4, 7 * radius, Time.time * 1.5 + Mathf.randomSeed(b.id, 360));
        Lines.spikes(b.x, b.y, 3 * radius, 6 * radius, 4, Time.time * 1.5 + Mathf.randomSeed(b.id, 360));
        Draw.color(b.team.color, target);
        Lines.stroke(1);
        Lines.poly(b.x, b.y, 4, 7 * radius, Time.time * 1.5 + Mathf.randomSeed(b.id, 360));
        Lines.spikes(b.x, b.y, 3 * radius, 6 * radius, 4, Time.time * 1.5 + Mathf.randomSeed(b.id, 360));
        Draw.reset;
        
        //Strike
        if(fadeOut > 0 && fadeIn == 0){
          //Engine stolen from launchpad
          Draw.z(Layer.effect + 0.001);
          Draw.color(Pal.engine);
          Fill.light(x, y + rise * this.elevation + this.engineOffset, 10, this.engineSize * 1.5625 * rocket, Tmp.c1.set(Pal.engine).mul(1, 1, 1, rocket), Tmp.c2.set(Pal.engine).mul(1, 1, 1, 0));
          for(var i = 0; i < 4; i++){
            Drawf.tri(x, y + rise * this.elevation + this.engineOffset, this.engineSize * 0.375, this.engineSize * 2.5 * rocket, i * 90 + (Time.time * 1.5 + Mathf.randomSeed(b.id, 360)));
          }
          Drawf.light(b.team, x, y + rise * this.elevation + this.engineOffset, this.engineLightRadius * rocket, this.engineLightColor, this.engineLightOpacity * rocket);
          //Missile itself
          Draw.z(Layer.flyingUnit + 1);
          Draw.color(this.backColor, a);
          Draw.rect(this.backRegion, x, y + rise * this.elevation + this.bulletOffset, this.width, this.height, 0);
          Draw.color(this.frontColor, a);
          Draw.rect(this.frontRegion, x, y + rise * this.elevation + this.bulletOffset, this.width, this.height, 0);
          Drawf.light(b.team, x, y + rise * this.elevation + this.bulletOffset, this.lightRadius, this.lightColor, this.lightOpacity);
        }else if(fadeOut == 0 && fadeIn > 0){
          Draw.z(Layer.flyingUnit + 1);
          Draw.color(this.backColor, a);
          Draw.rect(this.backRegion, b.x, b.y + fall * this.elevation, this.width, this.height, 180);
          Draw.color(this.frontColor, a);
          Draw.rect(this.frontRegion, b.x, b.y + fall * this.elevation, this.width, this.height, 180);
          Drawf.light(b.team, b.x, b.y + fall * this.elevation, this.lightRadius, this.lightColor, this.lightOpacity);
        }

        Draw.reset();
      },
      drawLight(b){
      }
    });
    strike.sprite = "missile";
    
    strike.targetRad = 1;
    
    strike.engineTime = 0;
    strike.engineSize = 8;
    strike.engineOffset = 0;
    
    strike.bulletOffset = 8;
    
    strike.trailRnd = 3;
    strike.trailSize = 0.5;
    
    strike.riseTime = 60;
    strike.fallTime = 20;
    strike.elevation = 200;
    
    strike.collides = false;
    strike.hittable = false;
    strike.absorbable = false;
    
    strike.hitEffect = Fx.blockExplosionSmoke;
    strike.despawnEffect = Fx.massiveExplosion;
    strike.shootEffect = Fx.none;
    strike.smokeEffect = Fx.none;
    
    strike.lightRadius = 32;
    strike.lightOpacity = 0.6;
    strike.lightColor = Pal.engine;
    
    strike.engineLightRadius = 56;
    strike.engineLightOpacity = 0.8;
    strike.engineLightColor = Pal.engine;
    
    return strike;
  }
}