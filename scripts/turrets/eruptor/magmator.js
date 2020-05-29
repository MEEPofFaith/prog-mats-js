const open = new Vec2();
const back = new Vec2();

//Got some help from EoD for the turning LaserTurret into PowerTurret part
const allStatsUpPlsGetTheReference = extendContent(PowerTurret, "eruptor-ii", {
  load(){
    this.super$load();
    
    for(i = 0; i < 2; i++){
      this.cells[i] = Core.atlas.find(this.name + "-cells-" + i);
      this.cellHeats[i] = Core.atlas.find(this.name + "-cells-heat-" + i);
    }
    for(i = 0; i < 4; i++){
      this.capsA[i] = Core.atlas.find(this.name + "-caps-0-" + i);
      this.capsB[i] = Core.atlas.find(this.name + "-caps-1-" + i);
    }
  },
  drawLayer(tile){
    this.super$drawLayer(tile);
    entity = tile.ent();
    
    back.trns(entity.rotation-90, 0, 0);
    
    //Bottom Layer Cells
    Draw.rect(this.cells[0], entity.x + back.x, entity.y + back.y, entity.rotation-90);
    
    if(entity.heat > 0){
      Draw.blend(Blending.additive);
      Draw.color(Color.valueOf("f08913"), entity.heat);
      Draw.rect(this.cellHeats[0], entity.x + back.x, entity.y + back.y, entity.rotation-90);
      Draw.blend();
      Draw.color();
    }
    
    //sw
    open.trns(entity.rotation-90, 0 - entity.getCellOpenAmount(), -entity.getCellOpenAmount());
    Draw.rect(this.capsA[0], entity.x + open.x, entity.y + open.y, entity.rotation-90);
    
    //se
    open.trns(entity.rotation-90, 0 + entity.getCellOpenAmount(), -entity.getCellOpenAmount());
    Draw.rect(this.capsA[1], entity.x + open.x, entity.y + open.y, entity.rotation-90);
    
    //nw
    open.trns(entity.rotation-90, 0 - entity.getCellOpenAmount(), entity.getCellOpenAmount());
    Draw.rect(this.capsA[2], entity.x + open.x, entity.y + open.y, entity.rotation-90);
    
    //nw
    open.trns(entity.rotation-90, 0 + entity.getCellOpenAmount(), entity.getCellOpenAmount());
    Draw.rect(this.capsA[3], entity.x + open.x, entity.y + open.y, entity.rotation-90);
    
    
    //Top Layer Cells
    Draw.rect(this.cells[1], entity.x + back.x, entity.y + back.y, entity.rotation-90);
    
    if(entity.heat > 0){
      Draw.blend(Blending.additive);
      Draw.color(Color.valueOf("f08913"), entity.heat);
      Draw.rect(this.cellHeats[1], entity.x + back.x, entity.y + back.y, entity.rotation-90);
      Draw.blend();
      Draw.color();
    }
    
    //sw
    open.trns(entity.rotation-90, 0 - entity.getCellOpenAmount(), -entity.getCellOpenAmount());
    Draw.rect(this.capsB[0], entity.x + open.x, entity.y + open.y, entity.rotation-90);
    
    //se
    open.trns(entity.rotation-90, 0 + entity.getCellOpenAmount(), -entity.getCellOpenAmount());
    Draw.rect(this.capsB[1], entity.x + open.x, entity.y + open.y, entity.rotation-90);
    
    //nw
    open.trns(entity.rotation-90, 0 - entity.getCellOpenAmount(), entity.getCellOpenAmount());
    Draw.rect(this.capsB[2], entity.x + open.x, entity.y + open.y, entity.rotation-90);
    
    //nw
    open.trns(entity.rotation-90, 0 + entity.getCellOpenAmount(), entity.getCellOpenAmount());
    Draw.rect(this.capsB[3], entity.x + open.x, entity.y + open.y, entity.rotation-90);
  },
  generateIcons(){
    return [
			Core.atlas.find("block-4"),
			Core.atlas.find("definitely-not-advance-content-eruptor-ii-icon")
		];
  },
  setStats(){
    this.super$setStats();
    
    this.stats.remove(BlockStat.damage);
    this.stats.add(BlockStat.damage, this.shootType.damage * 60 / 5, StatUnit.perSecond);
  },
  update(tile){
    this.super$update(tile);
		
		entity = tile.ent();
		
    if(entity.getBulletLife() <= 0 && entity.getBullet() == null){
      entity.setCellOpenAmount(Mathf.lerpDelta(entity.getCellOpenAmount(), 0, this.restitution));
    }
    
		if(entity.getBulletLife() > 0 && entity.getBullet() != null){
			var entBullet = entity.getBullet();
      
      if(entity.getBulletLife() >= this.shootDuration){
        entBullet.set(tile.entity.target.getX(), tile.entity.target.getY());
      }
			
			this.tr.trns(entity.rotation, this.size * Vars.tilesize / 2, 0);
			entBullet.time(0);
			entity.heat = 1;
			entity.setCellOpenAmount(this.COA * 1+(Mathf.absin(entity.getBulletLife()/3, 0.8, 1.5)/3));
			entity.setBulletLife(entity.getBulletLife() - Time.delta());
			if(entity.getBulletLife() <= 0){
				entity.setBullet(null);
			}
		}
  },
	updateShooting(tile){
		entity = tile.ent();
		
		if(entity.getBulletLife() > 0 && entity.getBullet() != null){
			return;
		};
		
		if(entity.reload >= this.reload){
			type = this.peekAmmo(tile);
			
			this.shoot(tile, type);
			
			entity.reload = 0;
		}
    else{
			liquid = entity.liquids.current();
			maxUsed = this.consumes.get(ConsumeType.liquid).amount;
			
			used = this.baseReloadSpeed(tile) * (tile.isEnemyCheat() ? maxUsed : Math.min(entity.liquids.get(liquid), maxUsed * Time.delta())) * liquid.heatCapacity * this.coolantMultiplier;
			entity.reload += Math.max(used, 1 * Time.delta()) * entity.power.status;
			entity.liquids.remove(liquid, used);
			
			if(Mathf.chance(0.06 * used)){
				Effects.effect(this.coolEffect, tile.drawx() + Mathf.range(this.size * Vars.tilesize / 2), tile.drawy() + Mathf.range(this.size * Vars.tilesize / 2));
			}
		}
	},
  bullet(tile, type, angle){
		entity = tile.ent();
		bullet = Bullet.create(type, entity, tile.getTeam(), tile.drawx() + this.tr.x, tile.drawy() + this.tr.y, angle);
		
		entity.setBullet(bullet);
		entity.setBulletLife(this.shootDuration);
	},
	turnToTarget(tile, targetRot){
		entity = tile.ent();

		entity.rotation = Angles.moveToward(entity.rotation, targetRot, this.rotatespeed * entity.delta() * (entity.getBulletLife() > 0 ? this.firingMoveFract : 1));
	},
	shouldActiveSound(tile){
		entity = tile.ent();

		return entity.getBulletLife() > 0 && entity.getBullet() != null;
	}
});
const burnRadius = 36;

