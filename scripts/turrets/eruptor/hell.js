const side = new Vec2();
const open = new Vec2();
const rangeloc = new Vec2();

//Editable stuff for custom laser.
//4 colors from outside in. Normal meltdown laser has trasnparrency 55 -> aa -> ff (no transparrency) -> ff(no transparrency)
var colors = [Color.valueOf("a3570055"), Color.valueOf("bf6804aa"), Color.valueOf("db7909"), Color.valueOf("f08913")];
var length = 8;
const burnRadius = 8;

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

const hellPool = extend(BasicBulletType, {
  update(b){
    if(b != null){
      if(b.timer.get(1, 5)){
        Damage.damage(b.team, b.x, b.y, burnRadius, this.damage, true);
      }
      
      Puddles.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.slag, 10000);
      Puddles.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.oil, 9000);
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
      for(var s = 0; s < 4; s++){
        Draw.color(tmpColor.set(colors[s]).mul(1.0 + Mathf.absin(Time.time() + b.id, 1.0, 0.3)));
        Draw.alpha(b.fout());
        for(var i = 0; i < 4; i++){
          var baseLen = (length + (Mathf.absin(Time.time()/((i + 1) *2) + b.id, 0.8, 1.5)*(length / 1.5))) * b.fout();
          Tmp.v1.trns(90, (pullscales[i] - 1.0) * 55.0);
          Lines.stroke(4 * strokes[s] * tscales[i]);
          Lines.lineAngle(b.x, b.y, 90, baseLen * b.fout() * lenscales[i], false);
        };
      };
      Draw.blend();
      Draw.color();
      Draw.reset();
    };
  }
});
const burnDuration = 30;

hellPool.speed = 0.0001;
hellPool.damage = 62.5;
hellPool.lifetime = burnDuration;
hellPool.collides = false;
hellPool.collidesTiles = false;
hellPool.hitEffect = Fx.fireballsmoke;
hellPool.despawnEffect = Fx.none;
hellPool.shootEffect = Fx.none;
hellPool.smokeEffect = Fx.none;
hellPool.hittable = false;

const collidedBlocks = new IntSet(127);

//Got some help from EoD for the turning LaserTurret into PowerTurret part
const hellRiser = extendContent(PowerTurret, "eruptor-iii", {
  load(){
    this.super$load();
    this.caps = [];
    this.sides = [];
    this.cells = [];
    this.cellHeats = [];
    this.outlines = [];
    
    this.bottomRegion = Core.atlas.find(this.name + "-bottom");
    for(var i = 0; i < 2; i++){
      this.sides[i] = Core.atlas.find(this.name + "-sides-" + i);
      this.outlines[i] = Core.atlas.find(this.name + "-outline-" + i);
    }
    for(var i = 0; i < 3; i++){
      this.cells[i] = Core.atlas.find(this.name + "-cells-" + i);
      this.cellHeats[i] = Core.atlas.find(this.name + "-cells-heat-" + i);
    }
    for(var i = 0; i < 4; i++){
      this.caps[i] = Core.atlas.find(this.name + "-caps-" + i);
    }
  },
  icons(){
    return [
      Core.atlas.find("block-4"),
      Core.atlas.find(this.name + "-icon")
    ];
  }
});

hellRiser.shootType = hellPool;
hellRiser.shootDuration = burnDuration;
hellRiser.range = 200;
hellRiser.reloadTime = 90;
hellRiser.shootCone = 360;
hellRiser.rotationSpeed = 0;
hellRiser.COA = 0.9;
hellRiser.SOA = 3;
hellRiser.shootEffect = Fx.none;
hellRiser.smokeEffect = Fx.none;
hellRiser.ammoUseEffect = Fx.none;
hellRiser.restitution = 0.01;

