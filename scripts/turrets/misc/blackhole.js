const blackholeSize = 6;

const swirl = newEffect(90, e => {
  const loc = new Vec2();
  const endX = Mathf.sinDeg(e.rotation+90) * 45;
  const endY = Mathf.cosDeg(e.rotation-90) * 45;
  
  loc.trns(e.id + (480 * e.fin()), 48 * e.fout());
  
	Draw.blend(Blending.normal);
  Draw.color(Color.valueOf("000000"));
  Draw.alpha(1);
	Fill.circle(e.x + loc.x + (e.fin() * endX), e.y + loc.y + (e.fin() * endY), 2 * e.fout());
	Draw.blend();
});

const poof = newEffect(24, e => {
  Draw.color(Color.valueOf("353535"), Color.valueOf("000000"), e.fin());
  
  e.scaled(12, Cons(s => {
    Lines.stroke(0.5 + s.fout());
    Lines.circle(e.x, e.y, s.fin() * 10);
  }))
  
  const ln = new Floatc2({get(x, y){
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), e.fout() * 4 + 1.5);
  }})
  
  Lines.stroke(0.5 + e.fout() * 1.5);
  Angles.randLenVectors(e.id, 8, e.fin() * 30, e.rotation, 180, ln);
});

const chargeBegin = newEffect(50, e => {
  Draw.color(Color.valueOf("000000"));
  Fill.circle(e.x, e.y, e.fin()*(blackholeSize/2));
});

const charge = newEffect(38, e => {
  Draw.color(Color.valueOf("000000"));
  const ln = new Floatc2({get(x, y){
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), e.fslope() * 3 + 1);
  }})
  Angles.randLenVectors(e.id, 2, 1 + 40 * e.fout(), e.rotation, 180, ln);
});

const blackhole = extendContent(ChargeTurret, "blackhole-i", {
  shoot(tile, type){
    const vec = new Vec2();
    const const entity = tile.ent();
    this.useAmmo(tile);

    vec.trns(entity.rotation, 9 - entity.recoil);
    Effects.effect(this.chargeBeginEffect, entity.x + vec.x, entity.y + vec.y, entity.rotation);
    
    for(i = 0; i < this.chargeEffects; i++){
      Time.run(Mathf.random(this.chargeMaxDelay), run(() => {
        Effects.effect(this.chargeEffect, entity.x + vec.x, entity.y + vec.y, entity.rotation);
      }));
    }
    
    entity.shooting = true;

    Time.run(this.chargeTime, run(() => {
      entity.recoil = this.recoil;
      entity.heat = 1;
      Calls.createBullet(type, entity.getTeam(), entity.x + vec.x, entity.y + vec.y, entity.rotation, 1, 1);
      entity.shooting = false;
    }));
  }
});

blackhole.chargeEffect = charge;
blackhole.chargeBeginEffect = chargeBegin;
blackhole.chargeTime = 50;
blackhole.chargeMaxDelay = 30;
blackhole.chargeEffects = 16;
blackhole.recoil = 2;
blackhole.heatColor = Color.valueOf("000000");
blackhole.restitution = 0.015;
blackhole.cooldown = 0.015;
blackhole.expanded = true;

blackhole.shootType = extend(BasicBulletType, {
  load(){
    this.backRegion = Core.atlas.find("definitely-not-advance-content-backhole-back"); //not funny
    this.front0 = Core.atlas.find("definitely-not-advance-content-backhole-0");
    this.front1 = Core.atlas.find("definitely-not-advance-content-backhole-1");
    this.front2 = Core.atlas.find("definitely-not-advance-content-backhole-2");
  },
  setStats(){
    this.super$setStats();
    
    this.stats.remove(BlockStat.damage);
    //damages every 2 ticks
    this.stats.add(BlockStat.damage, this.shootType.damage, StatUnit.perSecond);
  },
  update(b){
    const succ = new Vec2();
    const radius = 48;
    
    if(b != null){
      if(b.timer.get(1, 2)){
        //Adapted from Graviton from AdvanceContent
        Units.nearbyEnemies(b.getTeam(), b.x - radius, b.y - radius, radius * 2, radius * 2, cons(unit => {
          if(unit.withinDst(b.x, b.y, radius)){
            if(unit instanceof SolidEntity){
              var targetMass = 0;
              
              if(unit instanceof BaseUnit) targetMass = unit.getType().mass;
              if(unit instanceof Player) targetMass = unit.mech.mass;
              
              var angle = Angles.angle(unit.x, unit.y, b.x, b.y);
              succ.trns(angle, 16 / (targetMass / 5 + 1));
              
              unit.velocity().add(succ.x, succ.y);
            }
          };
        }));
        
        //Adapted from Point Defence from AdvanceContent
        Vars.bulletGroup.intersect(b.x - radius, b.y - radius, radius * 2, radius * 2, cons(e => {
          if(e != null){
            var dst2 = Mathf.dst2(e.x, e.y, b.x, b.y);
            if(Mathf.within(b.x, b.y, e.x, e.y, radius) && e != b && e.getTeam() != b.getTeam()){
              var target = Angles.angle(e.x, e.y, b.x, b.y);
              e.rot(Mathf.slerpDelta(b.rot(), target, 0.9));
              if(Mathf.within(b.x, b.y, e.x, e.y, blackholeSize/2)){
                e.remove();
              }
            }
          }
        }));
        
        Damage.damage(b.getTeam(), b.x, b.y, 24, this.damage/30, true);
        
        var dist = (this.lifetime - b.time()) * this.speed;
        var endX = Mathf.sinDeg(b.rot()+90) * dist;
        var endY = Mathf.cosDeg(b.rot()-90) * dist;
        
        if(b.time() <= this.lifetime - 90){
          Effects.effect(swirl, b.x, b.y, b.rot());
        }
      }
    }
  },
  draw(b){
    Draw.color(this.backColor);
    Draw.rect(this.backRegion, b.x, b.y, blackholeSize, blackholeSize, 0);
    
    var f = Mathf.round(b.time()/5);
    if(f%3 == 0){
      Draw.color(this.frontColor);
      Draw.rect(this.front0, b.x, b.y, blackholeSize, blackholeSize,  0);
    }
    if(f%3 == 1){
      Draw.color(this.frontColor);
      Draw.rect(this.front1, b.x, b.y, blackholeSize, blackholeSize,  0);
    }
    if(f%3 == 2){
      Draw.color(this.frontColor);
      Draw.rect(this.front2, b.x, b.y, blackholeSize, blackholeSize,  0);
    } 
  }
});

blackhole.shootType.damage = 1500;
blackhole.shootType.speed = 0.5;
blackhole.shootType.lifetime = 384;
blackhole.shootType.collides = false;
blackhole.shootType.collidesTiles = false;
blackhole.shootType.hitEffect = poof;
blackhole.shootType.despawnEffect = poof;
blackhole.shootType.shootEffect = Fx.none;
blackhole.shootType.smokeEffect = Fx.none;

blackhole.shootType.backColor = Color.valueOf("000000");
blackhole.shootType.frontColor = Color.valueOf("353535");