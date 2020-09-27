const open = new Vec2();
const back = new Vec2();

//Editable stuff for custom laser.
//4 colors from outside in. Normal meltdown laser has trasnparrency 55 -> aa -> ff (no transparrency) -> ff(no transparrency)
var colors = [Color.valueOf("a3570055"), Color.valueOf("bf6804aa"), Color.valueOf("db7909"), Color.valueOf("f08913")];
var length = 16;
const burnRadius = 18;

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

const lavaPool = extend(BasicBulletType, {
  update(b){
    if(b != null){
      if(b.getOwner().target != null){
        var target = Angles.angle(b.x, b.y, b.getOwner().target.getX(), b.getOwner().target.getY());
        b.rot(Mathf.slerpDelta(b.rot(), target, 0.15));
      }
      
      if(b.timer.get(1, 5)){
        Damage.damage(b.getTeam(), b.x, b.y, burnRadius, this.damage, true);
      }
      
      Puddle.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.slag, 20000);
      Puddle.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.oil, 19000);
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

lavaPool.speed = 1;
lavaPool.damage = 50;
lavaPool.lifetime = 16;
lavaPool.collides = false;
lavaPool.collidesTiles = false;
lavaPool.hitEffect = Fx.fireballsmoke;
lavaPool.despawnEffect = Fx.none;
lavaPool.shootEffect = Fx.none;
lavaPool.smokeEffect = Fx.none;

//Got some help from EoD for the turning LaserTurret into PowerTurret part
const heatRiser = extendContent(PowerTurret, "eruptor-i", {
  load(){
    this.super$load();
    this.cells = Core.atlas.find(this.name + "-cells");
    this.cellHeat = Core.atlas.find(this.name + "-cells-heat");
    this.caps = [];
    for(var i = 0; i < 4; i++){
      this.caps.push(Core.atlas.find(this.name + "-caps-" + i));
    }
  },
  icons(){
    return [
      Core.atlas.find("block-3"),
      Core.atlas.find("definitely-not-advance-content-eruptor-i-icon")
    ];
  }
});

heatRiser.shootType = lavaPool;
heatRiser.shootDuration = 180;
heatRiser.COA = 0.9;
heatRiser.firingMoveFract = 0.8;
heatRiser.shootEffect = Fx.none;
heatRiser.smokeEffect = Fx.none;
heatRiser.ammoUseEffect = Fx.none;
heatRiser.restitution = 0.01;

heatRiser.buildType = () => {
	var eruptEntity = extendContent(PowerTurret.PowerTurretBuild, heatRiser, {
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
    },
    draw(){
      this.super$draw();
      back.trns(this.rotation-90, 0, 0);
      
      Draw.rect(this.cells, this.x + back.x, this.y + back.y, this.rotation-90);
      
      if(this.heat > 0.00001){
        Draw.blend(Blending.additive);
        Draw.color(Color.valueOf("f08913"), this.heat);
        Draw.rect(this.cellHeat, this.x + back.x, this.y + back.y, this.rotation-90);
        Draw.blend();
        Draw.color();
      }
      
      //sw
      open.trns(this.rotation-90, 0 - this.getCellOpenAmount(), -this.getCellOpenAmount());
      Draw.rect(this.caps[0], this.x + open.x, this.y + open.y, this.rotation-90);
      
      //se
      open.trns(this.rotation-90, 0 + this.getCellOpenAmount(), -this.getCellOpenAmount());
      Draw.rect(this.caps[1], this.x + open.x, this.y + open.y, this.rotation-90);
      
      //nw
      open.trns(this.rotation-90, 0 - this.getCellOpenAmount(), this.getCellOpenAmount());
      Draw.rect(this.caps[2], this.x + open.x, this.y + open.y, this.rotation-90);
      
      //nw
      open.trns(this.rotation-90, 0 + this.getCellOpenAmount(), this.getCellOpenAmount());
      Draw.rect(this.caps[3], this.x + open.x, this.y + open.y, this.rotation-90);
    },
    setStats(){
      this.super$setStats();
      
      this.stats.remove(BlockStat.inaccuracy);
      this.stats.remove(BlockStat.damage);
      //damages every 5 ticks
      this.stats.add(BlockStat.damage, tile.bc().shootType.damage * 60 / 5, StatUnit.perSecond);
    },
    updateTile(){
      this.super$updateTile();
      
      if(this.getBulletLife() <= 0 && this.getBullet() == null){
        this.setCellOpenAmount(Mathf.lerpDelta(this.getCellOpenAmount(), 0, this.block.restitution));
      }
      
      if(this.getBulletLife() > 0 && this.getBullet() != null){
        var entBullet = this.getBullet();
        
        if(this.getBulletLife() >= this.shootDuration){
          entBullet.set(tile.this.target.getX(), tile.this.target.getY());
        }
        
        this.tr.trns(this.rotation, this.block.size * Vars.tilesize / 2, 0);
        entBullet.time(0);
        this.heat = 1;
        this.setCellOpenAmount(this.COA * 1+(Mathf.absin(this.getBulletLife()/3, 0.8, 1.5)/3));
        this.setBulletLife(this.getBulletLife() - Time.delta());
        if(this.getBulletLife() <= 0){
          this.setBullet(null);
        }
      }
    },
    updateShooting(){
      if(this.getBulletLife() > 0 && this.getBullet() != null){
        return;
      };
      
      if(this.reload >= this.block.reloadTime){
        type = this.peekAmmo(tile);
        
        this.shoot(type);
        
        this.reloadTime = 0;
      }
      else{
        this.reload += this.delta() * this.baseReloadSpeed();
      }
    },
    bullet(type, angle){
      bullet = type.create(this, this.getTeam(), this.drawx() + this.tr.x, this.drawy() + this.tr.y, angle);
      
      this.setBullet(bullet);
      this.setBulletLife(this.shootDuration);
    },
    turnToTarget(targetRot){
      this.rotation = Angles.moveToward(this.rotation, targetRot, this.rotateSpeed * this.delta() * (this.getBulletLife() > 0 ? this.firingMoveFract : 1));
    },
    shouldActiveSound(){
      return this.getBulletLife() > 0 && this.getBullet() != null;
    }
	});
	
	eruptEntity.setBullet(null);
	eruptEntity.setBulletLife(0);
  eruptEntity.setCellOpenAmount(0);
	
	return eruptEntity;
};