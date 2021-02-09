const quadMinigun = extend(ItemTurret, "minigun-iii", {
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
  shootSound: Sounds.shootBig,
  heatColor: Color.valueOf("f7956a"),
  //Dummy stats to mess with the shots/sec stat
  reloadTime: 3,
  shots: 4
});

const MiniCopper = extend(BasicBulletType, {
  sprite: "prog-mats-minigun-ball",
  speed: 2.5,
  damage: 21 * 0.8,
  width: 1.5,
  height: 1.5,
  lifetime: 90
});

const MiniThorium = extend(BasicBulletType, {
  sprite: "prog-mats-minigun-ball",
  speed: 4,
  damage: 46 * 0.8,
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
  damage: 28 * 0.8,
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
  damage: 23 * 0.8,
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
  damage: 25 * 0.8,
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
  damage: 24 * 0.8,
  width: 2.5,
  height: 2.5,
  hitEffect: Fx.blastExplosion,
  despawnEffect: Fx.blastExplosion,
  shootEffect: Fx.shootBig,
  smokeEffect: Fx.shootBigSmoke,
  hitSound: Sounds.explosion,
  splashDamage: 34 * 0.8,
  splashDamageRadius: 12,
  inaccuracy: 3,
  lifetime: 90,
  ammoMultiplier: 3
});

quadMinigun.ammo(
  Items.copper, MiniCopper,
  Items.graphite, MiniGraphite,
  Items.silicon, MiniSilicon,
  Items.pyratite, MiniPyratite,
  Items.blastCompound, MiniBlast,
  Items.thorium, MiniThorium
);
/*
  requirements:[
    copper/650
    graphite/600
    titanium/120
    plastanium/325
    thorium/160
    techtanite/240
  ]
*/
// quadMinigun.requirements(Category.turret, ItemStack.with(Items.copper, 650, Items.graphite, 600, Items.titanium, 120, Items.thorium, 160, Items.plastanium, 325, Vars.content.getByName(ContentType.item, "prog-mats-techtanite"), 240));
quadMinigun.requirements = ItemStack.with(Items.copper, 650, Items.graphite, 600, Items.titanium, 120, Items.thorium, 160, Items.plastanium, 325, Vars.content.getByName(ContentType.item, "prog-mats-techtanite"), 240);
quadMinigun.category = Category.turret;
quadMinigun.buildVisibility = BuildVisibility.shown;

quadMinigun.buildType = ent => {
  ent = extend(ItemTurret.ItemTurretBuild, quadMinigun, {
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
      
      Draw.rect(quadMinigun.baseRegion, this.x, this.y, 0);
      
      Draw.z(Layer.turret);
      
      vec.trns(this.rotation, -this.recoil);	
      
      Drawf.shadow(quadMinigun.turretRegions[this._frame], this.x + vec.x - (quadMinigun.size / 2), this.y + vec.y - (quadMinigun.size / 2), this.rotation - 90);
      Draw.rect(quadMinigun.outlineRegions[this._frame], this.x + vec.x, this.y + vec.y, this.rotation - 90);
      Draw.rect(quadMinigun.turretRegions[this._frame], this.x + vec.x, this.y + vec.y, this.rotation - 90);

      for(var i = 0; i < 4; i++){	
        if(this._barrelHeat[i] > 0.00001){	
          Draw.blend(Blending.additive);	
          Draw.color(quadMinigun.heatColor, this._barrelHeat[i]);	
          Draw.rect(quadMinigun.heatRegions[this._heatFrame[i]], this.x + vec.x, this.y + vec.y, this.rotation - 90);	
          Draw.blend();	
          Draw.color();	
        }	
      }	

      if(this._frameSpeed > 0 && 9 * this._frameSpeed > 0.25){
        Draw.color(Color.valueOf("F7956A"));
        vec.trns(this.rotation + 90, 5, 10 + this.recoil);
        Lines.stroke(1);
        Lines.lineAngle(this.x + vec.x, this.y + vec.y, this.rotation, 9 * this._frameSpeed);
        vec.trns(this.rotation + 90, -5, 10 + this.recoil);
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

      this.recoil = Mathf.lerpDelta(this.recoil, 0, quadMinigun.restitution);
      for(var i = 0; i < 4; i++){
        this._barrelHeat[i] = Mathf.lerpDelta(this._barrelHeat[i], 0, quadMinigun.cooldown);
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
        this._frameSpeed = Mathf.lerpDelta(this._frameSpeed, 1, 0.000125 * this.peekAmmo().reloadMultiplier * liquid.heatCapacity * quadMinigun.coolantMultiplier * this.delta());
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
      const shootLoc = [-7.5, -2.5, 2.5,7.5];

      for(var i = 0; i < 4; i ++){	
        tr.trns(this.rotation - 90, shootLoc[i], 16);	
        type.create(this, this.team, this.x + tr.x, this.y + tr.y, this.rotation + Mathf.range(quadMinigun.inaccuracy + type.inaccuracy), 1, 1);	
      }	

      this.effects();	
      this.useAmmo();	
    },	
    effects(){	
      const tr = new Vec2();
      const shootLocX = [-9, -3, 3, 9];
      const shootLocY = [-1, -0, 0, -1];
      const fshootEffect = quadMinigun.shootEffect == Fx.none ? this.peekAmmo().shootEffect : quadMinigun.shootEffect;
      const fsmokeEffect = quadMinigun.smokeEffect == Fx.none ? this.peekAmmo().smokeEffect : quadMinigun.smokeEffect;

      for(var i = 0; i < 4; i ++){	
        tr.trns(this.rotation - 90, shootLocX[i], 16 + shootLocY[i]);	
        fshootEffect.at(this.x + tr.x, this.y + tr.y, this.rotation);	
        fsmokeEffect.at(this.x + tr.x, this.y + tr.y, this.rotation);	
        quadMinigun.shootSound.at(this.x + tr.x, this.y + tr.y, Mathf.random(0.9, 1.1));	
      }

      this.recoil = quadMinigun.recoilAmount;	
    }
  });
  
  ent.setEffs();
  return ent;
};