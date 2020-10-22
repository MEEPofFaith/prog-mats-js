const open = new Vec2();
const back = new Vec2();

//Editable stuff for custom laser.
//4 colors from outside in. Normal meltdown laser has trasnparrency 55 -> aa -> ff (no transparrency) -> ff(no transparrency)
var colors = [Color.valueOf("a3570055"), Color.valueOf("bf6804aa"), Color.valueOf("db7909"), Color.valueOf("f08913")];
var length = 32;
const burnRadius = 36;

//Stuff you probably shouldn't edit.
//Width of each section of the beam from thickest to thinnest
var tscales = [1, 0.7, 0.5, 0.2];
//Overall width of each color
var strokes = [burnRadius/2, burnRadius/2.5, burnRadius/3, burnRadius/3.5];
//Determines how far back each section in the start should be pulled
var pullscales = [1, 1.12, 1.15, 1.17];
//Determines how far each section of the end should extend past the main thickest section
var lenscales = [1, 1.3, 1.6, 1.9];

var tmpColor = new Color();
const vec = new Vec2();

const magmaPool = extend(BasicBulletType, {
  update(b){
    if(b != null){
      if(b.getOwner().target != null){
        var target = Angles.angle(b.x, b.y, b.getOwner().target.getX(), b.getOwner().target.getY());
        b.rot(Mathf.slerpDelta(b.rot(), target, 0.15));
      };
      
      if(b.timer.get(1, 5)){
        Damage.damage(b.team, b.x, b.y, burnRadius, this.damage, true);
      };
      
      Puddles.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.slag, 100000);
      Puddles.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.oil, 99000);
    }
  },
  draw(b){
    if(b != null){
      //middle
      Draw.blend(Blending.additive);
      Draw.color(Color.valueOf("f08913"));
      Draw.alpha(b.fout());
      Fill.circle(b.x, b.y, burnRadius);
      Draw.blend();
      Draw.color();
      
      //ring
      Draw.color(Color.valueOf("a35700"));
      Draw.alpha(b.fout());
      Lines.stroke(1);
      Lines.circle(b.x, b.y, burnRadius);
      
      //"fountain" of lava
      Draw.blend(Blending.additive);
      for(s = 0; s < 4; s++){
        Draw.color(tmpColor.set(colors[s]).mul(1.0 + Mathf.absin(Time.time() + b.id, 1.0, 0.3)));
        Draw.alpha(b.fout());
        for(var i = 0; i < 4; i++){
          var baseLen = (length + (Mathf.absin(b.getOwner().getBulletLife()/((i+1)*2.5) + b.id, 0.8, 1.5)*(length/1.5))) * b.fout();
          Tmp.v1.trns(90, (pullscales[i] - 1.0) * 55.0);
          Lines.stroke(4 * strokes[s] * tscales[i]);
          Lines.lineAngle(b.x, b.y, 90, baseLen * b.fout() * lenscales[i], CapStyle.none);
        };
      };
      Draw.blend();
      Draw.color();
      Draw.reset();
    };
  }
});

magmaPool.speed = 2;
magmaPool.lifetime = 16;
magmaPool.damage = 75;
magmaPool.collides = false;
magmaPool.collidesTiles = false;
magmaPool.hitEffect = Fx.fireballsmoke;
magmaPool.despawnEffect = Fx.none;
magmaPool.shootEffect = Fx.none;
magmaPool.smokeEffect = Fx.none;

//Got some help from EoD for the turning LaserTurret into PowerTurret part
const lavaRiser = extendContent(PowerTurret, "eruptor-ii", {
  load(){
    this.super$load();
    this.cells = [];
    this.cellHeats = [];
    this.capsA = [];
    this.capsB = [];
    
    for(var i = 0; i < 2; i++){
      this.cells[i] = Core.atlas.find(this.name + "-cells-" + i);
      this.cellHeats[i] = Core.atlas.find(this.name + "-cells-heat-" + i);
    };
    for(var i = 0; i < 4; i++){
      this.capsA[i] = Core.atlas.find(this.name + "-caps-0-" + i);
      this.capsB[i] = Core.atlas.find(this.name + "-caps-1-" + i);
    };
  },
  icons(){
    return [
      Core.atlas.find("block-4"),
      Core.atlas.find("definitely-not-advance-content-eruptor-ii-icon")
    ];
  }
});

lavaRiser.shootType = magmaPool;
lavaRiser.shootDuration = 240;
lavaRiser.COA = 1.5;
lavaRiser.firingMoveFract = 0.8;
lavaRiser.shootEffect = Fx.none;
lavaRiser.smokeEffect = Fx.none;
lavaRiser.ammoUseEffect = Fx.none;
lavaRiser.restitution = 0.01;

