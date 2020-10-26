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

const stormZap = extend(LightningBulletType, {});

const lightningCol = Pal.lancerLaser;

stormZap.damage = 61; //Note: I'm making up these numbers as I go.
stormZap.lightningLength = 8;
stormZap.lightningLengthRand = 4;
stormZap.lightningAngle = 0;
stormZap.lightningColor = lightningCol;
//stormZap.collidesTiles = false;
stormZap.hittable = false;

const teslaStorm = extendContent(PowerTurret, "tesla-iii", {});

teslaStorm.shootType = stormZap;
teslaStorm.range = 130;
teslaStorm.arcs = 5;
teslaStorm.zaps = 7;
teslaStorm.angleRand = 13;
teslaStorm.lightningColor = lightningCol;

const targetX = new Seq(255);
const targetY = new Seq(255);
const targets = new Seq(127);

teslaStorm.buildType = () => {
  var teslaStormEntity = extendContent(PowerTurret.PowerTurretBuild, teslaStorm, {
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
        for(var i = 0; i < teslaStorm.arcs; i++){
          this._currentTarget = Mathf.floor(Mathf.random(this._targetCount + 0.999));
          var targX = targetX.get(this._currentTarget);
          var targY = targetY.get(this._currentTarget);
          
          this._shootAngle = Angles.angle(this.x, this.y, targX, targY);
          this._dist = Mathf.dst(this.x, this.y, targX, targY);
          
          targetLightning.at(this.x, this.y, this._shootAngle, teslaStorm.lightningColor, [this._dist]);
          
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