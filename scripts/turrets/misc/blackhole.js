const blackholeSize = 6;
const succRadius = 64;

const swirl = new Effect(90, e => {
  const loc = new Vec2();
  const endX = Mathf.sinDeg(e.rotation + 90) * 45;
  const endY = Mathf.cosDeg(e.rotation - 90) * 45;
  
  loc.trns(Mathf.randomSeedRange(e.id, 360) + (480 * e.fin()), succRadius / 2 * e.fout());
  
	Draw.blend(Blending.normal);
  Draw.color(Color.valueOf("000000"));
  Draw.alpha(1);
	Fill.circle(e.x + loc.x + (e.fin() * endX), e.y + loc.y + (e.fin() * endY), 2 * e.fout());
	Draw.blend();
});

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

const chargeBegin = new Effect(50, e => {
  Draw.color(Color.valueOf("000000"));
  Fill.circle(e.x, e.y, e.fin() * (blackholeSize / 2));
});

const charge = new Effect(38, e => {
  Draw.color(Color.valueOf("000000"));
  const ln = new Floatc2({get(x, y){
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), e.fslope() * 3 + 1);
  }})
  Angles.randLenVectors(e.id, 2, 1 + 40 * e.fout(), e.rotation, 180, ln);
});

const ballOfSucc = extend(BasicBulletType, {
  load(){
    this.backRegion = Core.atlas.find("prog-mats-backhole-back"); //not funny
    this.front = [];
    
    for(var i = 0; i < 3; i++){
      this.front[i] = Core.atlas.find("prog-mats-backhole-" + i);
    }
  },
  update(b){
    const succ = new Vec2();
    
    if(b != null){
      if(b.timer.get(1, 5)){
        //Adapted from Graviton from AdvanceContent
        Units.nearbyEnemies(b.team, b.x - succRadius, b.y - succRadius, succRadius * 2, succRadius * 2, cons(unit => {
          if(unit.within(b.x, b.y, succRadius)){
            var targetMass = unit.mass();
            var angle = Angles.angle(unit.x, unit.y, b.x, b.y);
            succ.trns(angle, 11 / (targetMass / 5 + 1));
            unit.vel.add(succ);
          };
        }));
        
        //Adapted from Point Defence from AdvanceContent
        Groups.bullet.intersect(b.x - succRadius, b.y - succRadius, succRadius, succRadius, cons(e => {
          if(e != null){
            var dst2 = Mathf.dst2(e.x, e.y, b.x, b.y);
            if(Mathf.within(b.x, b.y, e.x, e.y, succRadius) && e != b && e.team != b.team){
              var target = Angles.angle(e.x, e.y, b.x, b.y);
              e.rotation(Mathf.slerpDelta(b.rotation(), target, 0.7));
              if(Mathf.within(b.x, b.y, e.x, e.y, blackholeSize)){
                e.remove();
              }
            }
          }
        }));
        
        Damage.damage(b.team, b.x, b.y, 24, this.damage/12, true);
        
        var dist = (this.lifetime - b.time) * this.speed;
        var endX = Mathf.sinDeg(b.rotation() + 90) * dist;
        var endY = Mathf.cosDeg(b.rotation() - 90) * dist;
        
        if(b.time <= this.lifetime - 90){
          swirl.at(b.x, b.y, b.rotation());
        }
      }
    }
  },
  draw(b){
    Draw.color(this.backColor);
    Draw.rect(this.backRegion, b.x, b.y, blackholeSize, blackholeSize, 0);
    
    var f = Mathf.round(b.time/5);
    for(var i = 0; i < 2; i++){
      if(f % 3 == i){
        Draw.color(this.frontColor);
        Draw.rect(this.front[i], b.x, b.y, blackholeSize, blackholeSize,  0);
      }
    }
  }
});

ballOfSucc.damage = 1500;
ballOfSucc.speed = 0.5;
ballOfSucc.lifetime = 384;
ballOfSucc.collides = false;
ballOfSucc.collidesTiles = false;
ballOfSucc.hitEffect = poof;
ballOfSucc.despawnEffect = poof;
ballOfSucc.shootEffect = Fx.none;
ballOfSucc.smokeEffect = Fx.none;

ballOfSucc.backColor = Color.valueOf("000000");
ballOfSucc.frontColor = Color.valueOf("353535");

const blackhole = extendContent(ChargeTurret, "blackhole-i", {
  setStats(){
    this.super$setStats();
    
    //damages every 5 ticks
    this.stats.remove(Stat.damage);
    this.stats.add(Stat.damage, this.shootType.damage / 60 * 12, StatUnit.perSecond);
  },
  icons(){	
    return [	
      Core.atlas.find("block-4"),	
      Core.atlas.find("prog-mats-blackhole-i-icon")	
    ];	
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
blackhole.cooldown = 0.015;
blackhole.expanded = true;

blackhole.buildType = () => {
  var succEntity = extendContent(ChargeTurret.ChargeTurretBuild, blackhole, {
    shoot(type){
      const vec = new Vec2();
      this.useAmmo();

      vec.trns(this.rotation, 9 - this.recoil);
      blackhole.chargeBeginEffect.at(this.x + vec.x, this.y + vec.y, this.rotation);
      
      for(var i = 0; i < blackhole.chargeEffects; i++){
        Time.run(Mathf.random(blackhole.chargeMaxDelay), run(() => {
          blackhole.chargeEffect.at(this.x + vec.x, this.y + vec.y, this.rotation);
        }));
      }
      
      this.shooting = true;

      Time.run(blackhole.chargeTime, run(() => {
        this.recoil = blackhole.recoilAmount;
        this.heat = 1;
        type.create(this, this.team, this.x + vec.x, this.y + vec.y, this.rotation, 1, 1);
        this.shooting = false;
      }));
    }
  });
  
  return succEntity;
};