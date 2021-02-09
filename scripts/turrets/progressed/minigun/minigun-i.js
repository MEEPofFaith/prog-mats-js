const minigun = extend(ItemTurret, "minigun-i", {
  load(){
    this.turretRegions = [];
    this.outlineRegions = [];
    this.heatRegions = [];
    
    this.teamRegion = Core.atlas.find("error");
    this.baseRegion = Core.atlas.find("block-4");
    for(var i = 0; i < 3; i++){
      this.turretRegions[i] = Core.atlas.find(this.name + "-frame-" + i);
      this.outlineRegions[i] = Core.atlas.find(this.name + "-outline-" + i);
    }
    for(var i = 0; i < 12; i++){
      this.heatRegions[i] = Core.atlas.find(this.name + "-heat-" + i);
    }
  },
  icons(){
    return[
      this.baseRegion,
      this.turretRegions[0]
    ];
  },
  size: 4,
  range: 225,
  health: 1800,
  shootCone: 20,
  shootSound: Sounds.shootBig,
  targetAir: true,
  targetGround: true,
  rotateSpeed: 2,
  restitution: 0.02,
  recoilAmount: 3,
  cooldown: 0.11,
  inaccuracy: 8,
  shootEffect: Fx.none,
  smokeEffect: Fx.none,
  ammoUseEffect: Fx.none,
  heatColor: Color.valueOf("f7956a"),
  //Dummy stats to mess with the shots/sec stat
  reloadTime: 3,
  shots: 1
});

const MiniCopper = extend(BasicBulletType, {
  sprite: "prog-mats-minigun-ball",
  speed: 2.5,
  damage: 21,
  width: 1.5,
  height: 1.5,
  lifetime: 90
});

const MiniThorium = extend(BasicBulletType, {
  sprite: "prog-mats-minigun-ball",
  speed: 4,
  damage: 46,
  width: 2.5,
  height: 2.5,
  lifetime: 90,
  shootEffect: Fx.shootBig,
  smokeEffect: Fx.shootBigSmoke,
  ammoMultiplier: 4
});

const MiniGraphite = extend(BasicBulletType, {
  sprite: "prog-mats-minigun-ball",
  speed: 3.5,
  damage: 28,
  width: 2,
  height: 2,
  reloadMultiplier: 0.6,
  ammoMultiplier: 4,
  lifetime: 90,
  pierce: true
});

const MiniSilicon = extend(BasicBulletType, {
  sprite: "prog-mats-minigun-ball",
  speed: 3,
  damage: 23,
  width: 1.5,
  height: 1.5,
  homingPower: 5,
  reloadMultiplier: 1.4,
  ammoMultiplier: 5,
  lifetime: 90
});

const MiniPyratite = extend(BasicBulletType, {
  sprite: "prog-mats-minigun-ball",
  speed: 3.2,
  damage: 25,
  width: 2,
  height: 2,
  frontColor: Pal.lightishOrange,
  backColor: Pal.lightOrange,
  status: StatusEffects.burning,
  inaccuracy: 3,
  lifetime: 90,
  makeFire: true
});

const MiniBlast = extend(BasicBulletType, {
  sprite: "prog-mats-minigun-ball",
  speed: 3.5,
  damage: 24,
  width: 2.5,
  height: 2.5,
  hitEffect: Fx.blastExplosion,
  despawnEffect: Fx.blastExplosion,
  shootEffect: Fx.shootBig,
  smokeEffect: Fx.shootBigSmoke,
  hitSound: Sounds.explosion,
  splashDamage: 34,
  splashDamageRadius: 12,
  inaccuracy: 3,
  lifetime: 90,
  ammoMultiplier: 3
});

minigun.ammo(
  Items.copper, MiniCopper,
  Items.graphite, MiniGraphite,
  Items.silicon, MiniSilicon,
  Items.pyratite, MiniPyratite,
  Items.blastCompound, MiniBlast,
  Items.thorium, MiniThorium
);

/*
  requirements:[
    copper/200
    graphite/175
    titanium/100
    thorium/80
  ]
*/
// minigun.requirements(Category.turret, ItemStack.with(Items.copper, 200, Items.graphite, 175, Items.titanium, 100, Items.thorium, 80));
minigun.requirements = ItemStack.with(Items.copper, 200, Items.graphite, 175, Items.titanium, 100, Items.thorium, 80);
minigun.category = Category.turret;
minigun.buildVisibility = BuildVisibility.shown;

minigun.buildType = ent => {
  ent = extend(ItemTurret.ItemTurretBuild, minigun, {
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
      
      if(!this.hasAmmo() || !this.isShooting() || !this.isActive()){
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
  
  ent.setEffs();
  return ent;
};