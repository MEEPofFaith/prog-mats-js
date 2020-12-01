const tV = new Vec2();
const tV2 = new Vec2();

//Stolen effect from [redacted] from [redacted/redacted]
//Which I now just stole from myself.
//Why do I keep stealing things.
const targetLightning = new Effect(10, 500, e => {
	var length = e.data[0];
	var tileLength = Mathf.round(length / 8);
	
	Lines.stroke(e.data[1] * e.fout());
	Draw.color(e.color, Color.white, e.fin());
	
	for(var i = 0; i < tileLength; i++){
		var offsetXA = (i == 0) ? 0 : Mathf.randomSeed(e.id + (i * 6413), -4.5, 4.5);
		var offsetYA = (length / tileLength) * i;
		
		var f = i + 1;
		
		var offsetXB = (f == tileLength) ? 0 : Mathf.randomSeed(e.id + (f * 6413), -4.5, 4.5);
		var offsetYB = (length / tileLength) * f;
		
		tV.trns(e.rotation, offsetYA, offsetXA);
		tV.add(e.x, e.y);
		
		tV2.trns(e.rotation, offsetYB, offsetXB);
		tV2.add(e.x, e.y);
		
		Lines.line(tV.x, tV.y, tV2.x, tV2.y, false);
    Drawf.light(e.data[2], tV.x, tV.y, tV2.x, tV2.y, e.data[1] * 3, e.color, 0.7);
		Fill.circle(tV.x, tV.y, Lines.getStroke() / 2);
	};
  Fill.circle(tV2.x, tV2.y, Lines.getStroke() / 2);
});
targetLightning.layer = Layer.turret + 0.5;

//Editable stuff for custom laser.
var colors = [Color.valueOf("EC7458"), Color.valueOf("F58859"), Color.valueOf("FF9C5A")];
var length = 16;
const burnRadius = 18;

//Overall width of each color.
var strokes = [burnRadius, burnRadius / 1.333, burnRadius / 1.666];

var osc = 3;

var tmpColor = new Color();
const vec = new Vec2();
const lavaBack = new Vec2();

const lavaPool = extend(BasicBulletType, {
  update(b){
    if(b != null){
      if(b.owner.targetPos != null){
        var target = Angles.angle(b.x, b.y, b.owner.targetPos.x, b.owner.targetPos.y);
        b.rotation(Mathf.slerpDelta(b.rotation(), target, 0.15));
      };
      
      if(b.timer.get(1, 5)){
        Damage.damage(b.team, b.x, b.y, burnRadius, this.damage, true);
      };
      
      Puddles.deposit(Vars.world.tileWorld(b.x, b.y), Vars.content.getByName(ContentType.liquid, "prog-mats-magma"), 30000);
      Puddles.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.slag, 1);
    };
  },
  drawLight(b){
  },
  draw(b){
    if(b != null){
      //bottom
      Draw.color(colors[0]);
      Draw.alpha(b.fout());
      Fill.circle(b.x, b.y, strokes[0]);
      
      //pulsing
      for(var s = 0; s < colors.length; s++){
        Draw.color(tmpColor.set(colors[s]).mul(1.0 + Mathf.absin(Time.time / 3 + Mathf.randomSeed(b.id), 1.0, 0.3) / 3));
        Draw.alpha(b.fout());
        Fill.circle(b.x, b.y, strokes[s] * Mathf.absin((Time.time / ((s + 2) * osc)) + Mathf.randomSeed(b.id), 0.8, 1));
      }
      
      //ring
      Draw.color(colors[0]);
      Draw.alpha(b.fout());
      Lines.stroke(2);
      Lines.circle(b.x, b.y, strokes[0]);
      
      Draw.reset();
    }
  }
});

lavaPool.speed = 1;
lavaPool.damage = 50;
lavaPool.lifetime = 10;
lavaPool.collides = false;
lavaPool.collidesTiles = false;
lavaPool.hitEffect = Fx.fireballsmoke;
lavaPool.despawnEffect = Fx.none;
lavaPool.shootEffect = Fx.none;
lavaPool.smokeEffect = Fx.none;
lavaPool.hittable = false;
lavaPool.absorbable = false;
lavaPool.lightRadius = 2;
lavaPool.lightOpacity = 0.7;
lavaPool.lightColor = colors[2];

