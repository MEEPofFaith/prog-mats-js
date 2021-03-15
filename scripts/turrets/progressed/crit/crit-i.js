const bul = require("libs/bulletTypes/critBulletType");
const eff = require("libs/PMfx");

const sparkle = eff.sparkleEffect(120, 240, 12, 32, 7);

const crit = bul.critBullet(BasicBulletType, {
  critEffect: sparkle,
  damage: 1000,
  speed: 20,
  lifetime: 30,
  pierce: true,
  pierceBuilding: true
});

const sniper = extend(ItemTurret, "sniper", {
  reloadTime: 450,
  inaccuracy: 0,
  size: 3,
  range: 544,
  split: 3,
  chargeTime: 300,
  shootLength: 12 + 6,
  chargeMoveFract: 0.5,

  load(){
    this.super$load();
    this.outlines = [];
    this.parts = [];

    for(let i = 0; i < 3; i++){
      this.outlines[i] = Core.atlas.find(this.name + "-outline-" + i);
      this.parts[i] = Core.atlas.find(this.name + "-part-" + i);
    }
  }
});

sniper.buildType = ent => {
  ent = extend(ItemTurret.ItemTurretBuild, sniper, {
    draw(){
      Draw.rect(sniper.baseRegion, this.x, this.y);
      
      Draw.z(Layer.turret);

      sniper.tr2.trns(this.rotation, -this.recoil);

      for(let i = 0; i < 3; i++){
        let tx = Angles.trnsx(this.rotation, sniper.split * this.charge * i);
        let ty = Angles.trnsy(this.rotation, sniper.split * this.charge * i);
        Drawf.shadow(sniper.outlines[i], this.x + sniper.tr2.x + tx - sniper.elevation, this.y + sniper.tr2.y + ty - sniper.elevation, this.rotation - 90);
      }

      for(let i = 0; i < 3; i++){
        let tx = Angles.trnsx(this.rotation, sniper.split * this.charge * i);
        let ty = Angles.trnsy(this.rotation, sniper.split * this.charge * i);
        Draw.rect(sniper.outlines[i], this.x + sniper.tr2.x + tx, this.y + sniper.tr2.y + ty, this.rotation - 90);
      }

      for(let i = 0; i < 3; i++){
        let tx = Angles.trnsx(this.rotation, sniper.split * this.charge * i);
        let ty = Angles.trnsy(this.rotation, sniper.split * this.charge * i);
        Draw.rect(sniper.parts[i], this.x + sniper.tr2.x + tx, this.y + sniper.tr2.y + ty, this.rotation - 90);
      }
    },
    updateTile(){
      if(this.charging && this.hasAmmo()){
        this.charge = Mathf.clamp(this.charge + Time.delta / sniper.chargeTime);
      }else{
        this.charge = 0;
      }

      this.super$updateTile();
    },
    updateShooting(){
      if(this.consValid()){
        if(this.reload >= sniper.reloadTime && !this.charging){
          let type = this.peekAmmo();

          this.shoot(type);

          this.reload = 0;
        }else if(this.hasAmmo()){
          this.reload += this.delta() * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed();
        }
      }
    },
    updateCooling(){
      if(this.hasAmmo() && this.consValid()){
        this.super$updateCooling();
      }else{
        this.reload = 0;
      }
    },
    turnToTarget(targetRot){
      this.rotation = Angles.moveToward(this.rotation, targetRot, this.efficiency() * sniper.rotateSpeed * this.delta() * (this.charging ? (1 - sniper.chargeMoveFract * this.charge) : 1));
    },
    shouldTurn(){
      return true;
    }
  });

  ent.charge = 0;
  return ent;
};

sniper.ammo(Items.thorium, crit);
sniper.setupRequirements(Category.turret, BuildVisibility.sandboxOnly, ItemStack.empty);