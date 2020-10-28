//Editable stuff for custom laser.
//4 colors from outside in. Normal meltdown laser has trasnparrency 55 -> aa -> ff (no transparrency) -> ff(no transparrency)
var colors = [Color.valueOf("e69a2755"), Color.valueOf("eda332aa"), Color.valueOf("f2ac41"), Color.valueOf("ffbb54")];
var length = 16;
const burnRadius = 18;

//Stuff you probably shouldn't edit.
//Width of each section of the beam from thickest to thinnest
var tscales = [1, 0.7, 0.5, 0.2];
//Overall width of each color
var strokes = [burnRadius/2, burnRadius/2.5, burnRadius/3.3333, burnRadius/5];
//Determines how far back each section in the start should be pulled
var pullscales = [1, 1.12, 1.15, 1.17];
//Determines how far each section of the end should extend past the main thickest section
var lenscales = [1, 1.3, 1.6, 1.9];

var tmpColor = new Color();
const vec = new Vec2();
const lavaBack = new Vec2();

const lavaPool = extend(BasicBulletType, {
  update(b){
    if(b != null){
      if(b.owner.targetPos != null){
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
      //ring
      Draw.color(Color.valueOf("e3931b"));
      Draw.alpha(b.fout());
      Lines.stroke(2);
      Lines.circle(b.x, b.y, burnRadius);
      
      //"fountain" of lava
      for(var s = 0; s < 4; s++){
        Draw.color(tmpColor.set(colors[s]).mul(1.0 + Mathf.absin(Time.time() / 3 + Mathf.randomSeed(b.id), 1.0, 0.3) / 3));
        Draw.alpha(b.fout());
        Fill.circle(b.x, b.y, strokes[s] * 2);
        for(var i = 0; i < 4; i++){
          var baseLen = (length + (Mathf.absin(Time.time() / ((i + 1) * 2) + Mathf.randomSeed(b.id), 0.8, 1.5) * (length / 1.5))) * b.fout();
          lavaBack.trns(90, (pullscales[i] - 1.0) * 55.0);
          Lines.stroke(4 * strokes[s] * tscales[i]);
          Lines.lineAngle(b.x + lavaBack.x, b.y + lavaBack.y, 90, baseLen * b.fout() * lenscales[i], false);
        };
      };
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
    this.caps = [];
    this.outlines = [];
    
    this.baseRegion = Core.atlas.find("block-3");
    this.turretRegion = Core.atlas.find(this.name + "-turret");
    this.cells = Core.atlas.find(this.name + "-cells");
    this.cellHeat = Core.atlas.find(this.name + "-cells-heat");
    for(var i = 0; i < 4; i++){
      this.caps[i] = Core.atlas.find(this.name + "-caps-" + i);
    }
    for(var i = 0; i < 5; i++){
      this.outlines[i] = Core.atlas.find(this.name + "-outline-" + i);
    }
  },
  icons(){
    return [
      Core.atlas.find("block-3"),
      Core.atlas.find(this.name + "-icon")
    ];
  }
});

heatRiser.shootType = lavaPool;
heatRiser.shootDuration = 180;
heatRiser.range = 240;
heatRiser.reloadTime = 60;
heatRiser.recoilAmount = 2;
heatRiser.COA = 0.75;
heatRiser.cellHeight = 1;
heatRiser.rotateSpeed = 3;
heatRiser.firingMoveFract = 0.8;
heatRiser.shootEffect = Fx.none;
heatRiser.smokeEffect = Fx.none;
heatRiser.ammoUseEffect = Fx.none;
heatRiser.capClosing = 0.01;
heatRiser.heatColor = Color.valueOf("f08913");

heatRiser.buildType = () => {
	var eruptEntity = extendContent(PowerTurret.PowerTurretBuild, heatRiser, {
    setEff(){
      this._bullet = null;
      this._bulletLife = 0;
      this._cellOpenAmounts = [0, 0];
    },
    draw(){
      const open = new Vec2();
      const back = new Vec2();
      const trnsX = [-1, 1, -1, 1];
      const trnsY = [-1, -1, 1, 1];
      const alternate = [1, 1, 0, 0];
      
      Draw.rect(heatRiser.baseRegion, this.x, this.y, 0);
      
      Draw.z(Layer.turret);
      
      back.trns(this.rotation - 90, 0, -this.recoil);
      
      Draw.rect(heatRiser.outlines[0], this.x + back.x, this.y + back.y, this.rotation - 90);
      for(var i = 0; i < 4; i ++){
      open.trns(this.rotation - 90, 0 + (this._cellOpenAmounts[alternate[i]] * trnsX[i]), this._cellOpenAmounts[alternate[i]] * trnsY[i]);
        Draw.rect(heatRiser.outlines[i + 1], this.x + open.x + back.x, this.y + open.y + back.y, this.rotation - 90);
      }
      
      Drawf.shadow(heatRiser.turretRegion, this.x + back.x - (heatRiser.size / (1 + (1/3))), this.y + back.y - (heatRiser.size / (1 + (1/3))), this.rotation - 90);
      Draw.rect(heatRiser.turretRegion, this.x + back.x, this.y + back.y, this.rotation - 90);
      
      Drawf.shadow(heatRiser.cells, this.x + back.x - heatRiser.cellHeight, this.y + back.y - heatRiser.cellHeight, this.rotation - 90);
      
      for(var i = 0; i < 4; i ++){
      open.trns(this.rotation - 90, this._cellOpenAmounts[alternate[i]] * trnsX[i], this._cellOpenAmounts[alternate[i]] * trnsY[i]);
        Drawf.shadow(heatRiser.caps[i], this.x + open.x + back.x - heatRiser.cellHeight, this.y + open.y + back.y - heatRiser.cellHeight, this.rotation - 90);
      }
      
      Draw.rect(heatRiser.cells, this.x + back.x, this.y + back.y, this.rotation - 90);
      
      if(this.heat > 0.00001){
        Draw.blend(Blending.additive);
        Draw.color(heatRiser.heatColor, this.heat);
        Draw.rect(heatRiser.cellHeat, this.x + back.x, this.y + back.y, this.rotation - 90);
        Draw.blend();
        Draw.color();
      }
      
      for(var i = 0; i < 4; i ++){
      open.trns(this.rotation - 90, 0 + (this._cellOpenAmounts[alternate[i]] * trnsX[i]), this._cellOpenAmounts[alternate[i]] * trnsY[i]);
        Draw.rect(heatRiser.caps[i], this.x + open.x + back.x, this.y + open.y + back.y, this.rotation - 90);
      }
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
        for(var i = 0; i < 2; i ++){
          this._cellOpenAmounts[i] = Mathf.lerpDelta(this._cellOpenAmounts[i], 0, heatRiser.capClosing);
        }
      };
      
      if(this._bulletLife > 0 && this._bullet != null){
        this._bullet.time = 0;
        this.heat = 1;
        this.recoil = heatRiser.recoilAmount;
        this._cellOpenAmounts[0] = Mathf.lerpDelta(this._cellOpenAmounts[0], heatRiser.COA * Mathf.absin(this._bulletLife / 6 + Mathf.randomSeed(this._bullet.id), 0.8, 1), 0.6);
        this._cellOpenAmounts[1] = Mathf.lerpDelta(this._cellOpenAmounts[1], heatRiser.COA * Mathf.absin(-this._bulletLife / 6 + Mathf.randomSeed(this._bullet.id), 0.8, 1), 0.6);
        this._bulletLife = this._bulletLife - Time.delta;
        this.rotation = Mathf.lerpDelta(this.rotation, Angles.angle(this.x, this.y, this._bullet.x, this._bullet.y), 0.7);
        if(this._bulletLife <= 0){
          this._bullet = null;
        }
      }
    },
    updateShooting(){
      if(this._bulletLife > 0 && this._bullet != null){
        return;
      }
      
      if(this.reload >= heatRiser.reloadTime){
        var type = this.peekAmmo();
        
        this.shoot(type);
        
        this.reload = 0;
        this._bulletLife = heatRiser.shootDuration;
      }else{
        this.reload += this.delta() * this.baseReloadSpeed();
      }
    },
    bullet(type, angle){
      const bullet = type.create(this, this.team, this.targetPos.x, this.targetPos.y, angle);
      
      this._bullet = bullet;
    },
    turnToTarget(targetRot){
      if(this._bulletLife <= 0){
        this.rotation = Angles.moveToward(this.rotation, targetRot, this.efficiency() * heatRiser.rotateSpeed * this.delta());
      }
    },
    shouldActiveSound(){
      return this._bulletLife > 0 && this._bullet != null;
    }
	});
	eruptEntity.setEff();
	return eruptEntity;
};