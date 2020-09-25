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
        for(i = 0; i < 4; i++){
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
const oofDuration = 30;

hellPool.speed = 0.000000001;
hellPool.damage = 62.5;
hellPool.lifetime = oofDuration;
hellPool.collides = false;
hellPool.collidesTiles = false;
hellPool.hitEffect = Fx.fireballsmoke;
hellPool.despawnEffect = Fx.none;
hellPool.shootEffect = Fx.none;
hellPool.smokeEffect = Fx.none;

//Got some help from EoD for the turning LaserTurret into PowerTurret part
const burningHell = extendContent(PowerTurret, "eruptor-iii", {});

burningHell.shootType = hellPool;
burningHell.shootDuration = oofDuration;
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

burningHell.caps = [];
burningHell.sides = [];
burningHell.cells = [];
burningHell.cellHeats = [];
burningHell.outlines = [];

burningHell.buildType = () => {
	var hellEntity = extendContent(PowerTurret.PowerTurretEntity, burningHell, {
		setBulletLife(a){
			this._bulletlife = a;
		},
    
		getBulletLife(){
			return this._bulletlife;
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
    
    load(){
      this.baseRegion = Core.atlas.find("block-4");
      this.bottomRegion = Core.atlas.find(this.name + "-bottom");
      for(i = 0; i < 2; i++){
        this.sides[i] = Core.atlas.find(this.name + "-sides-" + i);
        this.outlines[i] = Core.atlas.find(this.name + "-outline-" + i);
      }
      for(i = 0; i < 3; i++){
        this.cells[i] = Core.atlas.find(this.name + "-cells-" + i);
        this.cellHeats[i] = Core.atlas.find(this.name + "-cells-heat-" + i);
      }
      for(i = 0; i < 4; i++){
        this.caps[i] = Core.atlas.find(this.name + "-caps-" + i);
      }
    },
    drawLayer(tile){
      const entity = tile.ent();
      
      for(i = 0; i < 2; i++){
        side.trns(entity.rotation-90, entity.getSideOpenAmount() * ((i-0.5)*2), 0);
        Draw.rect(this.outlines[i], entity.x + side.x, entity.y + side.y, entity.rotation-90);
      }
      
      Draw.rect(this.bottomRegion, entity.x, entity.y, entity.rotation-90);
      
      //inside big cell
      Draw.rect(this.cells[2], entity.x, entity.y, entity.rotation-90);
      if(entity.heat > 0){
        Draw.blend(Blending.additive);
        Draw.color(Color.valueOf("ffbe73"), entity.heat);
        Draw.rect(this.cellHeats[2], entity.x + Mathf.range(1 * entity.heat), entity.y + Mathf.range(1 * entity.heat), entity.rotation-90);
        Draw.blend();
        Draw.color();
      }
      
      //sides and cells
      for(i = 0; i < 2; i ++){
        side.trns(entity.rotation-90, entity.getSideOpenAmount() * ((i-0.5)*2), 0);
        Draw.rect(this.sides[i], entity.x + side.x, entity.y + side.y, entity.rotation-90);
        Draw.rect(this.cells[i], entity.x + side.x, entity.y + side.y, entity.rotation-90);
        if(entity.heat > 0){
          Draw.blend(Blending.additive);
          Draw.color(Color.valueOf("f08913"), entity.heat);
          Draw.rect(this.cellHeats[i], entity.x + side.x, entity.y + side.y, entity.rotation-90);
          Draw.blend();
          Draw.color();
        }
      }
      
      //sw
      open.trns(entity.rotation-90, 0 - entity.getCellOpenAmount() - entity.getSideOpenAmount(), -entity.getCellOpenAmount());
      Draw.rect(this.caps[0], entity.x + open.x, entity.y + open.y, entity.rotation-90);
      
      //se
      open.trns(entity.rotation-90, 0 + entity.getCellOpenAmount() + entity.getSideOpenAmount(), -entity.getCellOpenAmount());
      Draw.rect(this.caps[1], entity.x + open.x, entity.y + open.y, entity.rotation-90);
      
      //nw
      open.trns(entity.rotation-90, 0 - entity.getCellOpenAmount() - entity.getSideOpenAmount(), entity.getCellOpenAmount());
      Draw.rect(this.caps[2], entity.x + open.x, entity.y + open.y, entity.rotation-90);
      
      //ne
      open.trns(entity.rotation-90, 0 + entity.getCellOpenAmount() + entity.getSideOpenAmount(), entity.getCellOpenAmount());
      Draw.rect(this.caps[3], entity.x + open.x, entity.y + open.y, entity.rotation-90);
    },
    icons(){
      return [
        Core.atlas.find("block-4"),
        Core.atlas.find("definitely-not-advance-content-eruptor-iii-icon")
      ];
    },
    setStats(){
      this.super$setStats();
      
      this.stats.remove(BlockStat.inaccuracy);
      this.stats.remove(BlockStat.shots);
      this.stats.add(BlockStat.shots, "The number of enemies in range (oh no)");
      this.stats.remove(BlockStat.damage);
      //damages every 5 ticks, at least in meltdown's case
      this.stats.add(BlockStat.damage, this.shootType.damage * 60 / 5, StatUnit.perSecond);
    },
    update(tile){
      this.super$update(tile);
      
      const entity = tile.ent();
      
      if(entity.getBulletLife() <= 0){
        entity.setCellOpenAmount(Mathf.lerpDelta(entity.getCellOpenAmount(), 0, this.restitution));
        entity.setSideOpenAmount(Mathf.lerpDelta(entity.getSideOpenAmount(), 0, this.restitution));
      }
      
      if(entity.getBulletLife() > 0){
        entity.heat = 1;
        entity.setCellOpenAmount(this.COA * 1+(Mathf.absin(entity.getBulletLife()/3, 0.8, 1.5)/3));
        entity.setSideOpenAmount(this.SOA + (Mathf.absin(entity.getBulletLife()/3, 0.8, 1.5)*2));
        entity.setBulletLife(entity.getBulletLife() - Time.delta());
      }
    },
    updateShooting(tile){
      const entity = tile.ent();
      
      if(entity.getBulletLife() > 0){
        return;
      };
      
      if(entity.reloadTime >= this.reloadTime){
        type = this.peekAmmo(tile);
        
        this.shoot(tile, type);
        
        entity.reloadTime = 0;
        entity.setBulletLife(this.shootDuration);
      }else{
        liquid = entity.liquids.current();
        maxUsed = this.consumes.get(ConsumeType.liquid).amount;
        
        used = this.basereloadTimeSpeed(tile) * (tile.isEnemyCheat() ? maxUsed : Math.min(entity.liquids.get(liquid), maxUsed * Time.delta())) * liquid.heatCapacity * this.coolantMultiplier;
        entity.reloadTime += Math.max(used, 1 * Time.delta()) * entity.power.status;
        entity.liquids.remove(liquid, used);
        
        if(Mathf.chance(0.06 * used)){
          this.coolEffect.at(tile.drawx() + Mathf.range(this.size * Vars.tilesize / 2), tile.drawy() + Mathf.range(this.size * Vars.tilesize / 2), 0);
        }
      }
    },
    shoot(tile, type){
      const entity = tile.ent();
      Units.nearbyEnemies(tile.getTeam(), tile.drawx() - this.range, tile.drawy() - this.range, this.range*2, this.range*2, cons(unit => {
        if(unit.withinDst(tile.drawx(), tile.drawy(), this.range)){
          if(!unit.isDead() && unit instanceof HealthTrait){
            Calls.createBullet(this.shootType, tile.getTeam(), unit.x, unit.y, 0, 1, 1);
          }
        }
      }));
      
      //reset oofed
      var oofed = [];
      for(a = 0; a < 360; a++){
        for(l = this.range/8; l > 0; l--){
          rangeloc.trns(a, 0, l);
          if(Vars.world.ltile(tile.x + rangeloc.x, tile.y + rangeloc.y) != null){
            other = Vars.world.ltile(tile.x + rangeloc.x, tile.y + rangeloc.y);
            
            if(other.getTeam() != tile.getTeam() && other.ent() != null && oofed.indexOf(other) == -1){
              Calls.createBullet(this.shootType, tile.getTeam(), other.drawx(), other.drawy(), 0, 1, 1);
              //add to oofed so the same thing doesn't get oofed twice.
              oofed.push(other);
            }
          }
        }
      }
    },
    shouldTurn(tile){
      return false;
    },
    shouldActiveSound(tile){
      const entity = tile.ent();

      return entity.getBulletLife() > 0;
    }
	});
	
	hellEntity.setBulletLife(0);
  hellEntity.setCellOpenAmount(0);
  hellEntity.setSideOpenAmount(0);
	
	return hellEntity;
};