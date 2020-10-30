const minigun = extendContent(ItemTurret, "minigun-i", {
  load(){
    this.turretRegions = [];
    this.outlineRegions = [];
    this.heatRegions = [];
    
    this.baseRegion = Core.atlas.find("block-4");
    for(var i = 0; i < 3; i++){
      this.turretRegions[i] = Core.atlas.find(this.name + "-frame-" + i);
      this.outlineRegions[i] = Core.atlas.find(this.name + "-outline-" + i);
    }
    for(var i = 0; i < 12; i++){
      this.heatRegions[i] = Core.atlas.find(this.name + "-heat-" + i);
    }
  },
  setStats(){
    this.super$setStats();
    
    this.stats.remove(BlockStat.shots);
    this.stats.add(BlockStat.shots, "1 - 20");
  },
  icons(){
    return [
      Core.atlas.find("block-4"),
      Core.atlas.find("prog-mats-minigun-i-frame-0")
    ];
  }
});
minigun.turretRegions = [];
minigun.heatRegions = [];

minigun.restitution = 0.02;
minigun.recoilAmount = 3;
minigun.cooldown = 0.11;
minigun.inaccuracy = 8;
minigun.shootEffect = Fx.none;
minigun.smokeEffect = Fx.none;
minigun.ammoUseEffect = Fx.none;
minigun.heatColor = Color.valueOf("f7956a");

const MiniCopper = extend(BasicBulletType,{});
MiniCopper.sprite = "prog-mats-minigun-ball";
MiniCopper.speed = 2.5;
MiniCopper.damage = 21;
MiniCopper.width = 1.5;
MiniCopper.height = 1.5;
MiniCopper.lifetime = 90;

const MiniThorium = extend(BasicBulletType,{});
MiniThorium.sprite = "prog-mats-minigun-ball";
MiniThorium.speed = 4;
MiniThorium.damage = 46;
MiniThorium.width = 2.5;
MiniThorium.height = 2.5;
MiniThorium.lifetime = 90;
MiniThorium.shootEffect = Fx.shootBig;
MiniThorium.smokeEffect = Fx.shootBigSmoke;
MiniThorium.ammoMultiplier = 4;

const MiniGraphite = extend(BasicBulletType,{});
MiniGraphite.sprite = "prog-mats-minigun-ball";
MiniGraphite.speed = 3.5;
MiniGraphite.damage = 28;
MiniGraphite.width = 2;
MiniGraphite.height = 2;
MiniGraphite.reloadMultiplier = 0.6;
MiniGraphite.ammoMultiplier = 4;
MiniGraphite.lifetime = 90;
MiniGraphite.pierce = true;

const MiniSilicon = extend(BasicBulletType,{});
MiniSilicon.sprite = "prog-mats-minigun-ball";
MiniSilicon.speed = 3;
MiniSilicon.damage = 23;
MiniSilicon.width = 1.5;
MiniSilicon.height = 1.5;
MiniSilicon.homingPower = 5;
MiniSilicon.reloadMultiplier = 1.4;
MiniSilicon.ammoMultiplier = 5;
MiniSilicon.lifetime = 90;

const MiniPyratite = extend(BasicBulletType,{});
MiniPyratite.sprite = "prog-mats-minigun-ball";
MiniPyratite.speed = 3.2;
MiniPyratite.damage = 25;
MiniPyratite.width = 2;
MiniPyratite.height = 2;
MiniPyratite.frontColor = Pal.lightishOrange;
MiniPyratite.backColor = Pal.lightOrange;
MiniPyratite.status = StatusEffects.burning;
MiniPyratite.inaccuracy = 3;
MiniPyratite.lifetime = 90;

const MiniBlast = extend(BasicBulletType,{});
MiniBlast.sprite = "prog-mats-minigun-ball";
MiniBlast.speed = 3.5;
MiniBlast.damage = 24;
MiniBlast.width = 2.5;
MiniBlast.height = 2.5;
MiniBlast.hitEffect = Fx.blastExplosion;
MiniBlast.despawnEffect = Fx.blastExplosion;
MiniBlast.shootEffect = Fx.shootBig;
MiniBlast.smokeEffect = Fx.shootBigSmoke;
MiniBlast.hitSound = Sounds.explosion;
MiniBlast.splashDamage = 34;
MiniBlast.splashDamageRadius = 12;
MiniBlast.inaccuracy = 3;
MiniBlast.lifetime = 90;
MiniBlast.ammoMultiplier = 3;

