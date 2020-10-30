const tV = new Vec2();
const tV2 = new Vec2();

//Stolen effect from [redacted] from [redacted/redacted]
//Why do I keep stealing things.
const targetLightning = new Effect(10, 500, e => {
	var length = e.data[0];
	var tileLength = Mathf.round(length / 8);
	
	Lines.stroke(5 * e.fout());
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

targetLightning.layer = 117;

const lightningSmoke = new Effect(30, e=> {
  Angles.randLenVectors(e.id, 12, e.finpow() * 36, e.rotation, 15, (x, y) => {
    var size = e.fout() * 2;
    Draw.color(e.color);
    Draw.alpha(e.fslope());
    Fill.circle(e.x + x, e.y + y, size);
  });
});

const lightningLine = new Vec2();

const coilZap = extend(LightningBulletType, {});

const lightningCol = Pal.surge;

coilZap.damage = 12;
coilZap.lightningLength = 6;
coilZap.lightningLengthRand = 4;
coilZap.lightningAngle = 0;
coilZap.lightningColor = lightningCol;
//coilZap.collidesTiles = false;
coilZap.hittable = false;

const teslaCoil = extendContent(PowerTurret, "tesla-ii", {
  setStats(){
    this.super$setStats();
    
    this.stats.remove(Stat.inaccuracy);
    
    //Something can get hit by multiple strikes since they all spawn in the same place.
    this.stats.remove(Stat.damage);
    this.stats.add(Stat.damage, teslaCoil.shootType.damage + " - " + teslaCoil.shootType.damage * teslaCoil.zaps);
  }
});

teslaCoil.shootType = coilZap;
teslaCoil.range = 130;
teslaCoil.shots = 2;
teslaCoil.zaps = 6;
teslaCoil.angleRand = 19;
teslaCoil.lightningColor = lightningCol;
teslaCoil.shootSound = Sounds.spark;
teslaCoil.shootEffect = Fx.sparkShoot;
teslaCoil.shootSmoke = lightningSmoke;

const shootLoc = new Vec2();

teslaCoil.buildType = () => {
  var teslaCoilEntity = extendContent(PowerTurret.PowerTurretBuild, teslaCoil, {
    setEff(){
      this._currentTarget = 0;
      this._shootAngle = 0;
      this._dist = 0;
    },
    shoot(type){
      //I have ascended to stealing code from myself.
      teslaCoilEntity.targetX.clear();
      teslaCoilEntity.targetY.clear();
      
      Units.nearbyEnemies(this.team, this.x - teslaCoil.range, this.y - teslaCoil.range, teslaCoil.range * 2, teslaCoil.range * 2, e => {
				if(Mathf.within(this.x, this.y, e.x, e.y, teslaCoil.range) && !e.dead){
          if(teslaCoilEntity.targetX.size <= 255){
            teslaCoilEntity.targetX.add(e.x);
            teslaCoilEntity.targetY.add(e.y);
          }
        };
      });
      
      var tx = Vars.world.toTile(this.x);
      var ty = Vars.world.toTile(this.y);
      
      var tileRange = Mathf.floorPositive(teslaCoil.range / Vars.tilesize + 1);
      
      teslaCoilEntity.targetBlocks.clear();
      
      for(var x = -tileRange + tx; x <= tileRange + tx; x++){
        yGroup:
        for(var y = -tileRange + ty; y <= tileRange + ty; y++){
          if(!Mathf.within(x * Vars.tilesize, y * Vars.tilesize, this.x, this.y, teslaCoil.range)) continue yGroup;
          var other = Vars.world.build(x, y);
          if(other == null) continue yGroup;
          if(!teslaCoilEntity.targetBlocks.contains(other.pos())){
            if(other.team != this.team && !other.dead){
              if(teslaCoilEntity.targetX.size <= 255){
                teslaCoilEntity.targetX.add(other.x);
                teslaCoilEntity.targetY.add(other.y);
              }
            }
          };
        };
      };
      
      if(teslaCoilEntity.targetX.size >= 0){
        this.heat = 1;
        for(var i = 0; i < teslaCoil.shots; i++){
          this._currentTarget = Mathf.floor(Mathf.random(teslaCoilEntity.targetX.size - 0.001));
          var targX = teslaCoilEntity.targetX.get(this._currentTarget);
          var targY = teslaCoilEntity.targetY.get(this._currentTarget);
          
          var shootLocs = [2, 6];
          shootLoc.trns(Mathf.random(360), shootLocs[Mathf.round(Mathf.random(1))]);
          
          this._shootAngle = Angles.angle(this.x + shootLoc.x, this.y + shootLoc.y, targX, targY);
          this._dist = Mathf.dst(this.x + shootLoc.x, this.y + shootLoc.y, targX, targY);
          
          targetLightning.at(this.x + shootLoc.x, this.y + shootLoc.y, this._shootAngle, teslaCoil.lightningColor, [this._dist]);
          teslaCoil.shootSound.at(this.x + shootLoc.x, this.y + shootLoc.y, Mathf.random(0.9, 1.1));
          teslaCoil.shootEffect.at(this.x + shootLoc.x, this.y + shootLoc.y, this._shootAngle, teslaCoil.lightningColor);
          teslaCoil.shootSmoke.at(this.x + shootLoc.x, this.y + shootLoc.y, this._shootAngle, teslaCoil.lightningColor);
          
          const thisX = targX;
          const thisY = targY;
          Time.run(3, () => {
            for(var j = 0; j < teslaCoil.zaps; j++){
              teslaCoil.shootType.create(this, this.team, thisX, thisY, ((360 / teslaCoil.zaps) * j) + Mathf.range(teslaCoil.angleRand));
            }
          });
        }
      }
    },
    shouldTurn(){
      return false;
    }
  });
  teslaCoilEntity.targetX = new Seq(255);
  teslaCoilEntity.targetY = new Seq(255);
  teslaCoilEntity.targetBlocks = new Seq(255);
  teslaCoilEntity.setEff();
  return teslaCoilEntity;
};