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
targetLightning.layer = Layer.bullet + 0.01;

const lightningLine = new Vec2();
const lightningCol = Pal.surge;

const ringZap = extend(LightningBulletType, {
  damage: 8,
  lightningLength: 5,
  lightningLengthRand: 3,
  lightningAngle: 0,
  lightningColor: lightningCol,
  lightRadius: 24,
  lightOpcaity: 0.7,
  hittable: false
});

const teslaRing = extend(PowerTurret, "tesla-i", {
  setStats(){
    this.super$setStats();
    
    this.stats.remove(Stat.inaccuracy);
    this.stats.add(Stat.inaccuracy, teslaRing.inaccuracy / 8, StatUnit.blocks);
  },
  size: 1,
  health: 260,
  powerUse: 3.6,
  reloadTime: 60,
  shootCone: 360,
  heatColor: Color.valueOf("fff694"),
  shootType: ringZap,
  range: 72,
  shots: 2,
  zaps: 4,
  inaccuracy: 32,
  angleRand: 27,
  lightningColor: lightningCol,
  shootSound: Sounds.spark,
  shootEffect: Fx.sparkShoot
});

teslaRing.setupRequirements(Category.turret, ItemStack.with(
  Items.copper, 45,
  Items.lead, 60,
  Items.silicon, 25,
  Items.titanium, 25
));

const shootLoc = new Vec2();
const inacc = new Vec2();

teslaRing.buildType = ent => {
  ent = extend(PowerTurret.PowerTurretBuild, teslaRing, {
    setEff(){
      this._currentTarget = 0;
      this._shootAngle = 0;
      this._dist = 0;
    },
    shoot(type){
      //I have ascended to stealing code from myself.
      this._targetX.clear();
      this._targetY.clear();
      
      Units.nearbyEnemies(this.team, this.x - teslaRing.range, this.y - teslaRing.range, teslaRing.range * 2, teslaRing.range * 2, e => {
				if(Mathf.within(this.x, this.y, e.x, e.y, teslaRing.range) && !e.dead){
          if(this._targetX.size <= 127){
            this._targetX.add(e.x);
            this._targetY.add(e.y);
          }
        };
      });
      
      var tx = Vars.world.toTile(this.x);
      var ty = Vars.world.toTile(this.y);
      
      var tileRange = Mathf.floorPositive(teslaRing.range / Vars.tilesize + 1);
      
      this._targetBlocks.clear();
      
      for(var x = -tileRange + tx; x <= tileRange + tx; x++){
        yGroup:
        for(var y = -tileRange + ty; y <= tileRange + ty; y++){
          if(!Mathf.within(x * Vars.tilesize, y * Vars.tilesize, this.x, this.y, teslaRing.range)) continue yGroup;
          var other = Vars.world.build(x, y);
          if(other == null) continue yGroup;
          if(!this._targetBlocks.contains(other.pos())){
            if(other.team != this.team && !other.dead){
              if(this._targetX.size <= 127){
                this._targetX.add(other.x);
                this._targetY.add(other.y);
              }
            }
          };
        };
      };
      
      if(this._targetX.size >= 0){
        for(var i = 0; i < teslaRing.shots; i++){
          this._currentTarget = Mathf.floor(Mathf.random(this._targetX.size - 0.001));
          inacc.trns(Mathf.random(360), 0, Mathf.range(teslaRing.inaccuracy));
          if(this._currentTarget >= 0){
            this.heat = 1;
            var targX = this._targetX.get(this._currentTarget) + inacc.x;
            var targY = this._targetY.get(this._currentTarget) + inacc.y;
            
            var shootLocs = [0.75, 2.5];
            shootLoc.trns(Mathf.random(360), shootLocs[Mathf.round(Mathf.random(1))]);
            
            this._shootAngle = Angles.angle(this.x + shootLoc.x, this.y + shootLoc.y, targX, targY);
            this._dist = Mathf.dst(this.x + shootLoc.x, this.y + shootLoc.y, targX, targY);
            
            targetLightning.at(this.x + shootLoc.x, this.y + shootLoc.y, this._shootAngle, teslaRing.lightningColor, [this._dist, 5, this.team]);
            teslaRing.shootSound.at(this.x + shootLoc.x, this.y + shootLoc.y, Mathf.random(0.9, 1.1));
            teslaRing.shootEffect.at(this.x + shootLoc.x, this.y + shootLoc.y, this._shootAngle, teslaRing.lightningColor);
            
            const shootX = targX;
            const shootY = targY;
            Time.run(3, () => {
              for(var j = 0; j < teslaRing.zaps; j++){
                teslaRing.shootType.create(this, this.team, shootX, shootY, ((360 / teslaRing.zaps) * j) + Mathf.range(teslaRing.angleRand));
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
  ent._targetX = new Seq(127);
  ent._targetY = new Seq(127);
  ent._targetBlocks = new Seq(127);
  ent.setEff();
  return ent;
};