const minigun = extendContent(ItemTurret, "minigun", {
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
			Core.atlas.find("definitely-not-advance-content-minigun-icon")
		];
  },
  drawLayer(tile){
    const vec = new Vec2();
    entity = tile.ent();
    
    vec.trns(entity.rotation, -entity.recoil);
    
    Draw.rect(this.turretRegions[entity.getFrame()], entity.x + vec.x, entity.y + vec.y, entity.rotation-90);
    
    for(i = 0; i < 4; i++){
      if(entity.getBheat(i) > 0){
        Draw.blend(Blending.additive);
        Draw.color(Color.valueOf("f7956a"), entity.getBheat(i));
        Draw.rect(this.heatRegions[entity.getHeatFrame(i)], entity.x + vec.x, entity.y + vec.y, entity.rotation-90);
        Draw.blend();
        Draw.color();
      }
    }
    
    if(entity.getFrameSpeed() > 0 && 9 * entity.getFrameSpeed() > 0.25){
      Draw.color(Color.valueOf("F7956A"));
      vec.trns(entity.rotation+90, 4, 10+entity.recoil);
      Lines.stroke(1);
      Lines.lineAngle(entity.x + vec.x, entity.y + vec.y, entity.rotation, 9 * entity.getFrameSpeed());
      vec.trns(entity.rotation+90, -4, 10+entity.recoil);
      Lines.stroke(1);
      Lines.lineAngle(entity.x + vec.x, entity.y + vec.y, entity.rotation, 9 * entity.getFrameSpeed());
      Draw.color();
    }
  },
  update(tile){
    this.super$update(tile);
    entity = tile.ent();
    
    if(!this.validateTarget(tile) || !this.hasAmmo(tile)){
      entity.setFrameSpeed(Mathf.lerpDelta(entity.getFrameSpeed(), 0, 0.005));
    }
    
    entity.setTrueFrame(entity.getTrueFrame() + entity.getFrameSpeed());
    entity.setFrame(Mathf.round(entity.getTrueFrame()) % 3);
    for(i = 0; i < 4; i++){
      entity.setHeatFrame(i, (Mathf.round(entity.getTrueFrame()) % 12) + 6 - (i*3));
      if(entity.getHeatFrame(i) < 0){
        entity.setHeatFrame(i, 12 + entity.getHeatFrame(i));
      }
      if(entity.getHeatFrame(i) > 11){
        entity.setHeatFrame(i, -12 + entity.getHeatFrame(i));
      }
    }
    
    entity.recoil = Mathf.lerpDelta(entity.recoil, 0, this.restitution);
    for(i = 0; i < 4; i++){
      entity.setBheat(i, Mathf.lerpDelta(entity.getBheat(i), 0, this.cooldown));
    }
    
    if(entity.getFrame() == 2){
      entity.setShouldShoot(1);
    }
  },
  updateShooting(tile){
    entity = tile.ent();
    if(this.hasAmmo(tile)){
      entity.setFrameSpeed(Mathf.lerpDelta(entity.getFrameSpeed(), 1, 0.001 * this.peekAmmo(tile).reloadMultiplier));
    }
    
    if(entity.getFrame()==0 && entity.getFrameSpeed() >= 0.1875 && entity.getShouldShoot() == 1){
      type = this.peekAmmo(tile);
      
      this.shoot(tile, type);
      
      entity.setShouldShoot(0);
      entity.setBheat(entity.getBarrel() % 4, 1);
      entity.setBarrel(entity.getBarrel() + 1);
    }
  }
});

minigun.ammo(
  Items.copper, Bullets.standardCopper,
  Items.graphite, Bullets.standardDense,
  Items.pyratite, Bullets.standardIncendiary,
  Items.silicon, Bullets.standardHoming,
  Items.thorium, Bullets.standardThorium
);
minigun.turretRegions = [];
minigun.heatRegions = [];

minigun.restitution = 0.01;
minigun.recoil = 3;
minigun.cooldown = 0.01;
minigun.inaccuracy = 8;
minigun.shootEffect = Fx.none;
minigun.smokeEffect = Fx.none;
minigun.ammoUseEffect = Fx.none;

minigun.entityType = prov(() => {
  entity = extendContent(ItemTurret.ItemTurretEntity, minigun, {
    _BarrelHeat:[],
    //Barrel heat
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
    
    //Current barrel
    setBarrel(a){
      this._barrel = a;
    },
    
    getBarrel(){
      return this._barrel;
    },
    
    //Can shoot
    setShouldShoot(a){
      this._ss = a;
    },
    
    getShouldShoot(){
      return this._ss;
    }
  });
  
  entity.setFrame(0);
  entity.setTrueFrame(0);
  entity.setFrameSpeed(0);
  entity.setBarrel(0);
  entity.setShouldShoot(0);
  for(i = 0; i < 4; i++){
    entity.setBheat(i, 0);
    entity.setHeatFrame(i, 0);
  }
  
  return entity;
});