minigun.ammo(
  Items.copper, MiniCopper,
  Items.graphite, MiniGraphite,
  Items.silicon, MiniSilicon,
  Items.pyratite, MiniPyratite,
  Items.blastCompound, MiniBlast,
  Items.thorium, MiniThorium
);

minigun.buildType = () => {
  var IEntity = extendContent(ItemTurret.ItemTurretBuild, minigun, {
    setEffs(){
      this._barrelHeat = [0, 0, 0, 0];
      this._frame = 0;
      this._heatFrame = [0, 0, 0, 0];
      this._frameSpeed = 0;
      this._trueFrame = 0;
      this._barrel = -1;
      this._shouldShoot = false;
      this._shouldBarrel = false;
    },
    draw(){
      const vec = new Vec2();
      
      Draw.rect(minigun.baseRegion, this.x, this.y, 0);
      
      Draw.z(Layer.turret);
      
      vec.trns(this.rotation, -this.recoil);
      
      Drawf.shadow(minigun.turretRegions[this._frame], this.x + vec.x - (minigun.size / 2), this.y + vec.y - (minigun.size / 2), this.rotation - 90);
      Draw.rect(minigun.outlineRegions[this._frame], this.x + vec.x, this.y + vec.y, this.rotation - 90);
      Draw.rect(minigun.turretRegions[this._frame], this.x + vec.x, this.y + vec.y, this.rotation - 90);
      
      for(var i = 0; i < 4; i++){
        if(this._barrelHeat[i] > 0.00001){
          Draw.blend(Blending.additive);
          Draw.color(minigun.heatColor, this._barrelHeat[i]);
          Draw.rect(minigun.heatRegions[this._heatFrame[i]], this.x + vec.x, this.y + vec.y, this.rotation - 90);
          Draw.blend();
          Draw.color();
        }
      }
      
      if(this._frameSpeed > 0 && 9 * this._frameSpeed > 0.25){
        Draw.color(Color.valueOf("F7956A"));
        vec.trns(this.rotation + 90, 4, 10 + this.recoil);
        Lines.stroke(1);
        Lines.lineAngle(this.x + vec.x, this.y + vec.y, this.rotation, 9 * this._frameSpeed);
        vec.trns(this.rotation + 90, -4, 10 + this.recoil);
        Lines.stroke(1);
        Lines.lineAngle(this.x + vec.x, this.y + vec.y, this.rotation, 9 * this._frameSpeed);
        Draw.color();
      }
    },
    updateTile(){
      this.super$updateTile();
      
      if(!this.validateTarget() || !this.hasAmmo()){
        this._frameSpeed = Mathf.lerpDelta(this._frameSpeed, 0, 0.0125);
      }
      
      this._trueFrame = this._trueFrame + this._frameSpeed;
      this._frame = Mathf.floor(this._trueFrame % 3);
      for(var i = 0; i < 4; i++){
        this._heatFrame[i] = Mathf.floor(this._trueFrame % 12) - 3 - (i * 3);
        if(this._heatFrame[i] < 0){
          this._heatFrame[i] = 12 + this._heatFrame[i];
        }
        if(this._heatFrame[i] > 11){
          this._heatFrame[i] = -12 + this._heatFrame[i];
        }
      }
      
      this.recoil = Mathf.lerpDelta(this.recoil, 0, minigun.restitution);
      for(var i = 0; i < 4; i++){
        this._barrelHeat[i] = Mathf.lerpDelta(this._barrelHeat[i], 0, minigun.cooldown);
      }
      
      if(this._frame != 0){
        this._shouldShoot = true;
        this._shouldBarrel = true;
      }
      
      if(this._frame == 0 && this._shouldBarrel){
        this._barrel = this._barrel + 1;
        this._shouldBarrel = false;
      }
    },
    updateShooting(){
      const liquid = this.liquids.current();
      
      if(this.hasAmmo()){
        this._frameSpeed = Mathf.lerpDelta(this._frameSpeed, 1, 0.000125 * this.peekAmmo().reloadMultiplier * liquid.heatCapacity * minigun.coolantMultiplier * this.delta());
        if(this._frameSpeed < 0.95){
          this.liquids.remove(liquid, 0.2);
        }
      }
      if(this._frame == 0 && this._shouldShoot && this._frameSpeed > 0.0166666667){
        var type = this.peekAmmo();
        
        this.shoot(type);
        
        this._shouldShoot = false;
        this._barrelHeat[this._barrel % 4] = 1;
      }
    }
  });
  
  IEntity.setEffs();
  return IEntity;
};