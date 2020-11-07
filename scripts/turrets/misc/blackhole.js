const blackholeSize = 6;
const succRadius = 64;
const horizon = Color.valueOf("bd5200");
const horizonRad = 5;

const loc = new Vec2();
const vec = new Vec2();
const succ = new Vec2();

const swirl = new Effect(90, e => {
  loc.trns(e.rotation + (480 * e.fin()), succRadius / 2 * e.fout());
  
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
    if(b != null){
      if(b.timer.get(1, 2)){
        //Adapted from Graviton from AdvanceContent
        Units.nearbyEnemies(b.team, b.x - succRadius, b.y - succRadius, succRadius * 2, succRadius * 2, cons(unit => {
          if(unit.within(b.x, b.y, succRadius)){
            var angle = Angles.angle(unit.x, unit.y, b.x, b.y);
            succ.trns(angle, 11);
            unit.impulse(succ);
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
        
        Damage.damage(b.team, b.x, b.y, 24, this.damage, true);
        
        var dist = (this.lifetime - b.time) * this.speed;
        var endX = Mathf.sinDeg(b.rotation() + 90) * dist;
        var endY = Mathf.cosDeg(b.rotation() - 90) * dist;
        
        if(b.time <= this.lifetime - 90){
          swirl.at(b.x, b.y,Mathf.random(360), [b]);
        }
      }
    }
  },
  draw(b){
    Draw.z(Layer.bullet + 0.5);
    Draw.color(this.backColor);
    Draw.rect(this.backRegion, b.x, b.y, blackholeSize, blackholeSize, 0);
    
    Draw.color(this.frontColor);
    var f = Mathf.floor(b.time/5) % 3;
    Draw.rect(this.front[f], b.x, b.y, blackholeSize, blackholeSize,  0);
  }
});

ballOfSucc.damage = 575 / 30;
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
ballOfSucc.lightColor = horizon;
ballOfSucc.lightRadius = blackholeSize / 2 + horizonRad;
ballOfSucc.lightOpacity = 0.7;

const blackhole = extendContent(ChargeTurret, "blackhole", {
  setStats(){
    this.super$setStats();
    
    //damages every 5 ticks
    this.stats.remove(Stat.damage);
    this.stats.add(Stat.damage, this.shootType.damage * 30, StatUnit.perSecond);
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
blackhole.shootY = 0;

blackhole.buildType = () => {
  var succEntity = extendContent(ChargeTurret.ChargeTurretBuild, blackhole, {
    shoot(type){
      this.useAmmo();

      vec.trns(this.rotation -90, 0, blackhole.size * 4 - this.recoil + blackhole.shootY);
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