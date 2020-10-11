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

const hellRiser = extend(BasicBulletType, {
  update(b){
    if(b != null){
      if(b.timer.get(1, 5)){
        Damage.damage(b.getTeam(), b.x, b.y, burnRadius, this.damage, true);
      }
      
      Puddle.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.slag, 10000);
      Puddle.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.oil, 9000);
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
          var baseLen = (length + (Mathf.absin(Time.time()/((i+1)*2) + b.id, 0.8, 1.5)*(length/1.5))) * b.fout();
          Tmp.v1.trns(90, (pullscales[i] - 1.0) * 55.0);
          Lines.stroke(4 * strokes[s] * tscales[i]);
          Lines.lineAngle(b.x, b.y, 90, baseLen * b.fout() * lenscales[i], CapStyle.none);
        }
      }
      Draw.blend();
      Draw.color();
      Draw.reset();
    }
  }
});
const burnDuration = 30;

hellRiser.speed = 0.000000001;
hellRiser.damage = 62.5;
hellRiser.lifetime = burnDuration;
hellRiser.collides = false;
hellRiser.collidesTiles = false;
hellRiser.hitEffect = Fx.fireballsmoke;
hellRiser.despawnEffect = Fx.none;
hellRiser.shootEffect = Fx.none;
hellRiser.smokeEffect = Fx.none;

//Got some help from EoD for the turning LaserTurret into PowerTurret part
const burningHell = extendContent(PowerTurret, "eruptor-iii", {
  load(){
    this.super$load();
    this.caps = [];
    this.sides = [];
    this.cells = [];
    this.cellHeats = [];
    this.outlines = [];
    
    //this.baseRegion = Core.atlas.find("block-4");
    
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
      Core.atlas.find("definitely-not-advance-content-eruptor-iii-icon")
    ];
  }
});

burningHell.shootType = hellRiser;
burningHell.shootDuration = burnDuration;
burningHell.range = 200;
burningHell.shootCone = 360;
burningHell.rotationSpeed = 0;
burningHell.COA = 0.9;
burningHell.SOA = 3;
burningHell.firingMoveFract = 0.8;
burningHell.shootEffect = Fx.none;
burningHell.smokeEffect = Fx.none;
burningHell.ammoUseEffect = Fx.none;
burningHell.restitution = 0.01;

