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

targetLightning.layer = 45;

//Editable stuff for custom laser.
//4 colors from outside in. Normal meltdown laser has trasnparrency 55 -> aa -> ff (no transparrency) -> ff(no transparrency)
var colors = [Color.valueOf("e69a2755"), Color.valueOf("eda332aa"), Color.valueOf("f2ac41"), Color.valueOf("ffbb54")];
var length = 8;
const burnRadius = 7;

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

const hellPool = extend(BasicBulletType, {
  update(b){
    if(b != null){
      if(b.timer.get(1, 5)){
        Damage.damage(b.team, b.x, b.y, burnRadius, this.damage, true);
      }
      
      Puddles.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.slag, 100000);
      Puddles.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.oil, 99000);
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
const burnDuration = 30;

hellPool.speed = 0.0001;
hellPool.damage = 62.5;
hellPool.lifetime = burnDuration;
hellPool.collides = false;
hellPool.collidesTiles = false;
hellPool.hitEffect = Fx.fireballsmoke;
hellPool.despawnEffect = Fx.none;
hellPool.shootEffect = Fx.none;
hellPool.smokeEffect = Fx.none;
hellPool.hittable = false;
hellPool.lightRadius = 2;
hellPool.lightOpacity = 0.7;
hellPool.lightColor = colors[2];

//Got some help from EoD for the turning LaserTurret into PowerTurret part
const hellRiser = extendContent(PowerTurret, "eruptor-iii", {
  load(){
    this.caps = [];
    this.cells = [];
    this.heatRegions = [];
    this.outlines = [];
    
    this.baseRegion = Core.atlas.find("block-4");
    this.bottomRegion = Core.atlas.find(this.name + "-bottom");
    this.sideRegion = Core.atlas.find(this.name + "-side");
    for(var i = 0; i < 2; i++){
      this.cells[i] = Core.atlas.find(this.name + "-cells-" + i);
    }
    for(var i = 0; i < 4; i++){
      this.heatRegions[i] = Core.atlas.find(this.name + "-heat-" + i);
      this.caps[i] = Core.atlas.find(this.name + "-caps-" + i);
    }
    for(var i = 0; i < 6; i++){
      this.outlines[i] = Core.atlas.find(this.name + "-outline-" + i);
    }
  },
  setStats(){
    this.super$setStats();
    
    this.stats.remove(Stat.inaccuracy);
    this.stats.add(Stat.shots, "The number of enemies in range (oh no)");
    
    //damages every 5 ticks
    this.stats.remove(Stat.damage);
    this.stats.add(Stat.damage, hellRiser.shootType.damage * 12, StatUnit.perSecond);
  },
  icons(){
    return [
      Core.atlas.find("block-4"),
      Core.atlas.find(this.name + "-icon")
    ];
  }
});

hellRiser.shootType = hellPool;
hellRiser.shootDuration = burnDuration;
hellRiser.range = 200;
hellRiser.reloadTime = 90;
hellRiser.shootCone = 360;
hellRiser.rotationSpeed = 8;
hellRiser.rotationWindUp = 0.1;
hellRiser.rotationWindDown = 0.005;
hellRiser.COA = 0.5;
hellRiser.recoil = 7;
hellRiser.sideHeight = 4;
hellRiser.cellHeight = 1;
hellRiser.shootEffect = Fx.none;
hellRiser.smokeEffect = Fx.none;
hellRiser.ammoUseEffect = Fx.none;
hellRiser.restitution = 0.01;
hellRiser.heatColor = Color.valueOf("f08913");

const side = new Vec2();
const open = new Vec2();
const rangeloc = new Vec2();
const shootLoc = new Vec2();
var rots = [0, 90, 180, 270];

hellRiser.buildType = () => {
	var hellEntity = extendContent(PowerTurret.PowerTurretBuild, hellRiser, {
    setEff(){
      this._bulletLife = 0;
      this._cellOpenAmounts = [0, 0];
      this._rotationSpeed = 0;
      this._dists = [0, 0, 0, 0]
      this._yes = 0;
    },
    draw(){
      var trnsX = [-1, 1];
      
      Draw.rect(hellRiser.baseRegion, this.x, this.y, 0);
      
      Draw.z(Layer.turret);
      
      Drawf.shadow(hellRiser.bottomRegion, this.x - (hellRiser.size / (1 + (1 / 3))), this.y - (hellRiser.size / (1 + (1 / 3))));
      
      Draw.rect(hellRiser.outlines[0], this.x, this.y);
      
      for(var i = 0; i < 4; i++){
        var drawRotation = this.rotation + rots[i];
        
        side.trns(drawRotation, 0, this.recoil);
      }
      
      Draw.rect(hellRiser.bottomRegion, this.x, this.y);
      
      if(this.heat > 0.00001){
        Draw.blend(Blending.additive);
        Draw.color(hellRiser.heatColor, this.heat);
        Draw.rect(hellRiser.heatRegions[0], this.x, this.y);
        Draw.blend();
        Draw.color();
      }
      
      for(i = 0; i < 4; i++){
        var drawRotation = this.rotation + rots[i];
        
        side.trns(drawRotation, 0, this.recoil);
        
        //Side shadows
        Drawf.shadow(hellRiser.sideRegion, this.x + side.x - hellRiser.sideHeight, this.y + side.y - hellRiser.sideHeight, drawRotation);
        
        //Side outlines
        for(var j = 0; j < 5; j++){
          Draw.rect(hellRiser.outlines[j + 1], this.x + side.x, this.y + side.y, drawRotation);
        }
        
        //Cap Outlines
        for(var j = 0; j < 2; j++){
          open.trns(drawRotation, this._cellOpenAmounts[0] * trnsX[i], this._cellOpenAmounts[0]);
          Draw.rect(hellRiser.outlines[j + 2], this.x + side.x + open.x, this.y + side.y + open.y, drawRotation);
          Draw.rect(hellRiser.outlines[j + 4], this.x + side.x + open.x, this.y + side.y + open.y, drawRotation);
        }
      }
      
      for(i = 0; i < 4; i++){
        var drawRotation = this.rotation + rots[i];
        
        side.trns(drawRotation, 0, this.recoil);
        
        //Side Parts
        Draw.rect(hellRiser.sideRegion, this.x + side.x, this.y + side.y, drawRotation);
        
        //Side Parts Heat
        if(this.heat > 0.00001){
          Draw.blend(Blending.additive);
          Draw.color(hellRiser.heatColor, this.heat);
          Draw.rect(hellRiser.heatRegions[1], this.x + side.x, this.y + side.y, drawRotation);
          Draw.blend();
          Draw.color();
        }
        
        //Bottom Layer Cell Shadows
        Drawf.shadow(hellRiser.cells[0], this.x + side.x - hellRiser.cellHeight, this.y + side.y - hellRiser.cellHeight, drawRotation);
        
        //Bottom Layer Cap Shadows
        for(var j = 0; j < 2; j++){
          open.trns(drawRotation, this._cellOpenAmounts[0] * trnsX[j], this._cellOpenAmounts[0]);
          Drawf.shadow(hellRiser.caps[j], this.x + side.x + open.x - hellRiser.cellHeight, this.y + side.y + open.y - hellRiser.cellHeight, drawRotation);
        }
        
        //Bottom Layer Cells
        Draw.rect(hellRiser.cells[0], this.x + side.x, this.y + side.y, drawRotation);
        
        //Bottom Layer Cells Heat
        if(this.heat > 0.00001){
          Draw.blend(Blending.additive);
          Draw.color(hellRiser.heatColor, this.heat);
          Draw.rect(hellRiser.heatRegions[2], this.x + side.x, this.y + side.y, drawRotation);
          Draw.blend();
          Draw.color();
        }
      
        //Bottom Layer Caps
        for(var j = 0; j < 2; j++){
          open.trns(drawRotation, this._cellOpenAmounts[0] * trnsX[j], this._cellOpenAmounts[0]);
          Draw.rect(hellRiser.caps[j], this.x + side.x + open.x, this.y + side.y + open.y, drawRotation);
        }
      
        //Top Layer Cell Shadows
        Drawf.shadow(hellRiser.cells[1], this.x + side.x - hellRiser.cellHeight, this.y + side.y - hellRiser.cellHeight, drawRotation);
        
        //Top layer Cap Shadows
        for(var j = 0; j < 2; j++){
          open.trns(drawRotation, this._cellOpenAmounts[1] * trnsX[j], this._cellOpenAmounts[1]);
          Drawf.shadow(hellRiser.caps[j + 2], this.x + side.x + open.x - hellRiser.cellHeight, this.y + side.y + open.y - hellRiser.cellHeight, drawRotation);
        }
        
        //Top Layer Cells
        Draw.rect(hellRiser.cells[1], this.x + side.x, this.y + side.y, drawRotation);
      
        //Bottom Layer Cells Heat
        if(this.heat > 0.00001){
          Draw.blend(Blending.additive);
          Draw.color(hellRiser.heatColor, this.heat);
          Draw.rect(hellRiser.heatRegions[3], this.x + side.x, this.y + side.y, drawRotation);
          Draw.blend();
          Draw.color();
        }
      
        //Top Layer Caps
        for(var j = 0; j < 2; j++){
          open.trns(drawRotation, this._cellOpenAmounts[1] * trnsX[j], this._cellOpenAmounts[1]);
          Draw.rect(hellRiser.caps[j + 2], this.x + side.x + open.x, this.y + side.y + open.y, drawRotation);
        }
      }
    },
    updateTile(){
      this.super$updateTile();
      
      if(this._bulletLife <= 0){
        this._cellOpenAmounts[0] = Mathf.lerpDelta(this._cellOpenAmounts[0], 0, hellRiser.restitution);
        this._cellOpenAmounts[1] = Mathf.lerpDelta(this._cellOpenAmounts[1], 0, hellRiser.restitution);
        this.recoil = Mathf.lerpDelta(this.recoil, 0, hellRiser.restitution);
        this._rotationSpeed = Mathf.lerpDelta(this._rotationSpeed, 0, hellRiser.rotationWindDown);
      }
      
      if(this._bulletLife > 0){
        this.heat = 1;
        this._cellOpenAmounts[0] = Mathf.lerpDelta(this._cellOpenAmounts[0], hellRiser.COA * Mathf.absin(this._bulletLife / 6 + Mathf.randomSeed(this._yes), 0.8, 1), 0.6);
        this._cellOpenAmounts[1] = Mathf.lerpDelta(this._cellOpenAmounts[1], hellRiser.COA * Mathf.absin(-this._bulletLife / 6 + Mathf.randomSeed(this._yes), 0.8, 1), 0.6);
        this.recoil = hellRiser.recoil;
        this._rotationSpeed = Mathf.lerpDelta(this._rotationSpeed, hellRiser.rotationSpeed, hellRiser.rotationWindUp);
        this._bulletLife = this._bulletLife - Time.delta;
        
        if(hellEntity.targetX.size >= 0){
          for(var i = 0; i < hellEntity.targetX.size; i++){
            for(var j = 0; j < 4; j++){
              shootLoc.trns(this.rotation - 90 + rots[j], hellRiser.size * 4 + this.recoil);
              this._dists[j] = Mathf.dst(this.x + shootLoc.x, this.y + shootLoc.y, hellEntity.targetX.get(i), hellEntity.targetY.get(i));
            }
            var dist = 400;
            for(var j = 0; j < this._dists.length; j++){
              if(this._dists[j] < dist){
                dist = this._dists[j];
                var effectSide = j;
              }
            }
            
            shootLoc.trns(this.rotation - 90 + rots[effectSide], hellRiser.size * 4 + this.recoil);
            
            var ang = Angles.angle(this.x + shootLoc.x, this.y + shootLoc.y, hellEntity.targetX.get(i), hellEntity.targetY.get(i));
            
            targetLightning.at(this.x + shootLoc.x, this.y + shootLoc.y, ang, colors[2], [dist, 6, this.team]);
          }
        }
      }
      
      this.rotation -= this._rotationSpeed;
    },
    updateShooting(){
      if(this._bulletLife > 0){
        return;
      }
      
      if(this.reload >= hellRiser.reloadTime){
        var type = this.peekAmmo();
        
        this.shoot(type);
        
        this.reload = 0;
        this._bulletLife = hellRiser.shootDuration;
      }else{
        this.reload += this.delta() * this.baseReloadSpeed();
      }
    },
    shoot(type){
      hellEntity.targetX.clear();
      hellEntity.targetY.clear();
      
      Units.nearbyEnemies(this.team, this.x - hellRiser.range, this.y - hellRiser.range, hellRiser.range * 2, hellRiser.range * 2, e => {
				if(Mathf.within(this.x, this.y, e.x, e.y, hellRiser.range) && !e.dead){
          if(hellEntity.targetX.size <= 1023){
            hellEntity.targetX.add(e.x);
            hellEntity.targetY.add(e.y);
          }
        }
      })
      
      //I am once again stealing End Game code for this.
      hellEntity.collidedBlocks.clear();
      var tx = Vars.world.toTile(this.x);
      var ty = Vars.world.toTile(this.y);
      
      var tileRange = Mathf.floorPositive(hellRiser.range / Vars.tilesize + 1);
      
      for(var x = -tileRange + tx; x <= tileRange + tx; x++){
        yGroup:
        for(var y = -tileRange + ty; y <= tileRange + ty; y++){
          if(!Mathf.within(x * Vars.tilesize, y * Vars.tilesize, this.x, this.y, hellRiser.range)) continue yGroup;
          var other = Vars.world.build(x, y);
          if(other == null) continue yGroup;
          if(!hellEntity.collidedBlocks.contains(other.pos())){
            if(other.team != this.team && !other.dead){
              if(hellEntity.targetX.size <= 1023){
                hellEntity.targetX.add(other.x);
                hellEntity.targetY.add(other.y);
              }
            }
            hellEntity.collidedBlocks.add(other.pos());
          }
        }
      }
      
      for(var i = 0; i < hellEntity.targetX.size; i++){
        if(i >= 0){
          hellRiser.shootType.create(this, this.team, hellEntity.targetX.get(i), hellEntity.targetY.get(i), 0, 1, 1);
        }
      }
      
      this._yes = Mathf.random(9999);
    },
    shouldTurn(){
      return false;
    },
    shouldActiveSound(){
      return this._bulletLife > 0;
    }
	});
  hellEntity.targetX = new Seq(1023);
  hellEntity.targetY = new Seq(1023);
  hellEntity.collidedBlocks = new IntSet(1023);
	hellEntity.setEff();
	return hellEntity;
};