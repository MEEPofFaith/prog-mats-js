const minigun = extendContent(ItemTurret, "minigun-i", {});
minigun.turretRegions = [];
minigun.heatRegions = [];

minigun.restitution = 0.02;
minigun.recoil = 3;
minigun.cooldown = 0.11;
minigun.inaccuracy = 8;
minigun.shootEffect = Fx.none;
minigun.smokeEffect = Fx.none;
minigun.ammoUseEffect = Fx.none;
minigun.heatColor = Color.valueOf("f7956a");

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

minigun.ammo(
  Items.copper, MiniCopper,
  Items.graphite, MiniGraphite,
  Items.silicon, MiniSilicon,
  Items.pyratite, MiniPyratite,
  Items.blastCompound, MiniBlast,
  Items.thorium, MiniThorium
);

minigun.entityType = () => {
  var IEntity = extendContent(ItemTurret.ItemTurretBuild, minigun, {
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
    },
    
    //Can change barrel
    setShouldBarrel(a){
      this._SB = a;
    },
    
    getShouldBarrel(){
      return this._SB;
    },
    
    load(){
      for(i = 0; i < 3; i++){
        this.turretRegions[i] = Core.atlas.find(this.name + "-f-" + i);
      }
      this.baseRegion = Core.atlas.find("block-4");
      for(i = 0; i < 12; i++){
        this.heatRegions[i] = Core.atlas.find(this.name + "-heat-" + i);
      }
    },
    icons(){
      return [
        Core.atlas.find("block-4"),
        Core.atlas.find("definitely-not-advance-content-minigun-i-icon")
      ];
    },
    drawLayer(tile){
      const vec = new Vec2();
      const entity = tile.ent();
      
      vec.trns(entity.rotation, -entity.recoil);
      
      Draw.rect(this.turretRegions[entity.getFrame()], entity.x + vec.x, entity.y + vec.y, entity.rotation-90);
      
      for(i = 0; i < 4; i++){
        if(entity.getBheat(i) > 0){
          Draw.blend(Blending.additive);
          Draw.color(this.heatColor, entity.getBheat(i));
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
      const entity = tile.ent();
      
      if(!this.validateTarget(tile) || !this.hasAmmo(tile)){
        entity.setFrameSpeed(Mathf.lerpDelta(entity.getFrameSpeed(), 0, 0.0125));
      }
      
      entity.setTrueFrame(entity.getTrueFrame() + entity.getFrameSpeed());
      entity.setFrame(Mathf.round(entity.getTrueFrame()) % 3);
      for(i = 0; i < 4; i++){
        entity.setHeatFrame(i, (Mathf.round(entity.getTrueFrame()) % 12) - 3 - (i*3));
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
      
      if(entity.getFrame() != 0){
        entity.setShouldShoot(1);
        entity.setShouldBarrel(1);
      }
      
      if(entity.getFrame() == 0 && entity.getShouldBarrel() == 1){
        entity.setBarrel(entity.getBarrel() + 1);
        entity.setShouldBarrel(0);
      }
    },
    updateShooting(tile){
      const entity = tile.ent();
      liquid = entity.liquids.current();
      
      if(this.hasAmmo(tile)){
        entity.setFrameSpeed(Mathf.lerpDelta(entity.getFrameSpeed(), 1, 0.000125 * this.peekAmmo(tile).reloadMultiplier * liquid.heatCapacity * this.coolantMultiplier * entity.delta()));
        if(entity.getFrameSpeed() < 0.95){
          entity.liquids.remove(liquid, 0.2);
        }
      }
      if(entity.getFrame() == 0 && entity.getShouldShoot() == 1 && entity.getFrameSpeed() > 0.0166666667){
        type = this.peekAmmo(tile);
        
        this.shoot(tile, type);
        
        entity.setShouldShoot(0);
        entity.setBheat(entity.getBarrel() % 4, 1);
      }
    }
  });
  
  entity.setFrame(0);
  entity.setTrueFrame(0);
  entity.setFrameSpeed(0);
  entity.setBarrel(-1);
  entity.setShouldShoot(0);
  entity.setShouldBarrel(0);
  for(i = 0; i < 4; i++){
    entity.setBheat(i, 0);
    entity.setHeatFrame(i, 0);
  }
  
  return IEntity;
};