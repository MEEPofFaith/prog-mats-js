const bul = require("libs/bulletTypes/nukeBulletType");
const type = require("libs/turretTypes/stationaryTurretType");
const eff = require("libs/effect");

const trail = eff.trailEffect(240, false, 1);
trail.layer = Layer.flyingUnitLow - 2;

const boom = eff.scaledNuclearExplosion(4, 0.75, 80, true);

const missile = bul.nukeBullet(true, 32, 20, false, true, false);
missile.sprite = "prog-mats-nuke";
missile.width = 20;
missile.height = 40;
missile.riseEngineSize = 24;
missile.fallEngineSize = 14;
missile.trailSize = 1;
missile.bulletOffset = 20;
missile.damage = 15000;
missile.splashDamage = 30000;
missile.splashDamageRadius = 800;
missile.speed = 1;
missile.homingPower = 0.05;
missile.homingRange = 4440;
missile.lifetime = 4500;
missile.elevation = 900;
missile.riseTime = 240;
missile.fallTime = 90;
missile.ammmoMultiplier = 1;
missile.hitSound = Sounds.bang;
missile.hitShake = 30;
missile.trailParam = 8;
missile.targetRad = 2;
missile.trailChance = 0.2;
missile.trailEffect = trail;
missile.despawnEffect = boom;
missile.riseSpin = 720;
missile.fallSpin = 180;

const NUKE = extendContent(ItemTurret, "missile-iii", {
  load(){
    this.super$load();
    this.nukeRegion = Core.atlas.find("prog-mats-nuke");
  },
  icons(){
    return [this.baseRegion, this.region];
  }
});

NUKE.buildType = ent => {
  ent = extendContent(ItemTurret.ItemTurretBuild, NUKE, {
    setEffs(){
      this.speedScl = 0;
    },
    draw(){
      Draw.rect(NUKE.baseRegion, this.x, this.y);
      
      // Don't use this is clips through the bottom anyways.
      // var reload = Mathf.curve(this.reload, NUKE.reloadTime / 3, NUKE.reloadTime / 3 * 2);
      // Draw.alpha(reload);
      // Draw.rect(NUKE.nukeRegion, this.x, this.y - (NUKE.nukeRegion.height / 4 * (1 - reload)));
      // Draw.reset();
      
      Draw.draw(Draw.z(), () => {
        Drawf.construct(this.x, this.y, NUKE.nukeRegion, 0, this.reload / NUKE.reloadTime, this.speedScl, this.reload);
      });
      
      Draw.rect(NUKE.region, this.x, this.y);
      
      if(Core.atlas.isFound(NUKE.heatRegion) && this.heat > 0.001){
        Draw.color(NUKE.heatColor, this.heat);
        Draw.blend(Blending.additive);
        Draw.rect(NUKE.heatRegion, this.x, this.y);
        Draw.blend();
        Draw.color();
      }
    },
    updateTile(){
      this.super$updateTile();
      if(this.reload < NUKE.reloadTime){
        this.speedScl = Mathf.lerpDelta(this.speedScl, 1, 0.05);
      }else{
        this.speedScl = Mathf.lerpDelta(this.speedScl, 0, 0.05);
      }
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
NUKE.reloadTime = 1500;
NUKE.outlineIcon = false;
NUKE.shootLength = 0;
NUKE.requirements = ItemStack.with(Items.copper, 69);
NUKE.ammo(Items.blastCompound, missile);
NUKE.ammoPerShot = 20;
NUKE.maxAmmo = 40;