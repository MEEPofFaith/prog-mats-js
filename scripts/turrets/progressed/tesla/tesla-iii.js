const tV = new Vec2();
const tV2 = new Vec2();

//Stolen effect from [redacted] from [redacted/redacted]
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
		Fill.circle(tV.x, tV.y, Lines.getStroke() / 2);
    Drawf.light(e.data[2], tV.x, tV.y, tV2.x, tV2.y, e.data[1] * 3 * e.fout(), e.color, 0.4);
	};
  Fill.circle(tV2.x, tV2.y, Lines.getStroke() / 2);
});
targetLightning.layer = Layer.bullet + 0.01;

const lightningLine = new Vec2();
const lightningCol = Pal.surge;

const stormZap = extend(LightningBulletType, {
  damage: 15,
  lightningLength: 7,
  lightningLengthRand: 5,
  lightningAngle: 0,
  lightningColor: lightningCol,
  lightRadius: 24,
  lightOpcaity: 0.7,
  hittable: false
});

const teslaStorm = extend(PowerTurret, "tesla-iii", {
  load(){
    this.outlines = [];
    this.rotators = [];
    this.heatRegions = []
    
    this.teamRegion = Core.atlas.find("error");
    this.region = Core.atlas.find(this.name + "-top");
    this.baseRegion = Core.atlas.find("block-3");
    for(var i = 0; i < 2; i++){
      this.rotators[i] = Core.atlas.find(this.name + "-rotator-" + i);
    }
    for(var i = 0; i < 3; i++){
      this.outlines[i] = Core.atlas.find(this.name + "-outline-" + i);
      this.heatRegions[i] = Core.atlas.find(this.name + "-heat-" + i);
    }
  },
  setStats(){
    this.super$setStats();
    
    this.stats.remove(Stat.inaccuracy);
    this.stats.add(Stat.inaccuracy, teslaStorm.inaccuracy / 8, StatUnit.blocks);
    
    //Something can get hit by multiple strikes since they all spawn in the same place.
    this.stats.remove(Stat.damage);
    this.stats.add(Stat.damage, teslaStorm.shootType.damage + " - " + teslaStorm.shootType.damage * teslaStorm.zaps);
  },
  icons(){
    return [
      Core.atlas.find("block-3"),
      Core.atlas.find(this.name + "-icon")
    ];
  },
  health: 1540,
  powerUse: 8.9,
  reloadTime: 20,
  shootCone: 360,
  size: 3,
  shootType: stormZap,
  range: 130,
  shots: 3,
  zaps: 7,
  angleRand: 13,
  inaccuracy: 28,
  rotateSpeed: 12,
  lightningColor: lightningCol,
  shootSound: Sounds.spark,
  shootEffect: Fx.sparkShoot,
  heatColor: Color.valueOf("fff694"),
  coolantMultiplier: 1
});

/*
  requirements:[
    copper/120
    lead/150
    graphite/55
    silicon/105
    titanium/90
    surge-alloy/40
    techtanite/50
  ]
*/
// teslaStorm.requirements(Category.turret, ItemStack.with(Items.copper, 120, Items.lead, 150, Items.graphite, 55, Items.silicon, 105, Items.titanium, 90, Items.surgeAlloy, 40, Vars.content.getByName(ContentType.item, "prog-mats-techtanite"), 50));
teslaStorm.requirements = ItemStack.with(Items.copper, 120, Items.lead, 150, Items.graphite, 55, Items.silicon, 105, Items.titanium, 90, Items.surgeAlloy, 40, Vars.content.getByName(ContentType.item, "prog-mats-techtanite"), 50);
teslaStorm.category = Category.turret;
teslaStorm.buildVisibility = BuildVisibility.shown;

const shootLoc = new Vec2();
const shootLoc2 = new Vec2();
const inacc = new Vec2();

