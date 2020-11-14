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
//4 colors from outside in. Normal meltdown laser has trasnparrency 55 -> aa -> ff (no transparrency) -> ff(no transparrency)
var colors = [Color.valueOf("e69a2755"), Color.valueOf("eda332aa"), Color.valueOf("f2ac41"), Color.valueOf("ffbb54")];
var length = 32;
const burnRadius = 36;

//Stuff you probably shouldn't edit.
//Width of each section of the beam from thickest to thinnest
var tscales = [1, 0.7, 0.5, 0.2];
//Overall width of each color
var strokes = [burnRadius / 2, burnRadius / 2.5, burnRadius / 3.3333, burnRadius / 5];
//Determines how far back each section in the start should be pulled
var pullscales = [1, 1.12, 1.15, 1.17];
//Determines how far each section of the end should extend past the main thickest section
var lenscales = [1, 1.3, 1.6, 1.9];

var tmpColor = new Color();
const vec = new Vec2();
const lavaBack = new Vec2();

const magmaPool = extend(BasicBulletType, {
  update(b){
    if(b != null){
      if(b.owner.targetPos != null){
        var target = Angles.angle(b.x, b.y, b.owner.targetPos.x, b.owner.targetPos.y);
        b.rotation(Mathf.slerpDelta(b.rotation(), target, 0.15));
      }
      
      if(b.timer.get(1, 5)){
        Damage.damage(b.team, b.x, b.y, burnRadius, this.damage, true);
      }
      
      Puddles.deposit(Vars.world.tileWorld(b.x, b.y), Vars.content.getByName(ContentType.liquid, "prog-mats-magma"), 150000);
      Puddles.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.slag, 1);
    }
  },
  drawLight(b){
  },
  draw(b){
    if(b != null){
      //ring
      Draw.color(Color.valueOf("e3931b"));
      Draw.alpha(b.fout());
      Lines.stroke(2);
      Lines.circle(b.x, b.y, burnRadius);
      
      //"fountain" of lava
      for(var s = 0; s < 4; s++){
        Draw.color(tmpColor.set(colors[s]).mul(1.0 + Mathf.absin(Time.time() / 3 + Mathf.randomSeed(b.id), 1.0, 0.3) / 3));
        Draw.alpha(b.fout());
        Fill.circle(b.x, b.y, strokes[s] * 2);
        for(var i = 0; i < 4; i++){
          var baseLen = (length + (Mathf.absin(Time.time() / ((i + 1) * 2) + Mathf.randomSeed(b.id), 0.8, 1.5) * (length / 1.5))) * b.fout();
          lavaBack.trns(90, (pullscales[i] - 1.0) * 55.0);
          Lines.stroke(4 * strokes[s] * tscales[i]);
          Lines.lineAngle(b.x + lavaBack.x, b.y + lavaBack.y, 90, baseLen * b.fout() * lenscales[i], false);
          Drawf.light(b.team, b.x + lavaBack.x, b.y + lavaBack.y, b.x + lavaBack.y + lavaBack.x, b.y + baseLen * b.fout() * lenscales[i], Lines.getStroke() * this.lightRadius, this.lightColor, this.lightOpacity);
        };
      };
      Draw.reset();
    };
  }
});

magmaPool.speed = 2;
magmaPool.lifetime = 16;
magmaPool.damage = 75;
magmaPool.collides = false;
magmaPool.collidesTiles = false;
magmaPool.hitEffect = Fx.fireballsmoke;
magmaPool.despawnEffect = Fx.none;
magmaPool.shootEffect = Fx.none;
magmaPool.smokeEffect = Fx.none;
magmaPool.hittable = false;
magmaPool.lightRadius = 2;
magmaPool.lightOpacity = 0.7;
magmaPool.lightColor = colors[2];

//Got some help from EoD for the turning LaserTurret into PowerTurret part
const magmaRiser = extendContent(PowerTurret, "eruptor-ii", {
  load(){
    this.cells = [];
    this.heatRegions = [];
    this.bottomCaps = [];
    this.topCaps = [];
    this.outlines = [];
    
    this.baseRegion = Core.atlas.find("block-4");
    this.turretRegion = Core.atlas.find(this.name + "-turret");
    for(var i = 0; i < 3; i++){
      this.cells[i] = Core.atlas.find(this.name + "-cells-" + i);
      this.heatRegions[i] = Core.atlas.find(this.name + "-heat-" + i);
    }
    for(var i = 0; i < 4; i++){
      this.bottomCaps[i] = Core.atlas.find(this.name + "-caps-0-" + i);
      this.topCaps[i] = Core.atlas.find(this.name + "-caps-1-" + i);
    }
    for(var i = 0; i < 9; i++){
      this.outlines[i] = Core.atlas.find(this.name + "-outline-" + i);
    }
  },
  setStats(){
    this.super$setStats();
    
    this.stats.remove(Stat.inaccuracy);
    
    //damages every 5 ticks
    this.stats.remove(Stat.damage);
    this.stats.add(Stat.damage, magmaRiser.shootType.damage * 60 / 5, StatUnit.perSecond);
  },
  icons(){
    return [
      Core.atlas.find("block-4"),
      Core.atlas.find(this.name + "-icon")
    ];
  }
});