burningHell.buildType = () => {
	var hellEntity = extendContent(PowerTurret.PowerTurretBuild, burningHell, {
    
    setBulletLife(a){
      this._BulletLife = a;
    },
		
    getBulletLife(){
      return this._BulletLife;
    },
    
    setCellOpenAmount(a){
      this._cellOpenAmount = a;
    },
		
    getCellOpenAmount(){
      return this._cellOpenAmount;
    },
    
    setSideOpenAmount(a){
      this._cellSideAmount = a;
    },
		
    getSideOpenAmount(){
      return this._cellSideAmount;
    },
    draw(){
      Draw.rect(burningHell.baseRegion, this.x, this.y, 0);
      
      Draw.z(Layer.turret);
      
      for(var i = 0; i < 2; i++){
        side.trns(this.rotation-90, this.getSideOpenAmount() * ((i-0.5)*2), 0);
        Drawf.shadow(burningHell.outlines[i], this.x, this.y, this.rotation-90);
        Draw.rect(burningHell.outlines[i], this.x + side.x, this.y + side.y, this.rotation-90);
      }
      
      Drawf.shadow(burningHell.bottomRegion, this.x, this.y, this.rotation-90);
      Draw.rect(burningHell.bottomRegion, this.x, this.y, this.rotation-90);
      
      //inside big cell
      Draw.rect(burningHell.cells[2], this.x, this.y, this.rotation-90);
      if(this.heat > 0){
        Draw.blend(Blending.additive);
        Draw.color(Color.valueOf("ffbe73"), this.heat);
        Draw.rect(burningHell.cellHeats[2], this.x + Mathf.range(1 * this.heat), this.y + Mathf.range(1 * this.heat), this.rotation-90);
        Draw.blend();
        Draw.color();
      }
      
      //sides and cells
      for(var i = 0; i < 2; i ++){
        side.trns(this.rotation-90, this.getSideOpenAmount() * ((i-0.5)*2), 0);
        Drawf.shadow(burningHell.sides[i], this.x + side.x, this.y + side.y, this.rotation-90);
        Draw.rect(burningHell.sides[i], this.x + side.x, this.y + side.y, this.rotation-90);
        
        Drawf.shadow(burningHell.cells[i], this.x + side.x, this.y + side.y, this.rotation-90);
        Draw.rect(burningHell.cells[i], this.x + side.x, this.y + side.y, this.rotation-90);
        if(this.heat > 0){
          Draw.blend(Blending.additive);
          Draw.color(Color.valueOf("f08913"), this.heat);
          Draw.rect(burningHell.cellHeats[i], this.x + side.x, this.y + side.y, this.rotation-90);
          Draw.blend();
          Draw.color();
        }
      }
      
      //sw
      open.trns(this.rotation-90, 0 - this.getCellOpenAmount() - this.getSideOpenAmount(), -this.getCellOpenAmount());
      Drawf.shadow(burningHell.caps[0], this.x + open.x, this.y + open.y, this.rotation-90);
      Draw.rect(burningHell.caps[0], this.x + open.x, this.y + open.y, this.rotation-90);
      
      //se
      open.trns(this.rotation-90, 0 + this.getCellOpenAmount() + this.getSideOpenAmount(), -this.getCellOpenAmount());
      Drawf.shadow(burningHell.caps[1], this.x + open.x, this.y + open.y, this.rotation-90);
      Draw.rect(burningHell.caps[1], this.x + open.x, this.y + open.y, this.rotation-90);
      
      //nw
      open.trns(this.rotation-90, 0 - this.getCellOpenAmount() - this.getSideOpenAmount(), this.getCellOpenAmount());
      Drawf.shadow(burningHell.caps[2], this.x + open.x, this.y + open.y, this.rotation-90);
      Draw.rect(burningHell.caps[2], this.x + open.x, this.y + open.y, this.rotation-90);
      
      //ne
      open.trns(this.rotation-90, 0 + this.getCellOpenAmount() + this.getSideOpenAmount(), this.getCellOpenAmount());
      Drawf.shadow(burningHell.caps[3], this.x + open.x, this.y + open.y, this.rotation-90);
      Draw.rect(burningHell.caps[3], this.x + open.x, this.y + open.y, this.rotation-90);
    },
    setStats(){
      this.super$setStats();
      
      this.stats.remove(BlockStat.inaccuracy);
      this.stats.remove(BlockStat.shots);
      this.stats.add(BlockStat.shots, "The number of enemies in range (oh no)");
      this.stats.remove(BlockStat.damage);
      //damages every 5 ticks, at least in meltdown's case
      this.stats.add(BlockStat.damage, tile.bc().shootType.damage * 12, StatUnit.perSecond);
    },
    updateTile(){
      this.super$updateTile();
      
      if(this.getBulletLife() <= 0){
        this.setCellOpenAmount(Mathf.lerpDelta(this.getCellOpenAmount(), 0, this.block.restitution));
        this.setSideOpenAmount(Mathf.lerpDelta(this.getSideOpenAmount(), 0, this.block.restitution));
      }
      
      if(this.getBulletLife() > 0){
        this.heat = 1;
        this.setCellOpenAmount(this.COA * 1+(Mathf.absin(this.getBulletLife()/3, 0.8, 1.5)/3));
        this.setSideOpenAmount(this.SOA + (Mathf.absin(this.getBulletLife()/3, 0.8, 1.5)*2));
      }
    },
    updateShooting(){
      if(this.getBulletLife() > 0){
        return;
      };
      
      if(this.reload >= this.block.reloadTime){
        var type = this.peekAmmo();
        
        this.shoot(type);
        
        this.reload = 0;
        this.setBulletLife(this.shootDuration);
      }
      else{
        this.reload += this.delta() * this.baseReloadSpeed();
      }
    },
    shoot(type){
      Units.nearbyEnemies(this.team(), this.x - this.block.range, this.y - this.block.range, this.block.range*2, this.block.range*2, cons(unit => {
        if(unit.withinDst(this.x, this.y, this.block.range)){
          if(!unit.isDead() && unit instanceof HealthTrait){
            this.block.shootType.create(this, this.getTeam(), other.x, other.y, 0, 1, 1);
          }
        }
      }));
      
      //reset oofed
      /*var oofed = [];
      for(a = 0; a < 360; a++){
        for(l = this.block.range/8; l > 0; l--){
          rangeloc.trns(a, 0, l);
          if(Vars.world.ltile(this.x + rangeloc.x, this.y + rangeloc.y) != null){
            other = Vars.world.ltile(this.x + rangeloc.x, this.y + rangeloc.y);
            
            if(other.getTeam() != this.getTeam() && other.ent() != null && oofed.indexOf(other) == -1){
              this.block.shootType.create(this, this.getTeam(), other.x, other.y, 0, 1, 1);
              //add to oofed so the same thing doesn't get oofed twice.
              oofed.push(other);
            }
          }
        }*/
      Vars.indexer.eachBlock(!this.team(), this.block.range/8, other => other.isValid(), other => {
        this.block.shootType.create(this, this.getTeam(), other.x, other.y, 0, 1, 1);
      });
    },
    shouldTurn(){
      return false;
    },
    shouldActiveSound(){
      return this.getBulletLife() > 0;
    }
	});
	
	hellEntity.setBulletLife(0);
  hellEntity.setCellOpenAmount(0);
  hellEntity.setSideOpenAmount(0);
	
	return hellEntity;
};