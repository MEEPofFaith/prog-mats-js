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
      if(b.owner.target != null){
        var target = Angles.angle(b.x, b.y, b.owner.targetPos.x, b.owner.targetPos.y);
        b.rotation(Mathf.slerpDelta(b.rotation(), target, 0.15));
      };
      
      if(b.timer.get(1, 5)){
        Damage.damage(b.team, b.x, b.y, burnRadius, this.damage, true);
      };
      
      Puddles.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.slag, 20000);
      Puddles.deposit(Vars.world.tileWorld(b.x, b.y), Liquids.oil, 19000);
    };
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
          var baseLen = (length + (Mathf.absin(b.owner._bulletLife / ((i + 1) * 2) + b.id, 0.8, 1.5) * (length / 1.5))) * b.fout();
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

lavaPool.speed = 1;
lavaPool.damage = 50;
lavaPool.lifetime = 16;
lavaPool.collides = false;
lavaPool.collidesTiles = false;
lavaPool.hitEffect = Fx.fireballsmoke;
lavaPool.despawnEffect = Fx.none;
lavaPool.shootEffect = Fx.none;
lavaPool.smokeEffect = Fx.none;
lavaPool.hittable = false;

//Got some help from EoD for the turning LaserTurret into PowerTurret part
const heatRiser = extendContent(PowerTurret, "eruptor-i", {
  load(){
    this.super$load();
    this.caps = [];
    
    this.cells = Core.atlas.find(this.name + "-cells");
    this.cellHeat = Core.atlas.find(this.name + "-cells-heat");
    for(var i = 0; i < 4; i++){
      this.caps[i] = Core.atlas.find(this.name + "-caps-" + i);
    }
  }
});

heatRiser.shootType = lavaPool;
heatRiser.shootDuration = 180;
heatRiser.range = 240;
heatRiser.reloadTime = 60;
heatRiser.COA = 0.9;
heatRiser.rotateSpeed = 3;
heatRiser.firingMoveFract = 0.8;
heatRiser.shootEffect = Fx.none;
heatRiser.smokeEffect = Fx.none;
heatRiser.ammoUseEffect = Fx.none;
heatRiser.restitution = 0.01;

heatRiser.buildType = () => {
	var eruptEntity = extendContent(PowerTurret.PowerTurretBuild, heatRiser, {
    setEff(){
      this._bullet = null;
      this._bulletLife = 0;
      this._cellOpenAmount = 0;
    },
    draw(){
      const open = new Vec2();
      const back = new Vec2();
      
      Draw.rect(heatRiser.baseRegion, this.x, this.y, 0);
      
      Draw.z(Layer.turret);
      
      back.trns(this.rotation - 90, 0, -this.recoil);
      
      Drawf.shadow(heatRiser.region, this.x + back.x - (heatRiser.size / 2), this.y + back.y - (heatRiser.size / 2), this.rotation - 90);
      Draw.rect(heatRiser.region, this.x + back.x, this.y + back.y, this.rotation - 90);
      
      Drawf.shadow(heatRiser.cells, this.x + back.x - (heatRiser.size / 2), this.y + back.y - (heatRiser.size / 2), this.rotation - 90);
      Draw.rect(heatRiser.cells, this.x + back.x, this.y + back.y, this.rotation - 90);
      
      if(this.heat > 0.00001){
        Draw.blend(Blending.additive);
        Draw.color(Color.valueOf("f08913"), this.heat);
        Draw.rect(heatRiser.cellHeat, this.x + back.x, this.y + back.y, this.rotation - 90);
        Draw.blend();
        Draw.color();
      };
      
      //sw
      open.trns(this.rotation - 90, 0 - this._cellOpenAmount, -this._cellOpenAmount);
      Drawf.shadow(heatRiser.caps[0], this.x + open.x - (heatRiser.size / 2), this.y + open.y - (heatRiser.size / 2), this.rotation - 90);
      Draw.rect(heatRiser.caps[0], this.x + open.x, this.y + open.y, this.rotation - 90);
      
      //se
      open.trns(this.rotation - 90, 0 + this._cellOpenAmount, -this._cellOpenAmount);
      Drawf.shadow(heatRiser.caps[1], this.x + open.x - (heatRiser.size / 2), this.y + open.y - (heatRiser.size / 2), this.rotation - 90);
      Draw.rect(heatRiser.caps[1], this.x + open.x, this.y + open.y, this.rotation - 90);
      
      //nw
      open.trns(this.rotation - 90, 0 - this._cellOpenAmount, this._cellOpenAmount);
      Drawf.shadow(heatRiser.caps[2], this.x + open.x - (heatRiser.size / 2), this.y + open.y - (heatRiser.size / 2), this.rotation - 90);
      Draw.rect(heatRiser.caps[2], this.x + open.x, this.y + open.y, this.rotation - 90);
      
      //nw
      open.trns(this.rotation - 90, 0 + this._cellOpenAmount, this._cellOpenAmount);
      Drawf.shadow(heatRiser.caps[3], this.x + open.x - (heatRiser.size / 2), this.y + open.y - (heatRiser.size / 2), this.rotation - 90);
      Draw.rect(heatRiser.caps[3], this.x + open.x, this.y + open.y, this.rotation - 90);
    },
    setStats(){
      this.super$setStats();
      
      this.stats.remove(BlockStat.inaccuracy);
      this.stats.remove(BlockStat.damage);
      //damages every 5 ticks
      this.stats.add(BlockStat.damage, heatRiser.shootType.damage * 60 / 5, StatUnit.perSecond);
    },
    updateTile(){
      this.super$updateTile();
      
      if(this._bulletLife <= 0 && this._bullet == null){
        this._cellOpenAmount = Mathf.lerpDelta(this._cellOpenAmount, 0, heatRiser.restitution);
      };
      
      if(this._bulletLife > 0 && this._bullet != null){
        this._bullet.time = 0;
        this.heat = 1;
        this.recoil = heatRiser.recoilAmount;
        this._cellOpenAmount = heatRiser.COA * 1 + (Mathf.absin(this._bulletLife / 3, 0.8, 1.5) / 3);
        this._bulletLife = this._bulletLife - Time.delta;
        if(this._bulletLife <= 0){
          this._bullet = null;
        };
      };
    },
    updateShooting(){
      if(this._bulletLife > 0 && this._bullet != null){
        return;
      };
      
      if(this.reload >= heatRiser.reloadTime){
        var type = this.peekAmmo();
        
        this.shoot(type);
        
        this.reload = 0;
        this._bulletLife = heatRiser.shootDuration;
      }else{
        this.reload += this.delta() * this.baseReloadSpeed();
      };
    },
    bullet(type, angle){
      const bullet = type.create(this, this.team, this.targetPos.x, this.targetPos.y, angle);
      
      this._bullet = bullet;
    },
    turnToTarget(targetRot){
      this.rotation = Angles.moveToward(this.rotation, targetRot, this.efficiency() * heatRiser.rotateSpeed * this.delta() * (this._bulletLife > 0 ? heatRiser.firingMoveFract : 1));
    },
    shouldActiveSound(){
      return this._bulletLife > 0 && this._bullet != null;
    }
	});
	eruptEntity.setEff();
	return eruptEntity;
};