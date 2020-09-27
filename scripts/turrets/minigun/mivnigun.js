const quadMinigun = extendContent(ItemTurret, "minigun-iii", {
  load(){
    this.turretRegions = [];
    this.heatRegions = [];
    
    for(var i = 0; i < 3; i++){	
      this.turretRegions[i] = Core.atlas.find(this.name + "-f-" + i);	
    }	
    this.baseRegion = Core.atlas.find("block-4");	
    for(var i = 0; i < 12; i++){	
      this.heatRegions[i] = Core.atlas.find(this.name + "-heat-" + i);	
    }	
  },	
  icons(){	
    return [	
      Core.atlas.find("block-4"),	
      Core.atlas.find("definitely-not-advance-content-minigun-iii-icon")	
    ];	
  }
});
quadMinigun.turretRegions = [];
quadMinigun.heatRegions = [];

quadMinigun.size = 4;
quadMinigun.restitution = 0.02;
quadMinigun.recoilAmount = 3;
quadMinigun.cooldown = 0.11;
quadMinigun.inaccuracy = 8;
quadMinigun.shootEffect = Fx.none;
quadMinigun.smokeEffect = Fx.none;
quadMinigun.ammoUseEffect = Fx.none;
quadMinigun.shootSound = Sounds.shootBig;
quadMinigun.heatColor = Color.valueOf("f7956a");

const MiniCopper = extend(BasicBulletType,{});
MiniCopper.sprite = "definitely-not-advance-content-minigun-ball";
MiniCopper.speed = 2.5;
MiniCopper.damage = 20.25;
MiniCopper.width = 1.5;
MiniCopper.height = 1.5;
MiniCopper.lifetime = 90;

const MiniThorium = extend(BasicBulletType,{});
MiniThorium.sprite = "definitely-not-advance-content-minigun-ball";
MiniThorium.speed = 4;
MiniThorium.damage = 65.25;
MiniThorium.width = 2.5;
MiniThorium.height = 2.5;
MiniThorium.lifetime = 90;
MiniThorium.shootEffect = Fx.shootBig;
MiniThorium.smokeEffect = Fx.shootBigSmoke;
MiniThorium.ammoMultiplier = 4;

const MiniGraphite = extend(BasicBulletType,{});
MiniGraphite.sprite = "definitely-not-advance-content-minigun-ball";
MiniGraphite.speed = 3.5;
MiniGraphite.damage = 2;
MiniGraphite.width = 2;
MiniGraphite.height = 2;
MiniGraphite.reloadMultiplier = 0.6;
MiniGraphite.ammoMultiplier = 4;
MiniGraphite.lifetime = 90;
MiniGraphite.pierce = true;

const MiniSilicon = extend(BasicBulletType,{});
MiniSilicon.sprite = "definitely-not-advance-content-minigun-ball";
MiniSilicon.speed = 3;
MiniSilicon.damage = 20.25;
MiniSilicon.width = 1.5;
MiniSilicon.height = 1.5;
MiniSilicon.homingPower = 5;
MiniSilicon.reloadMultiplier = 1.4;
MiniSilicon.ammoMultiplier = 5;
MiniSilicon.lifetime = 90;

const MiniPyratite = extend(BasicBulletType,{});
MiniPyratite.sprite = "definitely-not-advance-content-minigun-ball";
MiniPyratite.speed = 3.2;
MiniPyratite.damage = 24.75;
MiniPyratite.width = 2;
MiniPyratite.height = 2;
MiniPyratite.frontColor = Pal.lightishOrange;
MiniPyratite.backColor = Pal.lightOrange;
MiniPyratite.status = StatusEffects.burning;
MiniPyratite.inaccuracy = 3;
MiniPyratite.lifetime = 90;