lavaRiser.buildType = () => {
	var magmaEntity = extendContent(PowerTurret.PowerTurretBuild, lavaRiser, {
		setEff(){
			this._bullet = null;
			this._bulletLife = 0;
      this._cellOpenAmount = 0;
  },
    draw(){
      Draw.rect(lavaRiser.baseRegion, this.x, this.y, 0);
      
      Draw.z(Layer.turret);
      
      Drawf.shadow(lavaRiser.region, this.x, this.y, this.rotation-90);
      Draw.rect(lavaRiser.region, this.x, this.y, this.rotation-90);
      
      back.trns(this.rotation-90, 0, 0);
      
      //Bottom Layer Cells
      Drawf.shadow(lavaRiser.cells[0], this.x + open.x, this.y + open.y, this.rotation-90);
      Draw.rect(lavaRiser.cells[0], this.x + back.x, this.y + back.y, this.rotation-90);
      
      if(this.heat > 0){
        Draw.blend(Blending.additive);
        Draw.color(Color.valueOf("f08913"), this.heat);
        Draw.rect(lavaRiser.cellHeats[0], this.x + back.x, this.y + back.y, this.rotation-90);
        Draw.blend();
        Draw.color();
      };
      
      //sw
      open.trns(this.rotation-90, 0 - this._cellOpenAmount, -this._cellOpenAmount);
      Drawf.shadow(lavaRiser.capsA[0], this.x + open.x, this.y + open.y, this.rotation-90);
      Draw.rect(lavaRiser.capsA[0], this.x + open.x, this.y + open.y, this.rotation-90);
      
      //se
      open.trns(this.rotation-90, 0 + this._cellOpenAmount, -this._cellOpenAmount);
      Drawf.shadow(lavaRiser.capsA[1], this.x + open.x, this.y + open.y, this.rotation-90);
      Draw.rect(lavaRiser.capsA[1], this.x + open.x, this.y + open.y, this.rotation-90);
      
      //nw
      open.trns(this.rotation-90, 0 - this._cellOpenAmount, this._cellOpenAmount);
      Drawf.shadow(lavaRiser.capsA[2], this.x + open.x, this.y + open.y, this.rotation-90);
      Draw.rect(lavaRiser.capsA[2], this.x + open.x, this.y + open.y, this.rotation-90);
      
      //nw
      open.trns(this.rotation-90, 0 + this._cellOpenAmount, this._cellOpenAmount);
      Drawf.shadow(lavaRiser.capsA[3], this.x + open.x, this.y + open.y, this.rotation-90);
      Draw.rect(lavaRiser.capsA[3], this.x + open.x, this.y + open.y, this.rotation-90);
      
      
      //Top Layer Cells
      Drawf.shadow(lavaRiser.cells[1], this.x + open.x, this.y + open.y, this.rotation-90);
      Draw.rect(lavaRiser.cells[1], this.x + back.x, this.y + back.y, this.rotation-90);
      
      if(this.heat > 0){
        Draw.blend(Blending.additive);
        Draw.color(Color.valueOf("f08913"), this.heat);
        Draw.rect(lavaRiser.cellHeats[1], this.x + back.x, this.y + back.y, this.rotation-90);
        Draw.blend();
        Draw.color();
      };
      
      //sw
      open.trns(this.rotation-90, 0 - this._cellOpenAmount, -this._cellOpenAmount);
      Drawf.shadow(lavaRiser.capsB[0], this.x + open.x, this.y + open.y, this.rotation-90);
      Draw.rect(lavaRiser.capsB[0], this.x + open.x, this.y + open.y, this.rotation-90);
      
      //se
      open.trns(this.rotation-90, 0 + this._cellOpenAmount, -this._cellOpenAmount);
      Drawf.shadow(lavaRiser.capsB[1], this.x + open.x, this.y + open.y, this.rotation-90);
      Draw.rect(lavaRiser.capsB[1], this.x + open.x, this.y + open.y, this.rotation-90);
      
      //nw
      open.trns(this.rotation-90, 0 - this._cellOpenAmount, this._cellOpenAmount);
      Drawf.shadow(lavaRiser.capsB[2], this.x + open.x, this.y + open.y, this.rotation-90);
      Draw.rect(lavaRiser.capsB[2], this.x + open.x, this.y + open.y, this.rotation-90);
      
      //nw
      open.trns(this.rotation-90, 0 + this._cellOpenAmount, this._cellOpenAmount);
      Drawf.shadow(lavaRiser.capsB[3], this.x + open.x, this.y + open.y, this.rotation-90);
      Draw.rect(lavaRiser.capsB[3], this.x + open.x, this.y + open.y, this.rotation-90);
    },
    setStats(){
      this.super$setStats();
      
      this.stats.remove(BlockStat.inaccuracy);
      this.stats.remove(BlockStat.damage);
      //damages every 5 ticks
      this.stats.add(BlockStat.damage, lavaRiser.shootType.damage * 60 / 5, StatUnit.perSecond);
    },
    updateTile(){
      this.super$updateTile();
      
      if(this._bulletLife <= 0 && this._bullet == null){
        this._cellOpenAmount = Mathf.lerpDelta(this._cellOpenAmount, 0, lavaRiser.restitution);
      };
      
      if(this._bulletLife > 0 && this._bullet != null){
        if(this._bulletLife >= lavaRiser.shootDuration){
          this._bullet.set(this.target.getX(), this.target.getY());
        };
        
        this.tr.trns(this.rotation, lavaRiser.size * Vars.tilesize / 2, 0);
        this._bullet.time(0);
        this.heat = 1;
        this._cellOpenAmount = lavaRiser.COA * 1+(Mathf.absin(this._bulletLife/3, 0.8, 1.5)/3);
        this._bulletLife = this._bulletLife - Time.delta();
        if(this._bulletLife <= 0){
          this._bullet = null;
        };
      };
    },
    updateShooting(){
      if(this._bulletLife > 0 && this._bullet != null){
        return;
      };
      
      if(this.reload >= lavaRiser.reloadTime){
        var type = this.peekAmmo();
        
        this.shoot(type);
        
        this.reload = 0;
      }else{
        this.reload += this.delta() * this.baseReloadSpeed();
      };
    },
    bullet(type, angle){
      bullet = type.create(this, this.team, this.x + this.tr.x, this.y + this.tr.y, angle);
      
      this._bullet = bullet;
      this._bulletLife = lavaRiser.shootDuration;
    },
    turnToTarget(targetRot){
      this.rotation = Angles.moveToward(this.rotation, targetRot, this.rotateSpeed * this.delta() * (this._bulletLife > 0 ? this.firingMoveFract : 1));
    },
    shouldActiveSound(){
      return this._bulletLife > 0 && this._bullet != null;
    }
	});
	magmaEntity.setEff();
	return magmaEntity;
};