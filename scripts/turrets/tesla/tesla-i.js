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

const ringZap = extend(LightningBulletType, {});

const lightningCol = Pal.surge;

ringZap.damage = 8;
ringZap.lightningLength = 5;
ringZap.lightningLengthRand = 3;
ringZap.lightningAngle = 0;
ringZap.lightningColor = lightningCol;
//ringZap.collidesTiles = false;
ringZap.hittable = false;

const teslaRing = extendContent(PowerTurret, "tesla-i", {
  setStats(){
    this.super$setStats();
    
    this.stats.remove(Stat.inaccuracy);
    
    //Something can get hit by multiple strikes since they all spawn in the same place.
    this.stats.remove(Stat.damage);
    this.stats.add(Stat.damage, teslaRing.shootType.damage + " - " + teslaRing.shootType.damage * teslaRing.zaps);
  }
});

teslaRing.shootType = ringZap;
teslaRing.range = 72;
teslaRing.shots = 2;
teslaRing.zaps = 4;
teslaRing.angleRand = 27;
teslaRing.lightningColor = lightningCol;
teslaRing.shootSound = Sounds.spark;
teslaRing.shootEffect = Fx.sparkShoot;
teslaRing.shootSmoke = lightningSmoke;

const shootLoc = new Vec2();

teslaRing.buildType = () => {
  var teslaRingEntity = extendContent(PowerTurret.PowerTurretBuild, teslaRing, {
    setEff(){
      this._currentTarget = 0;
      this._shootAngle = 0;
      this._dist = 0;
    },
    shoot(type){
      //I have ascended to stealing code from myself.
      teslaRingEntity.targetX.clear();
      teslaRingEntity.targetY.clear();
      
      Units.nearbyEnemies(this.team, this.x - teslaRing.range, this.y - teslaRing.range, teslaRing.range * 2, teslaRing.range * 2, e => {
				if(Mathf.within(this.x, this.y, e.x, e.y, teslaRing.range) && !e.dead){
          if(teslaRingEntity.targetX.size <= 127){
            teslaRingEntity.targetX.add(e.x);
            teslaRingEntity.targetY.add(e.y);
          }
        };
      });
      
      var tx = Vars.world.toTile(this.x);
      var ty = Vars.world.toTile(this.y);
      
      var tileRange = Mathf.floorPositive(teslaRing.range / Vars.tilesize + 1);
      
      teslaRingEntity.targetBlocks.clear();
      
      for(var x = -tileRange + tx; x <= tileRange + tx; x++){
        yGroup:
        for(var y = -tileRange + ty; y <= tileRange + ty; y++){
          if(!Mathf.within(x * Vars.tilesize, y * Vars.tilesize, this.x, this.y, teslaRing.range)) continue yGroup;
          var other = Vars.world.build(x, y);
          if(other == null) continue yGroup;
          if(!teslaRingEntity.targetBlocks.contains(other.pos())){
            if(other.team != this.team && !other.dead){
              if(teslaRingEntity.targetX.size <= 127){
                teslaRingEntity.targetX.add(other.x);
                teslaRingEntity.targetY.add(other.y);
              }
            }
          };
        };
      };
      
      if(teslaRingEntity.targetX.size >= 0){
        this.heat = 1;
        for(var i = 0; i < teslaRing.shots; i++){
          this._currentTarget = Mathf.floor(Mathf.random(teslaRingEntity.targetX.size - 0.001));
          var targX = teslaRingEntity.targetX.get(this._currentTarget);
          var targY = teslaRingEntity.targetY.get(this._currentTarget);
          
          var shootLocs = [0.75, 2.5];
          shootLoc.trns(Mathf.random(360), shootLocs[Mathf.round(Mathf.random(1))]);
          
          this._shootAngle = Angles.angle(this.x + shootLoc.x, this.y + shootLoc.y, targX, targY);
          this._dist = Mathf.dst(this.x + shootLoc.x, this.y + shootLoc.y, targX, targY);
          
          targetLightning.at(this.x + shootLoc.x, this.y + shootLoc.y, this._shootAngle, teslaRing.lightningColor, [this._dist]);
          teslaRing.shootSound.at(this.x + shootLoc.x, this.y + shootLoc.y, Mathf.random(0.9, 1.1));
          teslaRing.shootEffect.at(this.x + shootLoc.x, this.y + shootLoc.y, this._shootAngle, teslaRing.lightningColor);
          teslaRing.shootSmoke.at(this.x + shootLoc.x, this.y + shootLoc.y, this._shootAngle, teslaRing.lightningColor);
          
          const thisX = targX;
          const thisY = targY;
          Time.run(3, () => {
            for(var j = 0; j < teslaRing.zaps; j++){
              teslaRing.shootType.create(this, this.team, thisX, thisY, ((360 / teslaRing.zaps) * j) + Mathf.range(teslaRing.angleRand));
            }
          });
        }
      }
    },
    shouldTurn(){
      return false;
    }
  });
  teslaRingEntity.targetX = new Seq(127);
  teslaRingEntity.targetY = new Seq(127);
  teslaRingEntity.targetBlocks = new Seq(127);
  teslaRingEntity.setEff();
  return teslaRingEntity;
};