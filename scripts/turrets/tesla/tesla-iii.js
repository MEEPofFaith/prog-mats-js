const tV = new Vec2();
const tV2 = new Vec2();

//Stolen effect from [redacted] from [redacted/redacted]
//Why do I keep stealing things.
const targetLightning = new Effect(10, 500, e => {
	var length = e.data[0];
	var tileLength = Mathf.round(length / 8);
	
	Lines.stroke(4.5 * e.fout());
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
	};
  Fill.circle(tV2.x, tV2.y, Lines.getStroke() / 2);
});

const lightningSmoke = new Effect(30, e=> {
  Angles.randLenVectors(e.id, 12, e.fin() * 36 + (e.fout() * 13), e.rotation, 15, (x, y) => {
    var size = e.fout() * 2;
    Draw.color(e.color);
    Draw.alpha(e.fout());
    Fill.circle(e.x + x, e.y + y, size);
  });
});

const lightningLine = new Vec2();

const stormZap = extend(LightningBulletType, {});

const lightningCol = Pal.surge;

stormZap.damage = 46; //Note: I'm making up these numbers as I go.
stormZap.lightningLength = 7;
stormZap.lightningLengthRand = 4;
stormZap.lightningAngle = 0;
stormZap.lightningColor = lightningCol;
//stormZap.collidesTiles = false;
stormZap.hittable = false;