allStatsUpPlsGetTheReference.shootDuration = 240;
allStatsUpPlsGetTheReference.COA = 1.5;
allStatsUpPlsGetTheReference.firingMoveFract = 0.8;
allStatsUpPlsGetTheReference.shootEffect = Fx.none;
allStatsUpPlsGetTheReference.smokeEffect = Fx.none;
allStatsUpPlsGetTheReference.ammoUseEffect = Fx.none;
allStatsUpPlsGetTheReference.restitution = 0.01;

allStatsUpPlsGetTheReference.cells = [];
allStatsUpPlsGetTheReference.cellHeats = [];
allStatsUpPlsGetTheReference.capsA = [];
allStatsUpPlsGetTheReference.capsB = [];

allStatsUpPlsGetTheReference.entityType = prov(() => {
	entity = extend(Turret.TurretEntity, {
		setBullet(a){
			this._bullet = a;
		},
		
		getBullet(){
			return this._bullet;
		},
		
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
    }
	});
	
	entity.setBullet(null);
	entity.setBulletLife(0);
  entity.setCellOpenAmount(0);
	
	return entity;
});

//Editable stuff for custom laser.
//4 colors from outside in. Normal meltdown laser has trasnparrency 55 -> aa -> ff (no transparrency) -> ff(no transparrency)
var colors = [Color.valueOf("a3570055"), Color.valueOf("bf6804aa"), Color.valueOf("db7909"), Color.valueOf("f08913")];
var length = 32;

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

allStatsUpPlsGetTheReference.shootType = extend(BasicBulletType, {
  update(b){
    if(b != null){
      if(b.getOwner().target != null){
        var target = Angles.angle(b.x, b.y, b.getOwner().target.getX(), b.getOwner().target.getY());
        b.rot(Mathf.slerpDelta(b.rot(), target, 0.15));
      }
      
      if(b.timer.get(1, 5)){
        Damage.damage(b.getTeam(), b.x, b.y, burnRadius*2, this.damage, true);
      }
      
      Puddle.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.slag, 10000);
      Puddle.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.oil, 1000);
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
        Draw.color(tmpColor.set(colors[s]).mul(1.0 + Mathf.absin(Time.time(), 1.0, 0.3)));
        Draw.alpha(b.fout());
        for(var i = 0; i < 4; i++){
          var baseLen = (length + (Mathf.absin(b.getOwner().getBulletLife()/((i+1)*2.5), 0.8, 1.5)*(length/1.5))) * b.fout();
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

allStatsUpPlsGetTheReference.shootType.speed = 2;
allStatsUpPlsGetTheReference.shootType.lifetime = 16;
allStatsUpPlsGetTheReference.shootType.damage = 75;
allStatsUpPlsGetTheReference.shootType.collides = false;
allStatsUpPlsGetTheReference.shootType.collidesTiles = false;
allStatsUpPlsGetTheReference.shootType.hitEffect = Fx.fireballsmoke;
allStatsUpPlsGetTheReference.shootType.despawnEffect = Fx.none;
allStatsUpPlsGetTheReference.shootType.shootEffect = Fx.none;
allStatsUpPlsGetTheReference.shootType.smokeEffect = Fx.none;