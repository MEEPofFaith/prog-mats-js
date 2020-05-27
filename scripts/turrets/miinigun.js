const dualMinigun = extendContent(DoubleTurret, "miinigun", {
  load(){
    for(i = 0; i < 3; i++){
      this.turretRegions[i] = Core.atlas.find(this.name + "-f-" + i);
    }
    this.baseRegion = Core.atlas.find("block-4");
    for(i = 0; i < 12; i++){
      this.heatRegions[i] = Core.atlas.find(this.name + "-heat-" + i);
    }
  },
  generateIcons(){
    return [
			Core.atlas.find("block-4"),
			Core.atlas.find("definitely-not-advance-content-miinigun-icon")
		];
  },
  drawLayer(tile){
    const vec = new Vec2();
    entity = tile.ent();
    
    vec.trns(entity.rotation, -entity.recoil);
    
    Draw.rect(this.turretRegions[entity.getDFrame()], entity.x + vec.x, entity.y + vec.y, entity.rotation-90);
    
    for(i = 0; i < 4; i++){
      if(entity.getDBheat(i) > 0){
        Draw.blend(Blending.additive);
        Draw.color(Color.valueOf("f7956a"), entity.getDBheat(i));
        Draw.rect(this.heatRegions[entity.getDHeatFrame(i)], entity.x + vec.x, entity.y + vec.y, entity.rotation-90);
        Draw.blend();
        Draw.color();
      }
    }
    
    if(entity.getDFrameSpeed() > 0 && 9 * entity.getDFrameSpeed() > 0.25){
      Draw.color(Color.valueOf("F7956A"));
      vec.trns(entity.rotation+90, 4, 10+entity.recoil);
      Lines.stroke(1);
      Lines.lineAngle(entity.x + vec.x, entity.y + vec.y, entity.rotation, 9 * entity.getDFrameSpeed());
      vec.trns(entity.rotation+90, -4, 10+entity.recoil);
      Lines.stroke(1);
      Lines.lineAngle(entity.x + vec.x, entity.y + vec.y, entity.rotation, 9 * entity.getDFrameSpeed());
      Draw.color();
    }
  },
  update(tile){
    this.super$update(tile);
    entity = tile.ent();
    
    if(!this.validateTarget(tile) || entity.totalAmmo < 2){
      entity.setDFrameSpeed(Mathf.lerpDelta(entity.getDFrameSpeed(), 0, 0.005));
    }
    
    entity.setDTrueFrame(entity.getDTrueFrame() + entity.getDFrameSpeed());
    entity.setDFrame(Mathf.round(entity.getDTrueFrame()) % 3);
    for(i = 0; i < 4; i++){
      entity.setDHeatFrame(i, (Mathf.round(entity.getDTrueFrame()) % 12) + 3 - (i*3));
      if(entity.getDHeatFrame(i) < 0){
        entity.setDHeatFrame(i, 12 + entity.getDHeatFrame(i));
      }
      if(entity.getDHeatFrame(i) > 11){
        entity.setDHeatFrame(i, -12 + entity.getDHeatFrame(i));
      }
    }
    
    entity.recoil = Mathf.lerpDelta(entity.recoil, 0, this.restitution);
    for(i = 0; i < 4; i++){
      entity.setDBheat(i, Mathf.lerpDelta(entity.getDBheat(i), 0, this.cooldown));
    }
    
    if(entity.getDFrame() == 2){
      entity.setDShouldShoot(1);
    }
  },
  updateShooting(tile){
    entity = tile.ent();
    liquid = entity.liquids.current();
    
    if(entity.totalAmmo >= 2){
      entity.setDFrameSpeed(Mathf.lerpDelta(entity.getDFrameSpeed(), 1, 0.001 * this.peekAmmo(tile).reloadMultiplier * liquid.heatCapacity * this.coolantMultiplier));
      entity.liquids.remove(liquid, 0.2);
    }
    
    if(entity.getDFrame()==0 && entity.getDFrameSpeed() >= 0.1875 && entity.getDShouldShoot() == 1 && entity.totalAmmo >= 2){
      type = this.peekAmmo(tile);
      
      this.shoot(tile, type);
      this.shoot(tile, type);
      
      entity.setDShouldShoot(0);
      entity.setDBheat(entity.getDBarrel() % 4, 1);
      entity.setDBarrel(entity.getDBarrel() + 1);
    }
  }
});
dualMinigun.turretRegions = [];
dualMinigun.heatRegions = [];

dualMinigun.restitution = 0.01;
dualMinigun.shotWidth = 4;
dualMinigun.recoil = 3;
dualMinigun.cooldown = 0.01;
dualMinigun.inaccuracy = 8;
dualMinigun.shootEffect = Fx.none;
dualMinigun.smokeEffect = Fx.none;
dualMinigun.ammoUseEffect = Fx.none;