const teslaStorm = extendContent(PowerTurret, "tesla-iii", {
  load(){
    this.outlines = [];
    this.rotators = [];
    this.heatRegions = []
    
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
  icons(){
    return [
      Core.atlas.find("block-3"),
      Core.atlas.find(this.name + "-icon")
    ];
  }
});

teslaStorm.shootType = stormZap;
teslaStorm.size = 3;
teslaStorm.range = 130;
teslaStorm.arcs = 2;
teslaStorm.zaps = 7;
teslaStorm.angleRand = 13;
teslaStorm.rotateSpeed = 0.25;
teslaStorm.lightningColor = lightningCol;
teslaStorm.shootSound = Sounds.spark;
teslaStorm.shootEffect = Fx.sparkShoot;
teslaStorm.shootSmoke = lightningSmoke;
teslaStorm.heatColor = Color.valueOf("fff694");
teslaStorm.coolantMultiplier = 1;

const targetX = new Seq(255);
const targetY = new Seq(255);
const targets = new Seq(127);

const shootLoc = new Vec2();
const shootLoc2 = new Vec2();

teslaStorm.buildType = () => {
  var teslaStormEntity = extendContent(PowerTurret.PowerTurretBuild, teslaStorm, {
    setEff(){
      this._targetCount = -1;
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
      
      Drawf.shadow(teslaStorm.rotators[0], this.x - (teslaStorm.size / 2), this.y - (teslaStorm.size / 2), -this.rotation + 90);
      Draw.rect(teslaStorm.rotators[0], this.x, this.y, -this.rotation + 90);
      
      Drawf.shadow(teslaStorm.rotators[1], this.x - (teslaStorm.size / 2), this.y - (teslaStorm.size / 2), this.rotation - 90);
      Draw.rect(teslaStorm.rotators[1], this.x, this.y, this.rotation - 90);
      
      Drawf.shadow(teslaStorm.region, this.x - (teslaStorm.size / 2), this.y - (teslaStorm.size / 2), 0);
      Draw.rect(teslaStorm.region, this.x, this.y, 0);
      
      print(this.heat);
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
      
      if(!this.validateTarget() || !this.hasAmmo()){
        this._rotationSpeed = Mathf.lerpDelta(this._rotationSpeed, 0, 0.0125);
      }
      if(this.validateTarget() && this.hasAmmo()){
        const liquid = this.liquids.current();
        this._rotationSpeed = Mathf.lerpDelta(this._rotationSpeed, 1, 0.0075 * this.peekAmmo().reloadMultiplier * liquid.heatCapacity * teslaStorm.coolantMultiplier * this.delta());
      }
      
      this.rotation = this.rotation - this._rotationSpeed * 12;
    },
    shoot(type){
      //I have ascended to stealing code from myself.
      targetX.clear();
      targetY.clear();
      this._targetCount = -1;
      
      Units.nearbyEnemies(this.team, this.x - teslaStorm.range, this.y - teslaStorm.range, teslaStorm.range * 2, teslaStorm.range * 2, e => {
				if(Mathf.within(this.x, this.y, e.x, e.y, teslaStorm.range) && !e.dead){
            targetX.add(e.x);
            targetY.add(e.y);
            this._targetCount++;
        };
      });
      
      var tx = Vars.world.toTile(this.x);
      var ty = Vars.world.toTile(this.y);
      
      var tileRange = Mathf.floorPositive(teslaStorm.range / Vars.tilesize + 1);
      
      targets.clear();
      
      for(var x = -tileRange + tx; x <= tileRange + tx; x++){
        yGroup:
        for(var y = -tileRange + ty; y <= tileRange + ty; y++){
          if(!Mathf.within(x * Vars.tilesize, y * Vars.tilesize, this.x, this.y, teslaStorm.range)) continue yGroup;
          var other = Vars.world.build(x, y);
          if(other == null) continue yGroup;
          if(!targets.contains(other.pos())){
            if(other.team != this.team && !other.dead){
              targetX.add(other.x);
              targetY.add(other.y);
              this._targetCount++;
            }
          };
        };
      };
      
      if(this._targetCount >= 0){
        this.heat = 1;
        for(var i = 0; i < teslaStorm.arcs; i++){
          this._currentTarget = Mathf.floor(Mathf.random(this._targetCount + 0.999));
          var targX = targetX.get(this._currentTarget);
          var targY = targetY.get(this._currentTarget);
          
          var shootLocs = [0, 3.25, 6.75, 10.75, 11.25];
          var arcSection = Mathf.floor(Mathf.random(4.999));
          
          if(arcSection <= 2){
            shootLoc.trns(Mathf.random(360), shootLocs[arcSection]);
            shootLoc2.trns(0, 0);
          }else{
            var angles = [0, 1, 2, 3];
            if(arcSection == 3){
              shootLoc.trns(angles[Mathf.round(Mathf.floor(3.999))] * 90 - this.rotation + 90, shootLocs[arcSection]);
              shootLoc2.trns(Mathf.random(360), 0);
            }
            if(arcSection == 4){
              shootLoc.trns(angles[Mathf.round(Mathf.floor(3.999))] * 90 + this.rotation - 90, shootLocs[arcSection]);
              shootLoc2.trns(Mathf.random(360), 4.25);
            }
          }
          
          this._shootAngle = Angles.angle(this.x + shootLoc.x + shootLoc2.x, this.y + shootLoc.y + shootLoc2.y, targX, targY);
          this._dist = Mathf.dst(this.x + shootLoc.x + shootLoc2.x, this.y + shootLoc.y + shootLoc2.y, targX, targY);
          
          targetLightning.at(this.x + shootLoc.x + shootLoc2.x, this.y + shootLoc.y + shootLoc2.y, this._shootAngle, teslaStorm.lightningColor, [this._dist]);
          teslaStorm.shootSound.at(this.x + shootLoc.x + shootLoc2.x, this.y + shootLoc.y + shootLoc2.y, Mathf.random(0.9, 1.1));
          teslaStorm.shootEffect.at(this.x + shootLoc.x + shootLoc2.x, this.y + shootLoc.y + shootLoc2.y, this._shootAngle, teslaStorm.lightningColor);
          teslaStorm.shootSmoke.at(this.x + shootLoc.x + shootLoc2.x, this.y + shootLoc.y + shootLoc2.y, this._shootAngle, teslaStorm.lightningColor);
          
          for(var j = 0; j < teslaStorm.zaps; j++){
            teslaStorm.shootType.create(this, this.team, targX, targY, ((360 / teslaStorm.zaps) * j) + Mathf.range(teslaStorm.angleRand));
          }
        }
      }
    },
    shouldTurn(){
      return false;
    }
  });
  teslaStormEntity.setEff();
  return teslaStormEntity;
};