teslaStorm.buildType = ent => {
  ent = extend(PowerTurret.PowerTurretBuild, teslaStorm, {
    setEff(){
      this._currentTarget = 0;
      this._shootAngle = 0;
      this._dist = 0;
      this._rotationSpeed = 0;
    },
    draw(){
      Draw.rect(teslaStorm.baseRegion, this.x, this.y, 0);
      
      Draw.z(Layer.turret);
      
      Draw.rect(teslaStorm.outlines[0], this.x, this.y, 0);
      Draw.rect(teslaStorm.outlines[1], this.x, this.y, -this.rotation + 90);
      Draw.rect(teslaStorm.outlines[2], this.x, this.y, this.rotation - 90);
      
      Drawf.shadow(teslaStorm.outlines[0], this.x - (teslaStorm.size / 2), this.y - (teslaStorm.size / 2), -this.rotation + 90);
      Draw.rect(teslaStorm.rotators[0], this.x, this.y, -this.rotation + 90);
      
      Drawf.shadow(teslaStorm.outlines[1], this.x - (teslaStorm.size / 2), this.y - (teslaStorm.size / 2), this.rotation - 90);
      Draw.rect(teslaStorm.rotators[1], this.x, this.y, this.rotation - 90);
      
      Drawf.shadow(teslaStorm.outlines[2], this.x - (teslaStorm.size / 2), this.y - (teslaStorm.size / 2), 0);
      Draw.rect(teslaStorm.region, this.x, this.y, 0);
      
      if(this.heat > 0.00001){
        Draw.blend(Blending.additive);
        Draw.color(teslaStorm.heatColor, this.heat);
        Draw.rect(teslaStorm.heatRegions[0], this.x, this.y, 0);
        Draw.rect(teslaStorm.heatRegions[1], this.x, this.y, -this.rotation + 90);
        Draw.rect(teslaStorm.heatRegions[2], this.x, this.y, this.rotation - 90);
        Draw.blend();
        Draw.color();
      }
    },
    updateTile(){
      this.super$updateTile();
      
      if(!this.hasAmmo() || !this.isShooting() || !this.isActive() || !this.cons.valid()){
        this._rotationSpeed = Mathf.lerpDelta(this._rotationSpeed, 0, 0.0125);
      }
      if(this.hasAmmo() && this.isShooting() && this.isActive() && this.cons.valid()){
        const liquid = this.liquids.current();
        this._rotationSpeed = Mathf.lerpDelta(this._rotationSpeed, 1, 0.005 * this.peekAmmo().reloadMultiplier * liquid.heatCapacity * teslaStorm.coolantMultiplier * this.delta());
      }
      
      this.rotation -= this._rotationSpeed * teslaStorm.rotateSpeed * Time.delta;
    },
    shoot(type){
      //I have ascended to stealing code from myself.
      this._targetX.clear();
      this._targetY.clear();
      
      Units.nearbyEnemies(this.team, this.x - teslaStorm.range, this.y - teslaStorm.range, teslaStorm.range * 2, teslaStorm.range * 2, e => {
				if(Mathf.within(this.x, this.y, e.x, e.y, teslaStorm.range) && !e.dead){
          if(this._targetX.size <= 511){
            this._targetX.add(e.x);
            this._targetY.add(e.y);
          }
        };
      });
      
      var tx = Vars.world.toTile(this.x);
      var ty = Vars.world.toTile(this.y);
      
      var tileRange = Mathf.floorPositive(teslaStorm.range / Vars.tilesize + 1);
      
      this._targetBlocks.clear();
      
      for(var x = -tileRange + tx; x <= tileRange + tx; x++){
        yGroup:
        for(var y = -tileRange + ty; y <= tileRange + ty; y++){
          if(!Mathf.within(x * Vars.tilesize, y * Vars.tilesize, this.x, this.y, teslaStorm.range)) continue yGroup;
          var other = Vars.world.build(x, y);
          if(other == null) continue yGroup;
          if(!this._targetBlocks.contains(other.pos())){
            if(other.team != this.team && !other.dead){
              if(this._targetX.size <= 511){
                this._targetX.add(other.x);
                this._targetY.add(other.y);
              }
            }
          };
        };
      };
      
      if(this._targetX.size >= 0){
        for(var i = 0; i < teslaStorm.shots; i++){
          this._currentTarget = Mathf.floor(Mathf.random(this._targetX.size - 0.001));
          inacc.trns(Mathf.random(360), 0, Mathf.range(teslaStorm.inaccuracy));
          if(this._currentTarget >= 0){
            this.heat = 1;
            var targX = this._targetX.get(this._currentTarget) + inacc.x;
            var targY = this._targetY.get(this._currentTarget) + inacc.y;
            
            var shootLocs = [0, 3.25, 6.75, 10.75, 11.25];
            var shotsection = Mathf.floor(Mathf.random(4.999));
            
            if(shotsection <= 2){
              shootLoc.trns(Mathf.random(360), shootLocs[shotsection]);
              shootLoc2.trns(0, 0);
            }else{
              var angles = [0, 1, 2, 3];
              if(shotsection == 3){
                shootLoc.trns(angles[Mathf.round(Mathf.floor(3.999))] * 90 - this.rotation + 90, shootLocs[shotsection]);
                shootLoc2.trns(Mathf.random(360), 0);
              }
              if(shotsection == 4){
                shootLoc.trns(angles[Mathf.round(Mathf.floor(3.999))] * 90 + this.rotation - 90, shootLocs[shotsection]);
                shootLoc2.trns(Mathf.random(360), 1);
              }
            }
            
            this._shootAngle = Angles.angle(this.x + shootLoc.x + shootLoc2.x, this.y + shootLoc.y + shootLoc2.y, targX, targY);
            this._dist = Mathf.dst(this.x + shootLoc.x + shootLoc2.x, this.y + shootLoc.y + shootLoc2.y, targX, targY);
            
            targetLightning.at(this.x + shootLoc.x + shootLoc2.x, this.y + shootLoc.y + shootLoc2.y, this._shootAngle, teslaStorm.lightningColor, [this._dist, 5, this.team]);
            teslaStorm.shootSound.at(this.x + shootLoc.x + shootLoc2.x, this.y + shootLoc.y + shootLoc2.y, Mathf.random(0.9, 1.1));
            teslaStorm.shootEffect.at(this.x + shootLoc.x + shootLoc2.x, this.y + shootLoc.y + shootLoc2.y, this._shootAngle, teslaStorm.lightningColor);
            
            const shootX = targX;
            const shootY = targY;
            Time.run(3, () => {
              for(var j = 0; j < teslaStorm.zaps; j++){
                teslaStorm.shootType.create(this, this.team, shootX, shootY, ((360 / teslaStorm.zaps) * j) + Mathf.range(teslaStorm.angleRand));
              }
            });
          }
        }
      }
    },
    shouldTurn(){
      return false;
    }
  });
  ent._targetX = new Seq(511);
  ent._targetY = new Seq(511);
  ent._targetBlocks = new Seq(511);
  ent.setEff();
  return ent;
};