const MiniCopper = extend(BasicBulletType,{});
MiniCopper.speed = 2.5;
MiniCopper.damage = 13.5;
MiniCopper.bulletWidth = 2;
MiniCopper.bulletHeight = 4.5;
MiniCopper.lifetime = 90;

const MiniThorium = extend(BasicBulletType,{});
MiniThorium.speed = 4;
MiniThorium.damage = 43.5;
MiniThorium.bulletWidth = 2;
MiniThorium.bulletHeight = 6.5;
MiniThorium.lifetime = 90;
MiniThorium.shootEffect = Fx.shootBig;
MiniThorium.smokeEffect = Fx.shootBigSmoke;
MiniThorium.ammoMultiplier = 4;

const MiniGraphite = extend(BasicBulletType,{});
MiniGraphite.speed = 3.5;
MiniGraphite.damage = 27;
MiniGraphite.bulletWidth = 2;
MiniGraphite.bulletHeight = 6;
MiniGraphite.reloadMultiplier = 0.6;
MiniGraphite.ammoMultiplier = 4;
MiniGraphite.lifetime = 90;

const MiniSilicon = extend(BasicBulletType,{});
MiniSilicon.speed = 3;
MiniSilicon.damage = 13.5;
MiniSilicon.bulletWidth = 2;
MiniSilicon.bulletHeight = 6;
MiniSilicon.homingPower = 5;
MiniSilicon.reloadMultiplier = 1.4;
MiniSilicon.ammoMultiplier = 5;
MiniSilicon.lifetime = 90;

const MiniPyratite = extend(BasicBulletType,{});
MiniPyratite.speed = 3.2;
MiniPyratite.damage = 16.5;
MiniPyratite.bulletWidth = 2;
MiniPyratite.bulletHeight = 6;
MiniPyratite.frontColor = Pal.lightishOrange;
MiniPyratite.backColor = Pal.lightOrange;
MiniPyratite.status = StatusEffects.burning;
MiniPyratite.inaccuracy = 3;
MiniPyratite.lifetime = 90;

const MiniBlast = extend(BasicBulletType,{});
MiniBlast.speed = 3.5;
MiniBlast.damage = 4;
MiniBlast.bulletWidth = 2;
MiniBlast.bulletHeight = 6.5;
MiniBlast.frontColor = Pal.redDust;
MiniBlast.backColor = Pal.redderDust;
MiniBlast.hitEffect = Fx.blastExplosion;
MiniBlast.despawnEffect = Fx.blastExplosion;
MiniBlast.shootEffect = Fx.shootBig;
MiniBlast.smokeEffect = Fx.shootBigSmoke;
MiniBlast.hitSound = Sounds.explosion;
MiniBlast.splashDamage = 28;
MiniBlast.splashDamageRadius = 12;
MiniBlast.inaccuracy = 3;
MiniBlast.lifetime = 90;
MiniBlast.ammoMultiplier = 3;

dualMinigun.ammo(
  Items.copper, MiniCopper,
  Items.graphite, MiniGraphite,
  Items.silicon, MiniSilicon,
  Items.pyratite, MiniPyratite,
  Items.blastCompound, MiniBlast,
  Items.thorium, MiniThorium
);

dualMinigun.entityType = prov(() => {
  entity = extendContent(ItemTurret.ItemTurretEntity, dualMinigun, {
    _DDBarrelHeat:[],
    //DBarrel heat
    setDBheat(n, v){
      this._DDBarrelHeat[n] = v;
    },
    
    getDBheat(n){
      return this._DDBarrelHeat[n];
    },
    
    //Current frame
    setDFrame(a){
      this._Dframe = a;
    },
    
    getDFrame(){
      return this._Dframe;
    },
    
    _Dhframe:[],
    //Current heat frame
    setDHeatFrame(n, v){
      this._Dhframe[n] = v;
    },
    
    getDHeatFrame(n){
      return this._Dhframe[n];
    },
    
    //Time between frames
    setDFrameSpeed(a){
      this._DframeSpd = a;
    },
    
    getDFrameSpeed(){
      return this._DframeSpd;
    },
    
    //True frame
    setDTrueFrame(a){
      this._Dtframe = a;
    },
    
    getDTrueFrame(){
      return this._Dtframe;
    },
    
    //Current DBarrel
    setDBarrel(a){
      this._DDBarrel = a;
    },
    
    getDBarrel(){
      return this._DDBarrel;
    },
    
    //Can shoot
    setDShouldShoot(a){
      this._Dss = a;
    },
    
    getDShouldShoot(){
      return this._Dss;
    }
  });
  
  entity.setDFrame(0);
  entity.setDTrueFrame(0);
  entity.setDFrameSpeed(0);
  entity.setDBarrel(0);
  entity.setDShouldShoot(0);
  for(i = 0; i < 4; i++){
    entity.setDBheat(i, 0);
    entity.setDHeatFrame(i, 0);
  }
  
  return entity;
});