//Got some help from EoD for the turning LaserTurret into PowerTurret part
const lavaRiser = extendContent(PowerTurret, "eruptor-i", {
  load(){
    this.caps = [];
    this.outlines = [];
    this.heatRegions = [];
    
    this.baseRegion = Core.atlas.find("block-3");
    this.turretRegion = Core.atlas.find(this.name + "-turret");
    this.cells = Core.atlas.find(this.name + "-cells");
    for(var i = 0; i < 2; i++){
      this.heatRegions[i] = Core.atlas.find(this.name + "-heat-" + i);
    }
    for(var i = 0; i < 4; i++){
      this.caps[i] = Core.atlas.find(this.name + "-caps-" + i);
    }
    for(var i = 0; i < 5; i++){
      this.outlines[i] = Core.atlas.find(this.name + "-outline-" + i);
    }
  },
  setStats(){
    this.super$setStats();
    
    this.stats.remove( Stat.inaccuracy);
    
    //damages every 5 ticks
    this.stats.remove(Stat.damage);
    this.stats.add(Stat.damage, lavaRiser.shootType.damage * 60 / 5, StatUnit.perSecond);
  },
  icons(){
    return [
      Core.atlas.find("block-3"),
      Core.atlas.find(this.name + "-icon")
    ];
  }
});

lavaRiser.shootType = lavaPool;
lavaRiser.shootDuration = 180;
lavaRiser.range = 240;
lavaRiser.maxRange = 360;
lavaRiser.reloadTime = 60;
lavaRiser.recoilAmount = 3;
lavaRiser.COA = 0.75;
lavaRiser.cellHeight = 1;
lavaRiser.rotateSpeed = 3;
lavaRiser.firingMoveFract = 0.8;
lavaRiser.shootEffect = Fx.none;
lavaRiser.smokeEffect = Fx.none;
lavaRiser.ammoUseEffect = Fx.none;
lavaRiser.capClosing = 0.01;
lavaRiser.heatColor = Color.valueOf("f08913");

const shootLoc = new Vec2();

