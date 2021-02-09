const bul = require("libs/bulletTypes/strikeBulletType");
const eff = require("libs/effect");

const trail = eff.trailEffect(50, false, 1);
trail.layer = Layer.bullet;

const boom = eff.scaledLargeBlast(0.5);

const missile = bul.strikeBullet(false, 0, false, 6, false, true, true);
missile.sprite = "prog-mats-storm";
missile.width = 6;
missile.height = 8;
missile.engineSize = 5;
missile.trailSize = 0.2;
missile.bulletOffset = 4;
missile.damage = 28;
missile.splashDamage = 72;
missile.splashDamageRadius = 30;
missile.speed = 2.4;
missile.homingPower = 0.035;
missile.homingRange = 200;
missile.cooldown = 0.001;
missile.lifetime = 90;
missile.elevation = 300;
missile.riseTime = 30;
missile.fallTime = 20;
missile.ammmoMultiplier = 4;
missile.targetRad = 0.5;
missile.hitSound = Sounds.explosion;
missile.collidesAir = false;
missile.hitShake = 3;
missile.weaveWidth = 12;
missile.weaveSpeed = 1;
missile.trailParam = 3;
missile.trailEffect = trail;
missile.despawnEffect = boom;
// missile.rocketEffect = Fx.rocketSmokeLarge;

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
  shootSound: Sounds.artillery,
  cooldown: 0.005,
  shootShake: 1,
  targetAir: false,
  burstSpacing: 7,
  shots: 9,
  inaccuracy: 30,
  shootEffect: Fx.none,
  smokeEffect: Fx.none,
  maxAmmo: 36,
  ammoPerShot: 9,
  xOffsets: [-31/4, 0, 31/4, -29/4, 0, 29/4, -31/4, 0, 31/4],
  yOffsets: [31/4, 29/4, 31/4, 0, 0, 0, -31/4, -29/4, -31/4],
  rotateSpeed: 9999
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
              Drawf.construct(x, y, missileRegion, 0, this.reload / actualSwarmer.reloadTime, this._speedScl, this.reload);
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
    }
  });
  ent.setEffs();
  return ent;
};
/**
 * Easy to read research requirement list
 *
 * copper/69
**/
// actualSwarmer.requirements(Category.turret, BuildVisibility.sandboxOnly, ItemStack.with(Items.copper, 69));
actualSwarmer.requirements = ItemStack.with(Items.copper, 69);
actualSwarmer.category = Category.turret;
actualSwarmer.buildVisibility = BuildVisibility.sandboxOnly;