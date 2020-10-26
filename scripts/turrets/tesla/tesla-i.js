const tV = new Vec2();
const tV2 = new Vec2();

//Stolen effect from [redacted] from [redacted]
//Why do I keep stealing things.
const targetLightning = new Effect(10, 500, e => {
	var length = e.data[0];
	var tileLength = Mathf.round(length / 8);
	
	Lines.stroke(3 * e.fout());
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
});

const lightningLine = new Vec2();

const ringZap = extend(LightningBulletType, {});

const lightningCol = Pal.lancerLaser;

ringZap.damage = 13;
ringZap.lightningLength = 4;
ringZap.lightningLengthRand = 1;
ringZap.lightningAngle = 0;
ringZap.lightningColor = lightningCol;
//ringZap.collidesTiles = false;
ringZap.hittable = false;

const teslaRing = extendContent(PowerTurret, "tesla-i", {});

teslaRing.shootType = ringZap;
teslaRing.range = 72;
teslaRing.arcs = 1;
teslaRing.zaps = 3;
teslaRing.angleRand = 27;
teslaRing.lightningColor = lightningCol;

const targetX = new Seq(255);
const targetY = new Seq(255);
const targets = new Seq(127);

teslaRing.buildType = () => {
  var teslaRingEntity = extendContent(PowerTurret.PowerTurretBuild, teslaRing, {
    setEff(){
      this._targetCount = -1;
      this._currentTarget = 0;
      this._shootAngle = 0;
      this._dist = 0;
    },
    shoot(type){
      //I have ascended to stealing code from myself.
      targetX.clear();
      targetY.clear();
      this._targetCount = -1;
      
      Units.nearbyEnemies(this.team, this.x - teslaRing.range, this.y - teslaRing.range, teslaRing.range * 2, teslaRing.range * 2, e => {
				if(Mathf.within(this.x, this.y, e.x, e.y, teslaRing.range) && !e.dead){
            targetX.add(e.x);
            targetY.add(e.y);
            this._targetCount++;
        };
      });
      
      var tx = Vars.world.toTile(this.x);
      var ty = Vars.world.toTile(this.y);
      
      var tileRange = Mathf.floorPositive(teslaRing.range / Vars.tilesize + 1);
      
      targets.clear();
      
      for(var x = -tileRange + tx; x <= tileRange + tx; x++){
        yGroup:
        for(var y = -tileRange + ty; y <= tileRange + ty; y++){
          if(!Mathf.within(x * Vars.tilesize, y * Vars.tilesize, this.x, this.y, teslaRing.range)) continue yGroup;
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
        for(var i = 0; i < teslaRing.arcs; i++){
          this._currentTarget = Mathf.floor(Mathf.random(this._targetCount + 0.999));
          var targX = targetX.get(this._currentTarget);
          var targY = targetY.get(this._currentTarget);
          
          this._shootAngle = Angles.angle(this.x, this.y, targX, targY);
          this._dist = Mathf.dst(this.x, this.y, targX, targY);
          
          targetLightning.at(this.x, this.y, this._shootAngle, teslaRing.lightningColor, [this._dist]);
          
          for(var j = 0; j < teslaRing.zaps; j++){
            teslaRing.shootType.create(this, this.team, targX, targY, ((360 / teslaRing.zaps) * j) + Mathf.range(teslaRing.angleRand));
          }
        }
      }
    },
    shouldTurn(){
      return false;
    }
  });
  teslaRingEntity.setEff();
  return teslaRingEntity;
};