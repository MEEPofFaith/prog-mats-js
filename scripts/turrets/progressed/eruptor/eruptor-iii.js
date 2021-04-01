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
var length = 8;
const burnRadius = 7;

//Overall width of each color.
var strokes = [burnRadius, burnRadius / 1.333, burnRadius / 1.666];

var osc = 1;

var tmpColor = new Color();
const vec = new Vec2();
const lavaBack = new Vec2();
const burnDuration = 30;

const hellPool = extend(BasicBulletType, {
  update(b){
    if(b != null){
      if(b.timer.get(1, 5)){
        Damage.damage(b.team, b.x, b.y, burnRadius, this.damage, true);
      }
      
      Puddles.deposit(Vars.world.tileWorld(b.x, b.y), Vars.content.getByName(ContentType.liquid, "prog-mats-magma"), 15000);
      Puddles.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.slag, 1);
    }
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
  },
  continuousDamage(){
    return this.damage / 5 * 60;
  },
  speed: 0.01,
  damage: 62.5,
  lifetime: burnDuration,
  collides: false,
  collidesTiles: false,
  hitEffect: Fx.fireballsmoke,
  despawnEffect: Fx.none,
  shootEffect: Fx.none,
  smokeEffect: Fx.none,
  hittable: false,
  absorbable: false,
  lightRadius: 2,
  lightOpacity: 0.7,
  lightColor: colors[2]
});

//Got some help from EoD for the turning LaserTurret into PowerTurret part
const hellRiser = extend(PowerTurret, "eruptor-iii", {
  load(){
    this.caps = [];
    this.cells = [];
    this.heatRegions = [];
    this.outlines = [];
    
    this.teamRegion = Core.atlas.find("error");
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
  },
  icons(){
    return [
      this.baseRegion,
      Core.atlas.find(this.name + "-icon")
    ];
  },
  size: 4,
  health: 1800,
  powerUse: 15,
  targetAir: true,
  targetGround: true,
  recoilAmount: 0,
  cooldown: 0.01,
  shootSound: Sounds.none,
  ambientSound: Sounds.beam,
  ambientSoundVolume: 2,
  shootType: hellPool,
  shootDuration: burnDuration,
  range: 200,
  reloadTime: 90,
  shootCone: 360,
  rotationSpeed: 8,
  rotationWindUp: 0.1,
  rotationWindDown: 0.005,
  COA: 0.5,
  recoil: 7,
  sideHeight: 4,
  cellHeight: 1,
  shootEffect: Fx.none,
  smokeEffect: Fx.none,
  ammoUseEffect: Fx.none,
  restitution: 0.01,
  heatColor: Color.valueOf("f08913")
});

hellRiser.setupRequirements(Category.turret, ItemStack.with(
  Items.copper, 700,
  Items.lead, 950,
  Items.graphite, 750,
  Items.silicon, 800,
  Items.titanium, 600,
  Items.thorium, 800,
  Items.surgeAlloy, 650,
  Vars.content.getByName(ContentType.item, "prog-mats-techtanite"), 500
));

const side = new Vec2();
const open = new Vec2();
const rangeloc = new Vec2();
const shootLoc = new Vec2();
const fLib = this.global.pm.funcLib;
var rots = [0, 90, 180, 270];

hellRiser.buildType = ent => {
	ent = extend(PowerTurret.PowerTurretBuild, hellRiser, {
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
      
      Draw.z(Layer.turret + 1);
      
      Drawf.shadow(hellRiser.bottomRegion, this.x - (hellRiser.size / 2), this.y - (hellRiser.size / 2));
      
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
        Drawf.shadow(hellRiser.outlines[0], this.x + side.x - hellRiser.sideHeight, this.y + side.y - hellRiser.sideHeight, drawRotation);
        
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
        
        if(this._targetX.size >= 0){
          for(var i = 0; i < this._targetX.size; i++){
            for(var j = 0; j < 4; j++){
              shootLoc.trns(this.rotation - 90 + rots[j], hellRiser.size * 4 + this.recoil);
              this._dists[j] = Mathf.dst(this.x + shootLoc.x, this.y + shootLoc.y, this._targetX.get(i), this._targetY.get(i));
            }
            var dist = 400;
            for(var j = 0; j < this._dists.length; j++){
              if(this._dists[j] < dist){
                dist = this._dists[j];
                var effectSide = j;
              }
            }
            
            shootLoc.trns(this.rotation - 90 + rots[effectSide], hellRiser.size * 4 + this.recoil);
            
            var ang = Angles.angle(this.x + shootLoc.x, this.y + shootLoc.y, this._targetX.get(i), this._targetY.get(i));
            
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
      this._targetX.clear();
      this._targetY.clear();
      
      Units.nearbyEnemies(this.team, this.x - hellRiser.range, this.y - hellRiser.range, hellRiser.range * 2, hellRiser.range * 2, e => {
				if(Mathf.within(this.x, this.y, e.x, e.y, hellRiser.range) && !e.dead){
          if(this._targetX.size <= 1023){
            this._targetX.add(e.x);
            this._targetY.add(e.y);
          }
        }
      })
      
      fLib.trueEachBlock(this.x, this.y, hellRiser.range, build => {
        if(build.team != this.team && !build.dead && build.block != null){
          if(this._targetX.size <= 1023){
            this._targetX.add(build.x);
            this._targetY.add(build.y);
          }
        }
      });
      
      for(var i = 0; i < this._targetX.size; i++){
        if(i >= 0){
          hellRiser.shootType.create(this, this.team, this._targetX.get(i), this._targetY.get(i), 0, 1, 1);
        }
      }
      
      this._yes = Mathf.random(9999);
    },
    shouldTurn(){
      return false;
    },
    shouldAmbientSound(){
      return this._bulletLife > 0;
    },
    canControl(){
      return false;
    }
	});
  ent._targetX = new Seq(1023);
  ent._targetY = new Seq(1023);
	ent.setEff();
	return ent;
};