lavaRiser.buildType = () => {
	var eruptEntity = extendContent(PowerTurret.PowerTurretBuild, lavaRiser, {
    setEff(){
      this._bullet = null;
      this._bulletLife = 0;
      this._cellOpenAmounts = [0, 0];
    },
    draw(){
      const open = new Vec2();
      const back = new Vec2();
      const trnsX = [-1, 1, -1, 1];
      const trnsY = [-1, -1, 1, 1];
      const alternate = [1, 1, 0, 0];
      
      Draw.rect(lavaRiser.baseRegion, this.x, this.y, 0);
      
      Draw.z(Layer.turret + 1);
      
      back.trns(this.rotation - 90, 0, -this.recoil);
      
      Draw.rect(lavaRiser.outlines[0], this.x + back.x, this.y + back.y, this.rotation - 90);
      for(var i = 0; i < 4; i ++){
      open.trns(this.rotation - 90, 0 + (this._cellOpenAmounts[alternate[i]] * trnsX[i]), this._cellOpenAmounts[alternate[i]] * trnsY[i]);
        Draw.rect(lavaRiser.outlines[i + 1], this.x + open.x + back.x, this.y + open.y + back.y, this.rotation - 90);
      }
      
      Drawf.shadow(lavaRiser.turretRegion, this.x + back.x - (lavaRiser.size / (1 + (1/3))), this.y + back.y - (lavaRiser.size / (1 + (1/3))), this.rotation - 90);
      Draw.rect(lavaRiser.turretRegion, this.x + back.x, this.y + back.y, this.rotation - 90);
      
      if(this.heat > 0.00001){
        Draw.blend(Blending.additive);
        Draw.color(lavaRiser.heatColor, this.heat);
        Draw.rect(lavaRiser.heatRegions[0], this.x + back.x, this.y + back.y, this.rotation - 90);
        Draw.blend();
        Draw.color();
      }
      
      Drawf.shadow(lavaRiser.cells, this.x + back.x - lavaRiser.cellHeight, this.y + back.y - lavaRiser.cellHeight, this.rotation - 90);
      
      for(var i = 0; i < 4; i ++){
      open.trns(this.rotation - 90, this._cellOpenAmounts[alternate[i]] * trnsX[i], this._cellOpenAmounts[alternate[i]] * trnsY[i]);
        Drawf.shadow(lavaRiser.caps[i], this.x + open.x + back.x - lavaRiser.cellHeight, this.y + open.y + back.y - lavaRiser.cellHeight, this.rotation - 90);
      }
      
      Draw.rect(lavaRiser.cells, this.x + back.x, this.y + back.y, this.rotation - 90);
      
      if(this.heat > 0.00001){
        Draw.blend(Blending.additive);
        Draw.color(lavaRiser.heatColor, this.heat);
        Draw.rect(lavaRiser.heatRegions[1], this.x + back.x, this.y + back.y, this.rotation - 90);
        Draw.blend();
        Draw.color();
      }
      
      for(var i = 0; i < 4; i ++){
      open.trns(this.rotation - 90, 0 + (this._cellOpenAmounts[alternate[i]] * trnsX[i]), this._cellOpenAmounts[alternate[i]] * trnsY[i]);
        Draw.rect(lavaRiser.caps[i], this.x + open.x + back.x, this.y + open.y + back.y, this.rotation - 90);
      }
    },
    updateTile(){
      this.super$updateTile();
      
      if(this._bulletLife <= 0 && this._bullet == null){
        for(var i = 0; i < 2; i ++){
          this._cellOpenAmounts[i] = Mathf.lerpDelta(this._cellOpenAmounts[i], 0, lavaRiser.capClosing);
        }
      };
      
      if(this._bulletLife > 0 && this._bullet != null){
        if(this._bulletLife > this._bullet.lifetime - 1){
          this._bullet.time = 0;
        }
        this.heat = 1;
        this.recoil = lavaRiser.recoilAmount;
        this._cellOpenAmounts[0] = Mathf.lerpDelta(this._cellOpenAmounts[0], lavaRiser.COA * Mathf.absin(this._bulletLife / 6 + Mathf.randomSeed(this._bullet.id), 0.8, 1), 0.6);
        this._cellOpenAmounts[1] = Mathf.lerpDelta(this._cellOpenAmounts[1], lavaRiser.COA * Mathf.absin(-this._bulletLife / 6 + Mathf.randomSeed(this._bullet.id), 0.8, 1), 0.6);
        this._bulletLife = this._bulletLife - Time.delta;
        this.rotation = Angles.moveToward(this.rotation, Angles.angle(this.x, this.y, this._bullet.x, this._bullet.y), 360);
        
        shootLoc.trns(this.rotation, lavaRiser.size * 4 - this.recoil);
        
        var ang = Angles.angle(this.x + shootLoc.x, this.y + shootLoc.y, this._bullet.x, this._bullet.y);
        var centDist = Mathf.dst(this.x, this.y, this._bullet.x, this._bullet.y);
        var dist = Mathf.dst(this.x + shootLoc.x, this.y + shootLoc.y, this._bullet.x, this._bullet.y);
        
        if(centDist > lavaRiser.maxRange){
          vec.trns(ang, lavaRiser.maxRange);
          this._bullet.set(this.x + vec.x, this.y + vec.y);
        }
        
        targetLightning.at(this.x + shootLoc.x, this.y + shootLoc.y, ang, colors[2], [dist, 6, this.team]);
        
        if(this._bulletLife <= 0){
          this._bullet = null;
        }
      }
    },
    updateShooting(){
      if(this._bulletLife > 0 && this._bullet != null){
        return;
      }
      
      if(this.reload >= lavaRiser.reloadTime){
        var type = this.peekAmmo();
        
        this.shoot(type);
        
        this.reload = 0;
        this._bulletLife = lavaRiser.shootDuration;
      }else{
        this.reload += this.delta() * this.baseReloadSpeed();
      }
    },
    bullet(type, angle){
      var centDist = Mathf.dst(this.x, this.y, this.targetPos.x, this.targetPos.y);
      var dist = Mathf.dst(this.x + shootLoc.x, this.y + shootLoc.y, this.targetPos.x, this.targetPos.y);
      
      if(centDist > lavaRiser.maxRange){
        vec.trns(angle, lavaRiser.maxRange);
        var bullet = type.create(this, this.team, this.x + vec.x, this.y + vec.y, angle);
      }else{
        var bullet = type.create(this, this.team, this.targetPos.x, this.targetPos.y, angle);
      }
      
      this._bullet = bullet;
    },
    turnToTarget(targetRot){
      if(this._bulletLife <= 0){
        this.rotation = Angles.moveToward(this.rotation, targetRot, this.efficiency() * lavaRiser.rotateSpeed * this.delta());
      }
    },
    shouldAmbientSound(){
      return this._bulletLife > 0 && this._bullet != null;
    }
	});
	eruptEntity.setEff();
	return eruptEntity;
};