hellRiser.buildType = () => {
	var hellEntity = extendContent(PowerTurret.PowerTurretBuild, hellRiser, {
    setEff(){
      this._bulletLife = 0;
      this._cellOpenAmount = 0;
      this._cellSideAmount = 0;
    },
    draw(){
      Draw.rect(hellRiser.baseRegion, this.x, this.y, 0);
      
      Draw.z(Layer.turret);
      
      for(var i = 0; i < 2; i++){
        side.trns(this.rotation - 90, this._cellSideAmount * ((i - 0.5) * 2), 0);
        Drawf.shadow(hellRiser.outlines[i], this.x, this.y, this.rotation - 90);
        Draw.rect(hellRiser.outlines[i], this.x + side.x, this.y + side.y, this.rotation - 90);
      };
      
      Drawf.shadow(hellRiser.bottomRegion, this.x - (hellRiser.size / 2), this.y - (hellRiser.size / 2), this.rotation - 90);
      Draw.rect(hellRiser.bottomRegion, this.x, this.y, this.rotation - 90);
      
      //inside big cell
      Draw.rect(hellRiser.cells[2], this.x, this.y, this.rotation - 90);
      if(this.heat > 0.00001){
        Draw.blend(Blending.additive);
        Draw.color(Color.valueOf("ffbe73"), this.heat);
        Draw.rect(hellRiser.cellHeats[2], this.x + Mathf.range(1 * this.heat), this.y + Mathf.range(1 * this.heat), this.rotation - 90);
        Draw.blend();
        Draw.color();
      };
      
      //sides and cells
      for(var i = 0; i < 2; i ++){
        side.trns(this.rotation - 90, this._cellSideAmount * ((i-0.5)*2), 0);
        Drawf.shadow(hellRiser.sides[i], this.x + side.x - (hellRiser.size / 2), this.y + side.y - (hellRiser.size / 2), this.rotation - 90);
        Draw.rect(hellRiser.sides[i], this.x + side.x, this.y + side.y, this.rotation - 90);
        
        Drawf.shadow(hellRiser.cells[i], this.x + side.x - (hellRiser.size / 2), this.y + side.y - (hellRiser.size / 2), this.rotation - 90);
        Draw.rect(hellRiser.cells[i], this.x + side.x, this.y + side.y, this.rotation - 90);
        if(this.heat > 0){
          Draw.blend(Blending.additive);
          Draw.color(Color.valueOf("f08913"), this.heat);
          Draw.rect(hellRiser.cellHeats[i], this.x + side.x, this.y + side.y, this.rotation - 90);
          Draw.blend();
          Draw.color();
        };
      };
      
      //sw
      open.trns(this.rotation - 90, 0 - this._cellOpenAmount - this._cellSideAmount, -this._cellOpenAmount);
      Drawf.shadow(hellRiser.caps[0], this.x + open.x - (hellRiser.size / 2), this.y + open.y - (hellRiser.size / 2), this.rotation - 90);
      Draw.rect(hellRiser.caps[0], this.x + open.x, this.y + open.y, this.rotation - 90);
      
      //se
      open.trns(this.rotation - 90, 0 + this._cellOpenAmount + this._cellSideAmount, -this._cellOpenAmount);
      Drawf.shadow(hellRiser.caps[1], this.x + open.x - (hellRiser.size / 2), this.y + open.y - (hellRiser.size / 2), this.rotation - 90);
      Draw.rect(hellRiser.caps[1], this.x + open.x, this.y + open.y, this.rotation - 90);
      
      //nw
      open.trns(this.rotation - 90, 0 - this._cellOpenAmount - this._cellSideAmount, this._cellOpenAmount);
      Drawf.shadow(hellRiser.caps[2], this.x + open.x - (hellRiser.size / 2), this.y + open.y - (hellRiser.size / 2), this.rotation - 90);
      Draw.rect(hellRiser.caps[2], this.x + open.x, this.y + open.y, this.rotation - 90);
      
      //ne
      open.trns(this.rotation - 90, 0 + this._cellOpenAmount + this._cellSideAmount, this._cellOpenAmount);
      Drawf.shadow(hellRiser.caps[3], this.x + open.x - (hellRiser.size / 2), this.y + open.y - (hellRiser.size / 2), this.rotation - 90);
      Draw.rect(hellRiser.caps[3], this.x + open.x, this.y + open.y, this.rotation - 90);
    },
    setStats(){
      this.super$setStats();
      
      this.stats.remove(BlockStat.inaccuracy);
      this.stats.remove(BlockStat.shots);
      this.stats.add(BlockStat.shots, "The number of enemies in range (oh no)");
      this.stats.remove(BlockStat.damage);
      //damages every 5 ticks, at least in meltdown's case
      this.stats.add(BlockStat.damage, hellRiser.shootType.damage * 12, StatUnit.perSecond);
    },
    updateTile(){
      this.super$updateTile();
      
      if(this._bulletLife <= 0){
        this._cellOpenAmount = Mathf.lerpDelta(this._cellOpenAmount, 0, hellRiser.restitution);
        this._cellSideAmount = Mathf.lerpDelta(this._cellSideAmount, 0, hellRiser.restitution);
      };
      
      if(this._bulletLife > 0){
        this.heat = 1;
        this._cellOpenAmount = hellRiser.COA * 1 + (Mathf.absin(this._bulletLife / 3, 0.8, 1.5) / 3);
        this._cellSideAmount = hellRiser.SOA + (Mathf.absin(this._bulletLife / 3, 0.8, 1.5) * 2);
        this._bulletLife = this._bulletLife - Time.delta;
      };
    },
    updateShooting(){
      if(this._bulletLife > 0){
        return;
      };
      
      if(this.reload >= hellRiser.reloadTime){
        var type = this.peekAmmo();
        
        this.shoot(type);
        
        this.reload = 0;
        this._bulletLife = hellRiser.shootDuration;
      }else{
        this.reload += this.delta() * this.baseReloadSpeed();
      };
    },
    shoot(type){
      Units.nearbyEnemies(this.team, this.x - hellRiser.range, this.y - hellRiser.range, hellRiser.range * 2, hellRiser.range * 2, e => {
				if(Mathf.within(this.x, this.y, e.x, e.y, hellRiser.range) && !e.dead){
            hellRiser.shootType.create(this, this.team, e.x, e.y, 0, 1, 1);
        };
      });
      
      //I am once again stealing End Game code for this.
      collidedBlocks.clear();
      var tx = Vars.world.toTile(this.x);
      var ty = Vars.world.toTile(this.y);
      
      var tileRange = Mathf.floorPositive(hellRiser.range / Vars.tilesize + 1);
      
      for(var x = -tileRange + tx; x <= tileRange + tx; x++){
        yGroup:
        for(var y = -tileRange + ty; y <= tileRange + ty; y++){
          if(!Mathf.within(x * Vars.tilesize, y * Vars.tilesize, this.x, this.y, hellRiser.range)) continue yGroup;
          var other = Vars.world.build(x, y);
          if(other == null) continue yGroup;
          if(!collidedBlocks.contains(other.pos())){
            if(other.team != this.team && !other.dead){
              hellRiser.shootType.create(this, this.team, other.x, other.y, 0, 1, 1);
            };
            collidedBlocks.add(other.pos());
          };
        };
      };
    },
    shouldTurn(){
      return false;
    },
    shouldActiveSound(){
      return this._bulletLife > 0;
    }
	});
	hellEntity.setEff();
	return hellEntity;
};