const MiniBlast = extend(BasicBulletType,{});
MiniBlast.sprite = "definitely-not-advance-content-minigun-ball";
MiniBlast.speed = 3.5;
MiniBlast.damage = 25;
MiniBlast.width = 2.5;
MiniBlast.height = 2.5;
MiniBlast.frontColor = Pal.redDust;
MiniBlast.backColor = Pal.redderDust;
MiniBlast.hitEffect = Fx.blastExplosion;
MiniBlast.despawnEffect = Fx.blastExplosion;
MiniBlast.shootEffect = Fx.shootBig;
MiniBlast.smokeEffect = Fx.shootBigSmoke;
MiniBlast.hitSound = Sounds.explosion;
MiniBlast.splashDamage = 52;
MiniBlast.splashDamageRadius = 12;
MiniBlast.inaccuracy = 3;
MiniBlast.lifetime = 90;
MiniBlast.ammoMultiplier = 3;

quadMinigun.ammo(
  Items.copper, MiniCopper,
  Items.graphite, MiniGraphite,
  Items.silicon, MiniSilicon,
  Items.pyratite, MiniPyratite,
  Items.blastCompound, MiniBlast,
  Items.thorium, MiniThorium
);

quadMinigun.buildType = () => {
  var IVEntity = extendContent(ItemTurret.ItemTurretBuild, quadMinigun, {
    _BarrelHeat:[],
    //DBarrel heat
    setBheat(n, v){
      this._BarrelHeat[n] = v;
    },
    
    getBheat(n){
      return this._BarrelHeat[n];
    },
    
    //Current frame
    setFrame(a){
      this._frame = a;
    },
    
    getFrame(){
      return this._frame;
    },
    
    _hframe:[],
    //Current heat frame
    setHeatFrame(n, v){
      this._hframe[n] = v;
    },
    
    getHeatFrame(n){
      return this._hframe[n];
    },
    
    //Time between frames
    setFrameSpeed(a){
      this._frameSpd = a;
    },
    
    getFrameSpeed(){
      return this._frameSpd;
    },
    
    //True frame
    setTrueFrame(a){
      this._tframe = a;
    },
    
    getTrueFrame(){
      return this._tframe;
    },
    
    //Current DBarrel
    setBarrel(a){
      this._Barrel = a;
    },
    
    getBarrel(){
      return this._Barrel;
    },
    
    //Can shoot
    setShouldShoot(a){
      this._SS = a;
    },
    
    getShouldShoot(){
      return this._SS;
    },
    
    //Can change barrel
    setShouldBarrel(a){
      this._SB = a;
    },
    
    getShouldBarrel(){
      return this._SB;
    },
    setStats(){	
      this.super$setStats();	

      this.stats.remove(BlockStat.shots);	
      this.stats.add(BlockStat.shots, "4");	
    },	
    draw(){	
      const vec = new Vec2();	
      
      vec.trns(this.rotation, -this.recoilAmount);	

      Draw.rect(quadMinigun.turretRegions[this.getFrame()], this.x + vec.x, this.y + vec.y, this.rotation-90);	

      for(var i = 0; i < 4; i++){	
        if(this.getBheat(i) > 0){	
          Draw.blend(Blending.additive);	
          Draw.color(quadMinigun.heatColor, this.getBheat(i));	
          Draw.rect(quadMinigun.heatRegions[this.getHeatFrame(i)], this.x + vec.x, this.y + vec.y, this.rotation-90);	
          Draw.blend();	
          Draw.color();	
        }	
      }	

      if(this.getFrameSpeed() > 0 && 9 * this.getFrameSpeed() > 0.25){	
        Draw.color(Color.valueOf("F7956A"));	
        vec.trns(this.rotation+90, 4, 10+this.recoilAmount);	
        Lines.stroke(1);	
        Lines.lineAngle(this.x + vec.x, this.y + vec.y, this.rotation, 9 * this.getFrameSpeed());	
        vec.trns(this.rotation+90, -4, 10+this.recoilAmount);	
        Lines.stroke(1);	
        Lines.lineAngle(this.x + vec.x, this.y + vec.y, this.rotation, 9 * this.getFrameSpeed());	
        Draw.color();	
      }	
    },	
    updateTile(){	
      this.super$updateTile();	
      
      if(!this.validateTarget(tile) || this.totalAmmo < 2){	
        this.setFrameSpeed(Mathf.lerpDelta(this.getFrameSpeed(), 0, 0.0125));	
      }	

      this.setTrueFrame(this.getTrueFrame() + this.getFrameSpeed());	
      this.setFrame(Mathf.round(this.getTrueFrame()) % 3);	
      for(var i = 0; i < 4; i++){	
        this.setHeatFrame(i, (Mathf.round(this.getTrueFrame()) % 12) - 3 - (i*3));	
        if(this.getHeatFrame(i) < 0){	
          this.setHeatFrame(i, 12 + this.getHeatFrame(i));	
        }	
        if(this.getHeatFrame(i) > 11){	
          this.setHeatFrame(i, -12 + this.getHeatFrame(i));	
        }	
      }	

      this.recoilAmount = Mathf.lerpDelta(this.recoilAmount, 0, this.block.restitution);	
      for(var i = 0; i < 4; i++){	
        this.setBheat(i, Mathf.lerpDelta(this.getBheat(i), 0, this.cooldown));	
      }	

      if(this.getFrame() != 0){	
        this.setShouldShoot(1);	
        this.setShouldBarrel(1);	
      }	

      if(this.getFrame() == 0 && this.getShouldBarrel() == 1){	
        this.setBarrel(this.getBarrel() + 1);	
        this.setShouldBarrel(0);	
      }	
    },	
    updateShooting(){	
      liquid = this.liquids.current();	

      if(this.totalAmmo >= 2){	
        this.setFrameSpeed(Mathf.lerpDelta(this.getFrameSpeed(), 1, 0.000125 * this.peekAmmo(tile).reloadMultiplier * liquid.heatCapacity * this.coolantMultiplier * this.delta()));	
        if(this.getFrameSpeed() < 0.95){	
          this.liquids.remove(liquid, 0.2);	
        }	
      }	
      if(this.getFrame() == 0 && this.getShouldShoot() == 1 && this.getFrameSpeed() > 0.0166666667){	
        type = this.peekAmmo(tile);	

        this.shoot(tile, type);	
      }	
    },	
    shoot(tile, type){	
      const tr = new Vec2();	
      const shootLoc = [-7.5, -2.5, 2.5,7.5];	

      this.setShouldShoot(0);	
      this.setBheat(this.getBarrel() % 4, 1);	

      for(var i = 0; i < 4; i ++){	
        tr.trns(this.rotation - 90, shootLoc[i], 16);	
        Calls.createBullet(type, this.getTeam(), this.x + tr.x, this.y + tr.y, this.rotation + Mathf.range(this.inaccuracy + type.inaccuracy), 1, 1);	
      }	

      this.effects(tile);	
      this.useAmmo(tile);	
    },	
    effects(tile){	
      const tr = new Vec2();	
      const shootLoc = [-7.5, -2.5, 2.5,7.5];	
      shootEffect = this.shootEffect == Fx.none ? this.peekAmmo(tile).shootEffect : this.shootEffect;	
      smokeEffect = this.smokeEffect == Fx.none ? this.peekAmmo(tile).smokeEffect : this.smokeEffect;	

      for(var i = 0; i < 4; i ++){	
        tr.trns(this.rotation - 90, shootLoc[i], 16);	
        shootEffect.at(tile.drawx() + tr.x, tile.drawy() + tr.y, this.rotation);	
        smokeEffect.at(tile.drawx() + tr.x, tile.drawy() + tr.y, this.rotation);	
        this.shootSound.at(tile, Mathf.random(0.9, 1.1));	
      }	

      this.recoilAmount = this.recoilAmount;	
    }
  });
  
  IVEntity.setFrame(0);
  IVEntity.setTrueFrame(0);
  IVEntity.setFrameSpeed(0);
  IVEntity.setBarrel(-1);
  IVEntity.setShouldShoot(0);
  IVEntity.setShouldBarrel(0);
  for(var i = 0; i < 4; i++){
    IVEntity.setBheat(i, 0);
    IVEntity.setHeatFrame(i, 0);
  }
  
  return IVEntity;
};