magmaRiser.shootType = magmaPool;
magmaRiser.shootDuration = 240;
magmaRiser.range = 280;
magmaRiser.maxRange = 450;
magmaRiser.reloadTime = 90;
magmaRiser.rotateSpeed = 2.25;
magmaRiser.recoilAmount = 4;
magmaRiser.COA = 0.9;
magmaRiser.cellHeight = 1;
magmaRiser.firingMoveFract = 0.8;
magmaRiser.shootEffect = Fx.none;
magmaRiser.smokeEffect = Fx.none;
magmaRiser.ammoUseEffect = Fx.none;
magmaRiser.capClosing = 0.01;
magmaRiser.heatColor = Color.valueOf("f08913");

const shootLoc = new Vec2();

magmaRiser.buildType = () => {
	var magmaEntity = extendContent(PowerTurret.PowerTurretBuild, magmaRiser, {
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
      const trnsYflat = [0, 0, 1, 1];
      
      Draw.rect(magmaRiser.baseRegion, this.x, this.y, 0);
      
      Draw.z(Layer.turret + 1);
      
      back.trns(this.rotation - 90, 0, -this.recoil);
      
      Draw.rect(magmaRiser.outlines[0], this.x + back.x, this.y + back.y, this.rotation - 90);
      
      //Bottom Layer Cell Outlines
      for(var i = 0; i < 4; i ++){
      open.trns(this.rotation - 90, this._cellOpenAmounts[1] * trnsX[i], this._cellOpenAmounts[1] * trnsY[i]);
        Draw.rect(magmaRiser.outlines[i + 1], this.x + open.x + back.x, this.y + open.y + back.y, this.rotation - 90);
      }
      
      //Top Layer Cell Outlines
      for(var i = 0; i < 4; i ++){
      open.trns(this.rotation - 90, this._cellOpenAmounts[0] * trnsX[i], this._cellOpenAmounts[0] * trnsYflat[i]);
        Draw.rect(magmaRiser.outlines[i + 5], this.x + open.x + back.x, this.y + open.y + back.y, this.rotation - 90);
      }
      
      Drawf.shadow(magmaRiser.turretRegion, this.x + back.x - (magmaRiser.size / (1 + (1/3))), this.y + back.y - (magmaRiser.size / (1 + (1/3))), this.rotation - 90);
      Draw.rect(magmaRiser.turretRegion, this.x + back.x, this.y + back.y, this.rotation - 90);
      
      if(this.heat > 0.00001){
        Draw.blend(Blending.additive);
        Draw.color(magmaRiser.heatColor, this.heat);
        Draw.rect(magmaRiser.heatRegions[0], this.x + back.x, this.y + back.y, this.rotation - 90);
        Draw.blend();
        Draw.color();
      }
      
      //Bottom Layer Cells
      Drawf.shadow(magmaRiser.cells[0], this.x + back.x - magmaRiser.cellHeight, this.y + back.y - magmaRiser.cellHeight, this.rotation - 90);
      
      for(var i = 0; i < 4; i ++){
      open.trns(this.rotation - 90, this._cellOpenAmounts[1] * trnsX[i], this._cellOpenAmounts[1] * trnsY[i]);
        Drawf.shadow(magmaRiser.bottomCaps[i], this.x + open.x + back.x - magmaRiser.cellHeight, this.y + open.y + back.y - magmaRiser.cellHeight, this.rotation - 90);
      }
      
      Draw.rect(magmaRiser.cells[0], this.x + back.x, this.y + back.y, this.rotation - 90);
      
      if(this.heat > 0.00001){
        Draw.blend(Blending.additive);
        Draw.color(magmaRiser.heatColor, this.heat);
        Draw.rect(magmaRiser.heatRegions[1], this.x + back.x, this.y + back.y, this.rotation - 90);
        Draw.blend();
        Draw.color();
      }
      
      for(var i = 0; i < 4; i ++){
      open.trns(this.rotation - 90, this._cellOpenAmounts[1] * trnsX[i], this._cellOpenAmounts[1] * trnsY[i]);
        Draw.rect(magmaRiser.bottomCaps[i], this.x + open.x + back.x, this.y + open.y + back.y, this.rotation - 90);
      }
      
      //Top Layer Cells
      Drawf.shadow(magmaRiser.cells[1], this.x + open.x + back.x - magmaRiser.cellHeight, this.y + open.y + back.y - magmaRiser.cellHeight, this.rotation - 90);
      
      for(var i = 0; i < 4; i ++){
      open.trns(this.rotation - 90, this._cellOpenAmounts[0] * trnsX[i], this._cellOpenAmounts[0] * trnsYflat[i]);
        Drawf.shadow(magmaRiser.topCaps[i], this.x + open.x + back.x - magmaRiser.cellHeight, this.y + open.y + back.y - magmaRiser.cellHeight, this.rotation - 90);
      }
      
      Draw.rect(magmaRiser.cells[1], this.x + back.x, this.y + back.y, this.rotation - 90);
      
      if(this.heat > 0){
        Draw.blend(Blending.additive);
        Draw.color(magmaRiser.heatColor, this.heat);
        Draw.rect(magmaRiser.heatRegions[2], this.x + back.x, this.y + back.y, this.rotation - 90);
        Draw.blend();
        Draw.color();
      }
      
      for(var i = 0; i < 4; i ++){
      open.trns(this.rotation - 90, this._cellOpenAmounts[0] * trnsX[i], this._cellOpenAmounts[0] * trnsYflat[i]);
        Draw.rect(magmaRiser.topCaps[i], this.x + open.x + back.x, this.y + open.y + back.y, this.rotation - 90);
      }
    },
    updateTile(){
      this.super$updateTile();
      
      if(this._bulletLife <= 0 && this._bullet == null){
        for(var i = 0; i < 2; i ++){
          this._cellOpenAmounts[i] = Mathf.lerpDelta(this._cellOpenAmounts[i], 0, magmaRiser.capClosing);
        }
      }
      
      if(this._bulletLife > 0 && this._bullet != null){
        this._bullet.time = 0;
        this.heat = 1;
        this.recoil = magmaRiser.recoilAmount;
        this._cellOpenAmounts[0] = Mathf.lerpDelta(this._cellOpenAmounts[0], magmaRiser.COA * Mathf.absin(this._bulletLife / 6 + Mathf.randomSeed(this._bullet.id), 0.8, 1), 0.6);
        this._cellOpenAmounts[1] = Mathf.lerpDelta(this._cellOpenAmounts[1], magmaRiser.COA * Mathf.absin(-this._bulletLife / 6 + Mathf.randomSeed(this._bullet.id), 0.8, 1), 0.6);
        this._bulletLife = this._bulletLife - Time.delta;
        this.rotation = Angles.moveToward(this.rotation, Angles.angle(this.x, this.y, this._bullet.x, this._bullet.y), 360);
        
        shootLoc.trns(this.rotation, magmaRiser.size * 4 - this.recoil);
        
        var ang = Angles.angle(this.x + shootLoc.x, this.y + shootLoc.y, this._bullet.x, this._bullet.y);
        var centDist = Mathf.dst(this.x, this.y, this._bullet.x, this._bullet.y);
        var dist = Mathf.dst(this.x + shootLoc.x, this.y + shootLoc.y, this._bullet.x, this._bullet.y);
        
        if(centDist > magmaRiser.maxRange){
          vec.trns(ang, magmaRiser.maxRange);
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
      
      if(this.reload >= magmaRiser.reloadTime){
        var type = this.peekAmmo();
        
        this.shoot(type);
        
        this.reload = 0;
        this._bulletLife = magmaRiser.shootDuration;
      }else{
        this.reload += this.delta() * this.baseReloadSpeed();
      }
    },
    bullet(type, angle){
      var centDist = Mathf.dst(this.x, this.y, this.targetPos.x, this.targetPos.y);
      var dist = Mathf.dst(this.x + shootLoc.x, this.y + shootLoc.y, this.targetPos.x, this.targetPos.y);
      
      if(centDist > magmaRiser.maxRange){
        vec.trns(angle, magmaRiser.maxRange);
        var bullet = type.create(this, this.team, this.x + vec.x, this.y + vec.y, angle);
      }else{
        var bullet = type.create(this, this.team, this.targetPos.x, this.targetPos.y, angle);
      }
      
      this._bullet = bullet;
    },
    turnToTarget(targetRot){
      if(this._bulletLife <= 0){
        this.rotation = Angles.moveToward(this.rotation, targetRot, this.efficiency() * magmaRiser.rotateSpeed * this.delta() * (this._bulletLife > 0 ? magmaRiser.firingMoveFract : 1));
      }
    },
    shouldAmbientSound(){
      return this._bulletLife > 0 && this._bullet != null;
    }
	});
	magmaEntity.setEff();
	return magmaEntity;
};