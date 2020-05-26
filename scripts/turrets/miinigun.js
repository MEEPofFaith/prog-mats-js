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
    
    if(!this.validateTarget(tile) || !this.hasAmmo(tile)){
      entity.setDFrameSpeed(Mathf.lerpDelta(entity.getDFrameSpeed(), 0, 0.005));
    }
    
    entity.setDTrueFrame(entity.getDTrueFrame() + entity.getDFrameSpeed());
    entity.setDFrame(Mathf.round(entity.getDTrueFrame()) % 3);
    for(i = 0; i < 4; i++){
      entity.setDHeatFrame(i, (Mathf.round(entity.getDTrueFrame()) % 12) + 6 - (i*3));
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
    if(this.hasAmmo(tile)){
      entity.setDFrameSpeed(Mathf.lerpDelta(entity.getDFrameSpeed(), 1, 0.001 * this.peekAmmo(tile).reloadMultiplier));
    }
    
    if(entity.getDFrame()==0 && entity.getDFrameSpeed() >= 0.1875 && entity.getDShouldShoot() == 1 && entity.ammo.size >= 2){
      type = this.peekAmmo(tile);
      
      this.shoot(tile, type);
      this.shoot(tile, type);
      
      entity.setDShouldShoot(0);
      entity.setDBheat(entity.getDBarrel() % 4, 1);
      entity.setDBarrel(entity.getDBarrel() + 1);
    }
  }
});

dualMinigun.ammo(
  Items.copper, Bullets.standardCopper,
  Items.graphite, Bullets.standardDense,
  Items.pyratite, Bullets.standardIncendiary,
  Items.silicon, Bullets.standardHoming,
  Items.thorium, Bullets.standardThorium
);
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