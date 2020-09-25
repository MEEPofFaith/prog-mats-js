const dualMinigun = extendContent(ItemTurret, "minigun-ii", {});
dualMinigun.turretRegions = [];
dualMinigun.heatRegions = [];

dualMinigun.size = 4;
dualMinigun.restitution = 0.02;
dualMinigun.shotWidth = 4;
dualMinigun.recoilAmount = 3;
dualMinigun.cooldown = 0.11;
dualMinigun.inaccuracy = 8;
dualMinigun.shootEffect = Fx.none;
dualMinigun.smokeEffect = Fx.none;
dualMinigun.ammoUseEffect = Fx.none;
dualMinigun.shootSound = Sounds.shootBig;
dualMinigun.heatColor = Color.valueOf("f7956a");

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

dualMinigun.ammo(
  Items.copper, MiniCopper,
  Items.graphite, MiniGraphite,
  Items.silicon, MiniSilicon,
  Items.pyratite, MiniPyratite,
  Items.blastCompound, MiniBlast,
  Items.thorium, MiniThorium
);

dualMinigun.buildType = () => {
  var IIEntity = extendContent(ItemTurret.ItemTurretEntity, dualMinigun, {
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
        Core.atlas.find("definitely-not-advance-content-minigun-ii-icon")
      ];
    },
    setStats(){
      this.super$setStats();
      
      this.stats.remove(BlockStat.shots);
      this.stats.add(BlockStat.shots, "2");
    },
    draw(){
      const vec = new Vec2();
      
      vec.trns(tile.bc().rotation, -tile.bc().recoilAmount);
      
      Draw.rect(this.turretRegions[tile.bc().getFrame()], tile.bc().x + vec.x, tile.bc().y + vec.y, tile.bc().rotation-90);
      
      for(i = 0; i < 4; i++){
        if(tile.bc().getBheat(i) > 0){
          Draw.blend(Blending.additive);
          Draw.color(this.heatColor, tile.bc().getBheat(i));
          Draw.rect(this.heatRegions[tile.bc().getHeatFrame(i)], tile.bc().x + vec.x, tile.bc().y + vec.y, tile.bc().rotation-90);
          Draw.blend();
          Draw.color();
        }
      }
      
      if(tile.bc().getFrameSpeed() > 0 && 9 * tile.bc().getFrameSpeed() > 0.25){
        Draw.color(Color.valueOf("F7956A"));
        vec.trns(tile.bc().rotation+90, 4, 10+tile.bc().recoilAmount);
        Lines.stroke(1);
        Lines.lineAngle(tile.bc().x + vec.x, tile.bc().y + vec.y, tile.bc().rotation, 9 * tile.bc().getFrameSpeed());
        vec.trns(tile.bc().rotation+90, -4, 10+tile.bc().recoilAmount);
        Lines.stroke(1);
        Lines.lineAngle(tile.bc().x + vec.x, tile.bc().y + vec.y, tile.bc().rotation, 9 * tile.bc().getFrameSpeed());
        Draw.color();
      }
    },
    updateTile(){
      this.super$updateTile();
      
      if(!this.validateTarget(tile) || tile.bc().totalAmmo < 2){
        tile.bc().setFrameSpeed(Mathf.lerpDelta(tile.bc().getFrameSpeed(), 0, 0.0125));
      }
      
      tile.bc().setTrueFrame(tile.bc().getTrueFrame() + tile.bc().getFrameSpeed());
      tile.bc().setFrame(Mathf.round(tile.bc().getTrueFrame()) % 3);
      for(i = 0; i < 4; i++){
        tile.bc().setHeatFrame(i, (Mathf.round(tile.bc().getTrueFrame()) % 12) - 3 - (i*3));
        if(tile.bc().getHeatFrame(i) < 0){
          tile.bc().setHeatFrame(i, 12 + tile.bc().getHeatFrame(i));
        }
        if(tile.bc().getHeatFrame(i) > 11){
          tile.bc().setHeatFrame(i, -12 + tile.bc().getHeatFrame(i));
        }
      }
      
      tile.bc().recoilAmount = Mathf.lerpDelta(tile.bc().recoilAmount, 0, this.restitution);
      for(i = 0; i < 4; i++){
        tile.bc().setBheat(i, Mathf.lerpDelta(tile.bc().getBheat(i), 0, this.cooldown));
      }
      
      if(tile.bc().getFrame() != 0){
        tile.bc().setShouldShoot(1);
        tile.bc().setShouldBarrel(1);
      }
      
      if(tile.bc().getFrame() == 0 && tile.bc().getShouldBarrel() == 1){
        tile.bc().setBarrel(tile.bc().getBarrel() + 1);
        tile.bc().setShouldBarrel(0);
      }
    },
    updateShooting(tile){
      liquid = tile.bc().liquids.current();
      
      if(tile.bc().totalAmmo >= 2){
        tile.bc().setFrameSpeed(Mathf.lerpDelta(tile.bc().getFrameSpeed(), 1, 0.000125 * this.peekAmmo(tile).reloadMultiplier * liquid.heatCapacity * this.coolantMultiplier * tile.bc().delta()));
        if(tile.bc().getFrameSpeed() < 0.95){
          tile.bc().liquids.remove(liquid, 0.2);
        }
      }
      if(tile.bc().getFrame() == 0 && tile.bc().getShouldShoot() == 1 && tile.bc().getFrameSpeed() > 0.0166666667){
        type = this.peekAmmo(tile);
        
        this.shoot(tile, type);
      }
    },
    shoot(tile, type){
      const tr = new Vec2();
      
      tile.bc().setShouldShoot(0);
      tile.bc().setBheat(tile.bc().getBarrel() % 4, 1);
      
      tr.trns(tile.bc().rotation - 90, -this.shotWidth, 16);
      Calls.createBullet(type, tile.bc().getTeam(), tile.bc().x + tr.x, tile.bc().y + tr.y, tile.bc().rotation + Mathf.range(this.inaccuracy + type.inaccuracy), 1, 1);
      
      tr.trns(tile.bc().rotation - 90, this.shotWidth, 16);
      Calls.createBullet(type, tile.bc().getTeam(), tile.bc().x + tr.x, tile.bc().y + tr.y, tile.bc().rotation + Mathf.range(this.inaccuracy + type.inaccuracy), 1, 1);
      
      this.effects(tile);
      this.useAmmo(tile);
    },
    effects(tile){
      const tr = new Vec2();
      shootEffect = this.shootEffect == Fx.none ? this.peekAmmo(tile).shootEffect : this.shootEffect;
      smokeEffect = this.smokeEffect == Fx.none ? this.peekAmmo(tile).smokeEffect : this.smokeEffect;

      tr.trns(tile.bc().rotation - 90, -this.shotWidth, 16);
      shootEffect.at(tile.drawx() + tr.x, tile.drawy() + tr.y, tile.bc().rotation);
      smokeEffect.at(tile.drawx() + tr.x, tile.drawy() + tr.y, tile.bc().rotation);
      this.shootSound.at(tile, Mathf.random(0.9, 1.1));

      tr.trns(tile.bc().rotation - 90, this.shotWidth, 16);
      shootEffect.at(tile.drawx() + tr.x, tile.drawy() + tr.y, tile.bc().rotation);
      smokeEffect.at(tile.drawx() + tr.x, tile.drawy() + tr.y, tile.bc().rotation);
      this.shootSound.at(tile, Mathf.random(0.9, 1.1));
      
      tile.bc().recoilAmount = this.recoilAmount;
    }
  });
  
  IIEntity.setFrame(0);
  IIEntity.setTrueFrame(0);
  IIEntity.setFrameSpeed(0);
  IIEntity.setBarrel(-1);
  IIEntity.setShouldShoot(0);
  IIEntity.setShouldBarrel(0);
  for(i = 0; i < 4; i++){
    IIEntity.setBheat(i, 0);
    IIEntity.setHeatFrame(i, 0);
  }
  
  return IIEntity;
};