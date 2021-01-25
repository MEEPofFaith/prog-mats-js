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
    Drawf.light(e.data[2], tV.x, tV.y, tV2.x, tV2.y, e.data[1] * 3, e.color, 0.4);
	};
  Fill.circle(tV2.x, tV2.y, Lines.getStroke() / 2);
});

targetLightning.layer = 117;

const lightningLine = new Vec2();

const coilZap = extend(LightningBulletType, {});

const lightningCol = Pal.surge;

coilZap.damage = 12;
coilZap.lightningLength = 6;
coilZap.lightningLengthRand = 4;
coilZap.lightningAngle = 0;
coilZap.lightningColor = lightningCol;
coilZap.lightRadius = 24;
coilZap.lightOpcaity = 0.7;
coilZap.hittable = false;

const teslaCoil = extendContent(PowerTurret, "tesla-ii", {
  setStats(){
    this.super$setStats();
    
    this.stats.remove(Stat.inaccuracy);
    this.stats.add(Stat.inaccuracy, teslaCoil.inaccuracy / 8, StatUnit.blocks);
    
    //Something can get hit by multiple strikes since they all spawn in the same place.
    this.stats.remove(Stat.damage);
    this.stats.add(Stat.damage, teslaCoil.shootType.damage + " - " + teslaCoil.shootType.damage * teslaCoil.zaps);
  }
});

teslaCoil.shootType = coilZap;
teslaCoil.range = 130;
teslaCoil.shots = 2;
teslaCoil.zaps = 6;
teslaCoil.inaccuracy = 28;
teslaCoil.angleRand = 19;
teslaCoil.lightningColor = lightningCol;
teslaCoil.shootSound = Sounds.spark;
teslaCoil.shootEffect = Fx.sparkShoot;

/*
requirements:[
  copper/60
  lead/85
  graphite/40
  silicon/55
  titanium/80
]
*/
// teslaCoil.requirements(Category.turret, ItemStack.with(Items.copper, 60, Items.lead, 85, Items.graphite, 40, Items.silicon, 55, Items.titanium, 80));
teslaCoil.requirements = ItemStack.with(Items.copper, 60, Items.lead, 85, Items.graphite, 40, Items.silicon, 55, Items.titanium, 80);
teslaCoil.category = Category.turret;
teslaCoil.buildVisibility = BuildVisibility.shown;

const shootLoc = new Vec2();
const inacc = new Vec2();

teslaCoil.buildType = ent => {
  ent = extendContent(PowerTurret.PowerTurretBuild, teslaCoil, {
    setEff(){
      this._currentTarget = 0;
      this._shootAngle = 0;
      this._dist = 0;
    },
    shoot(type){
      //I have ascended to stealing code from myself.
      this._targetX.clear();
      this._targetY.clear();
      
      Units.nearbyEnemies(this.team, this.x - teslaCoil.range, this.y - teslaCoil.range, teslaCoil.range * 2, teslaCoil.range * 2, e => {
				if(Mathf.within(this.x, this.y, e.x, e.y, teslaCoil.range) && !e.dead){
          if(this._targetX.size <= 255){
            this._targetX.add(e.x);
            this._targetY.add(e.y);
          }
        };
      });
      
      var tx = Vars.world.toTile(this.x);
      var ty = Vars.world.toTile(this.y);
      
      var tileRange = Mathf.floorPositive(teslaCoil.range / Vars.tilesize + 1);
      
      this._targetBlocks.clear();
      
      for(var x = -tileRange + tx; x <= tileRange + tx; x++){
        yGroup:
        for(var y = -tileRange + ty; y <= tileRange + ty; y++){
          if(!Mathf.within(x * Vars.tilesize, y * Vars.tilesize, this.x, this.y, teslaCoil.range)) continue yGroup;
          var other = Vars.world.build(x, y);
          if(other == null) continue yGroup;
          if(!this._targetBlocks.contains(other.pos())){
            if(other.team != this.team && !other.dead){
              if(this._targetX.size <= 255){
                this._targetX.add(other.x);
                this._targetY.add(other.y);
              }
            }
          };
        };
      };
      
      if(this._targetX.size >= 0){
        for(var i = 0; i < teslaCoil.shots; i++){
          this._currentTarget = Mathf.floor(Mathf.random(this._targetX.size - 0.001));
          inacc.trns(Mathf.random(360), 0, Mathf.range(teslaCoil.inaccuracy));
          if(this._currentTarget >= 0){
            this.heat = 1;
            var targX = this._targetX.get(this._currentTarget) + inacc.x;
            var targY = this._targetY.get(this._currentTarget) + inacc.y;
            
            var shootLocs = [2, 6];
            shootLoc.trns(Mathf.random(360), shootLocs[Mathf.round(Mathf.random(1))]);
            
            this._shootAngle = Angles.angle(this.x + shootLoc.x, this.y + shootLoc.y, targX, targY);
            this._dist = Mathf.dst(this.x + shootLoc.x, this.y + shootLoc.y, targX, targY);
            
            targetLightning.at(this.x + shootLoc.x, this.y + shootLoc.y, this._shootAngle, teslaCoil.lightningColor, [this._dist, 5, this.team]);
            teslaCoil.shootSound.at(this.x + shootLoc.x, this.y + shootLoc.y, Mathf.random(0.9, 1.1));
            teslaCoil.shootEffect.at(this.x + shootLoc.x, this.y + shootLoc.y, this._shootAngle, teslaCoil.lightningColor);
            
            const shootX = targX;
            const shootY = targY;
            Time.run(3, () => {
              for(var j = 0; j < teslaCoil.zaps; j++){
                teslaCoil.shootType.create(this, this.team, shootX, shootY, ((360 / teslaCoil.zaps) * j) + Mathf.range(teslaCoil.angleRand));
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
  ent._targetX = new Seq(255);
  ent._targetY = new Seq(255);
  ent._targetBlocks = new Seq(255);
  ent.setEff();
  return ent;
};