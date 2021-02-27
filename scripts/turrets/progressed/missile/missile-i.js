const bul = require("libs/bulletTypes/strikeBulletType");
const eff = require("libs/effect");

const trail = eff.trailEffect(50, 100, -1);
trail.layer = Layer.bullet;

const boom = eff.scaledLargeBlast(0.5);

//(autodrop, drop radius, stop?, stop radius, unstop?, start on owner, given data, snap rot, extra stuff);

const missile = bul.strikeBullet(false, 0, true, 8, false, true, true, false, {
  sprite: "prog-mats-storm",
  riseEngineSize: 5,
  fallEngineSize: 5,
  trailSize: 0.2,
  damage: 28,
  splashDamage: 72,
  splashDamageRadius: 30,
  speed: 2.4,
  homingPower: 0.035,
  homingRange: 200,
  cooldown: 0.001,
  lifetime: 90,
  elevation: 150,
  riseTime: 30,
  fallTime: 20,
  ammmoMultiplier: 4,
  targetRad: 0.5,
  hitSound: Sounds.explosion,
  collidesAir: false,
  hitShake: 3,
  weaveWidth: 12,
  weaveSpeed: 0.5,
  trailParam: 3,
  trailEffect: trail,
  despawnEffect: boom
});

const actualSwarmer = extend(ItemTurret, "missile-i", {
  load(){
    this.super$load();
    this.heatRegions = [];
    for(var i = 0; i < 9; i++){
      this.heatRegions[i] = Core.atlas.find(this.name + "-heat-" + i);
    }
  },
  health: 1430,
  size: 3,
  range: 160,
  reloadTime: 75,
  shootSound: Sounds.missile,
  cooldown: 0.005,
  shootShake: 1,
  targetAir: false,
  burstSpacing: 7,
  shots: 9,
  inaccuracy: 15,
  shootEffect: Fx.none,
  smokeEffect: Fx.none,
  maxAmmo: 36,
  ammoPerShot: 9,
  xOffsets: [-31/4, 0, 31/4, -29/4, 0, 29/4, -31/4, 0, 31/4],
  yOffsets: [31/4, 29/4, 31/4, 0, 0, 0, -31/4, -29/4, -31/4],
  /**
   * Easy to read research requirement list
   *
   * copper/180
   * graphite/140
   * silicon/65
   * titanium/70
  **/
  requirements: ItemStack.with(Items.copper, 180, Items.graphite, 140, Items.silicon, 65, Items.titanium, 70),
  category: Category.turret,
  buildVisibility: BuildVisibility.shown
});
actualSwarmer.ammo(Items.blastCompound, missile);

actualSwarmer.buildType = ent => {
  ent = extend(ItemTurret.ItemTurretBuild, actualSwarmer, {
    setEffs(){
      this.heats = [];
      this.shot = [];
      for(var i = 0; i < 9; i++){
        this.heats[i] = 0;
        this.shot[i] = false;
      }
      this.firing = false;
      this._speedScl = 0;
    },
    draw(){
      Draw.rect(actualSwarmer.baseRegion, this.x, this.y);
      Draw.rect(actualSwarmer.region, this.x, this.y);
      
      if(this.hasAmmo() && this.peekAmmo() != null){
        Draw.draw(Draw.z(), () => {
          for(var i = 0; i < actualSwarmer.shots; i++){
            if(!this.shot[i]){
              let x = actualSwarmer.xOffsets[i] + this.x;
              let y = actualSwarmer.yOffsets[i] + this.y;
              let missileRegion = Core.atlas.find(this.peekAmmo().sprite);
              Drawf.construct(x, y, missileRegion, this.team.color, 0, this.reload / actualSwarmer.reloadTime, this._speedScl, this.reload);
            }
          }
        });
      }
      
      for(var i = 0; i < actualSwarmer.shots; i++){
        if(actualSwarmer.heatRegions[i] != Core.atlas.find("error") && this.heats[i] > 0.001){
          Draw.color(actualSwarmer.heatColor, this.heats[i]);
          Draw.blend(Blending.additive);
          Draw.rect(actualSwarmer.heatRegions[i], this.x, this.y);
          Draw.blend();
          Draw.color();
        }
      }
    },
    updateTile(){
      this.super$updateTile();
      for(var i = 0; i < 9; i++){
        this.heats[i] = Mathf.lerpDelta(this.heats[i], 0, actualSwarmer.cooldown);
      }
      
      if(this.reload < actualSwarmer.reloadTime && this.hasAmmo() && this.consValid() && !this.firing){
        this._speedScl = Mathf.lerpDelta(this._speedScl, 1, 0.05);
      }else{
        this._speedScl = Mathf.lerpDelta(this._speedScl, 0, 0.05);
      }
    },
    updateCooling(){
      if(!this.firing && this.hasAmmo() && this.consValid()){
        const liquid = this.liquids.current();
        var maxUsed = actualSwarmer.consumes.get(ConsumeType.liquid).amount;

        var used = Math.min(Math.min(this.liquids.get(liquid), maxUsed * Time.delta), Math.max(0, ((actualSwarmer.reloadTime - this.reload) / actualSwarmer.coolantMultiplier) / liquid.heatCapacity)) * this.baseReloadSpeed();
        this.reload += used * liquid.heatCapacity * actualSwarmer.coolantMultiplier;
        this.liquids.remove(liquid, used);

        if(Mathf.chance(0.06 * used)){
          actualSwarmer.coolEffect.at(this.x + Mathf.range(actualSwarmer.size * Vars.tilesize / 2), this.y + Mathf.range(actualSwarmer.size * Vars.tilesize / 2));
        }
      }
    },
    updateShooting(){
      if(this.hasAmmo() && this.consValid()){
        if(this.reload > actualSwarmer.reloadTime && !this.firing){
          var type = this.peekAmmo();
          
          this.shoot(type);
        }else if(!this.firing){
          this.reload += Time.delta * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed();
        }
      }
    },
    shoot(type){
      this.firing = true;
      
      for(var i = 0; i < actualSwarmer.shots; i++){
        const sel = i;
        Time.run(actualSwarmer.burstSpacing * i, () => {
          if(!this.isValid() || !this.hasAmmo()) return;
          var x = actualSwarmer.xOffsets[sel] + this.x;
          var y = actualSwarmer.yOffsets[sel] + this.y;
          
          type.create(this, this.team, x, y, this.rotation + Mathf.range(actualSwarmer.inaccuracy), -1, 1 + Mathf.range(actualSwarmer.velocityInaccuracy), 1, [x, y, 0, false]);
          this.effects();
          this.heats[sel] = 1;
          this.shot[sel] = true;
        });
      }
      this.useAmmo();
      
      Time.run(actualSwarmer.burstSpacing * actualSwarmer.shots, () => {
        this.reload = 0;
        this.firing = false;
        for(var i = 0; i < actualSwarmer.shots; i++){
          this.shot[i] = false;
        }
      });
    },
    turnToTarget(targetRot){
      this.rotation = targetRot;
    }
  });
  ent.setEffs();
  return ent;
};