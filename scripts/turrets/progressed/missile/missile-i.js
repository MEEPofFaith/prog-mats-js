const bul = require("libs/bulletTypes/strikeBulletType");
const eff = require("libs/effect");

const trail = eff.trailEffect(50, false, 1);
trail.layer = Layer.flyingUnitLow - 2;

const boom = eff.scaledLargeBlast(0.5);

const missile = bul.strikeBullet(false, 0, 6, false, false, true);
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
missile.ammmoMultiplier = 7;
missile.targetRad = 0.5;
missile.hitSound = Sounds.explosion;
missile.collidesAir = false;
missile.hitShake = 3;
missile.weaveWidth = 12;
missile.weaveSpeed = 1;
missile.trailParam = 3;
missile.trailEffect = trail;
missile.despawnEffect = boom;

const actualSwarmer = extendContent(ItemTurret, "missile-i", {
  load(){
    this.super$load();
    this.heatRegions = [];
    for(var i = 0; i < 9; i++){
      this.heatRegions[i] = Core.atlas.find(this.name + "-heat-" + i);
    }
  }
});

actualSwarmer.buildType = ent => {
  ent = extendContent(ItemTurret.ItemTurretBuild, actualSwarmer, {
    setEffs(){
      this.heats = [];
      for(var i = 0; i < 9; i++){
        this.heats[i] = 0;
      }
      this.firing = false;
    },
    draw(){
      Draw.rect(actualSwarmer.baseRegion, this.x, this.y);
      Draw.rect(actualSwarmer.region, this.x, this.y);
      
      for(var i = 0; i < 9; i++){
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
    },
    updateCooling(){
      if(!this.firing){
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
      if(this.reload > actualSwarmer.reloadTime && !this.firing){
        var type = this.peekAmmo();
        
        this.shoot(type);
        
        this.reload = 0;
      }else if(!this.firing){
        this.reload += Time.delta * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed();
      }
    },
    shoot(type){
      this.firing = true;
      
      for(var i = 0; i < actualSwarmer.shots; i++){
        const sel = i;
        Time.run(actualSwarmer.burstSpacing * i, () => {
          if(!this.isValid() || !this.hasAmmo()) return;
          var x = actualSwarmer.xOffsets[sel] + this.x;
          var y = actualSwarmer.yOffsets[sel] + this.y
          
          type.create(this, this.team, x, y, this.rotation + Mathf.range(actualSwarmer.inaccuracy), -1, 1 + Mathf.range(actualSwarmer.velocityInaccuracy), 1, [x, y, 0, false]);
          this.effects();
          this.useAmmo();
          this.heats[sel] = 1;
        });
      }
      
      Time.run(actualSwarmer.burstSpacing * actualSwarmer.shots, () => {
        this.firing = false;
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
var offset = 8;
var shift = 1;
actualSwarmer.requirements = ItemStack.with(Items.copper, 69);
actualSwarmer.burstSpacing = 5;
actualSwarmer.shots = 9;
actualSwarmer.inaccuracy = 45;
actualSwarmer.ammo(Items.blastCompound, missile);
actualSwarmer.shootEffect = Fx.none;
actualSwarmer.smokeEffect = Fx.none;
actualSwarmer.maxAmmo = 36;
actualSwarmer.xOffsets = [-offset, 0, offset, -offset + shift, 0, offset - shift, -offset, 0, offset];
actualSwarmer.yOffsets = [offset, offset - shift, offset, 0, 0, 0, -offset, -offset + shift, -offset];
actualSwarmer.rotateSpeed = 9999;