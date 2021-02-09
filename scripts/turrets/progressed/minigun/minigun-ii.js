const dualMinigun = extend(ItemTurret, "minigun-ii", {
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
  shots: 2
});

const MiniCopper = extend(BasicBulletType, {
  sprite: "prog-mats-minigun-ball",
  speed: 2.5,
  damage: 21 * 0.9,
  width: 1.5,
  height: 1.5,
  lifetime: 90
});

const MiniThorium = extend(BasicBulletType, {
  sprite: "prog-mats-minigun-ball",
  speed: 4,
  damage: 46 * 0.9,
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
  damage: 28 * 0.9,
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
  damage: 23 * 0.9,
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
  damage: 25 * 0.9,
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
  damage: 24 * 0.9,
  width: 2.5,
  height: 2.5,
  hitEffect: Fx.blastExplosion,
  despawnEffect: Fx.blastExplosion,
  shootEffect: Fx.shootBig,
  smokeEffect: Fx.shootBigSmoke,
  hitSound: Sounds.explosion,
  splashDamage: 34 * 0.9,
  splashDamageRadius: 12,
  inaccuracy: 3,
  lifetime: 90,
  ammoMultiplier: 3
});

dualMinigun.ammo(
  Items.copper, MiniCopper,
  Items.graphite, MiniGraphite,
  Items.silicon, MiniSilicon,
  Items.pyratite, MiniPyratite,
  Items.blastCompound, MiniBlast,
  Items.thorium, MiniThorium
);

/*
  requirements:[
    copper/350
    graphite/300
    plastanium/175
    thorium/80
    techtanite/80
  ]
*/
// dualMinigun.requirements(Category.turret, ItemStack.with(Items.copper, 350, Items.graphite, 300, Items.plastanium, 175, Items.thorium, 80, Vars.content.getByName(ContentType.item, "prog-mats-techtanite"), 80));
dualMinigun.requirements = ItemStack.with(Items.copper, 350, Items.graphite, 300, Items.plastanium, 175, Items.thorium, 80, Vars.content.getByName(ContentType.item, "prog-mats-techtanite"), 80);
dualMinigun.category = Category.turret;
dualMinigun.buildVisibility = BuildVisibility.shown;

dualMinigun.buildType = ent => {
  ent = extend(ItemTurret.ItemTurretBuild, dualMinigun, {
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
      
      Draw.rect(dualMinigun.baseRegion, this.x, this.y, 0);
      
      Draw.z(Layer.turret);
      
      vec.trns(this.rotation, -this.recoil);
      
      Drawf.shadow(dualMinigun.turretRegions[this._frame], this.x + vec.x - (dualMinigun.size / 2), this.y + vec.y - (dualMinigun.size / 2), this.rotation - 90);
      Draw.rect(dualMinigun.outlineRegions[this._frame], this.x + vec.x, this.y + vec.y, this.rotation - 90);
      Draw.rect(dualMinigun.turretRegions[this._frame], this.x + vec.x, this.y + vec.y, this.rotation - 90);
      
      for(var i = 0; i < 4; i++){
        if(this._barrelHeat[i] > 0.00001){
          Draw.blend(Blending.additive);
          Draw.color(dualMinigun.heatColor, this._barrelHeat[i]);
          Draw.rect(dualMinigun.heatRegions[this._heatFrame[i]], this.x + vec.x, this.y + vec.y, this.rotation - 90);
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
      
      this.recoil = Mathf.lerpDelta(this.recoil, 0, dualMinigun.restitution);
      for(var i = 0; i < 4; i++){
        this._barrelHeat[i] = Mathf.lerpDelta(this._barrelHeat[i], 0, dualMinigun.cooldown);
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
        this._frameSpeed = Mathf.lerpDelta(this._frameSpeed, 1, 0.000125 * this.peekAmmo().reloadMultiplier * liquid.heatCapacity * dualMinigun.coolantMultiplier * this.delta());
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
    },
    shoot(type){
      const tr = new Vec2();
      const shootLoc = [-4, 4];
      
      for(var i = 0; i < 2; i ++){	
        tr.trns(this.rotation - 90, shootLoc[i], 16);	
        type.create(this, this.team, this.x + tr.x, this.y + tr.y, this.rotation + Mathf.range(dualMinigun.inaccuracy + type.inaccuracy), 1, 1);	
      }	

      this.effects();
      this.useAmmo();
    },
    effects(){
      const tr = new Vec2();
      const shootLoc = [-4, 4];
      const fshootEffect = dualMinigun.shootEffect == Fx.none ? this.peekAmmo().shootEffect : dualMinigun.shootEffect;
      const fsmokeEffect = dualMinigun.smokeEffect == Fx.none ? this.peekAmmo().smokeEffect : dualMinigun.smokeEffect;

      for(var i = 0; i < 2; i ++){	
        tr.trns(this.rotation - 90, shootLoc[i], 16);	
        fshootEffect.at(this.x + tr.x, this.y + tr.y, this.rotation);	
        fsmokeEffect.at(this.x + tr.x, this.y + tr.y, this.rotation);	
        dualMinigun.shootSound.at(this.x + tr.x, this.y + tr.y, Mathf.random(0.9, 1.1));	
      }
      
      this.recoil = dualMinigun.recoilAmount;
    }
  });
  
  ent.setEffs();
  return ent;
};