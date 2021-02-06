const bfrit = (b, lifetime) => {
  if(b.fragBullet == null){
    var dmg = b.damage + b.splashDamage + b.lightningDamage * b.lightning * b.lightningLength;
  }else{
    var dmg = b.damage + b.splashDamage + b.lightningDamage * b.lightning * b.lightningLength + bfrit(b.fragBullet, b.lifetime) * b.fragBullets;
  }
  if(b instanceof ContinuousLaserBulletType){
    return dmg * lifetime / 5;
  }else{
    return dmg;
  }
};

const everythingGun = extend(PowerTurret, "everything-gun", {
  load(){
    this.super$load();
    this.baseRegion = Core.atlas.find("prog-mats-block-" + this.size);
  },
  init(){
    this.super$init();
    Vars.content.units().each(u => {
      u.weapons.each(w => {
        if(w.bullet != null){
          if(!w.bullet.killShooter){
            if(this.bullets.indexOf(w.bullet) == -1){
              this.bullets.add([w.bullet, w.shootSound, w.bullet.lifetime, false]);
            };
          }
        }
      });
    });
    Vars.content.blocks().each(b => {
      if(b != Vars.content.getByName(ContentType.block, "prog-mats-everything-gun") && b instanceof Turret){
        if(b instanceof LaserTurret){
          if(b.shootType != null){
            if(this.bullets.indexOf(b.shootType) == -1){
              this.bullets.add([b.shootType, b.shootSound, b.shootType.lifetime + b.shootDuration, true]);
            }
          }
        }else if(b instanceof PowerTurret){
          if(b.shootType != null){
            if(this.bullets.indexOf(b.shootType) == -1){
              this.bullets.add([b.shootType, b.shootSound, b.shootType.lifetime, false]);
            }
          }
        }else if(b instanceof ItemTurret){
          Vars.content.items().each(i => {
            if(b.ammoTypes.get(i) != null){
              if(this.bullets.indexOf(b.ammoTypes.get(i)) == -1){
                this.bullets.add([b.ammoTypes.get(i), b.shootSound, b.ammoTypes.get(i).lifetime, false]);
              }
            }
          });
        }
      }
    });
    
    this.bullets.sort(floatf(b => {return bfrit(b[0], b[2])}));
    // this.bullets.each(b => print("Bullet " + b[0] + " deals " + bfrit(b[0], b[2]) + " total damage."));
  },
  setStats(){
    this.super$setStats();
    this.stats.remove(Stat.damage);
    this.stats.add(Stat.damage, "[accent]yes[]");
  },
  health: 12345,
  reloadTime: 1,
  size: 6,
  category: Category.turret,
  requirements: ItemStack.empty,
  buildVisibility: BuildVisibility.sandboxOnly,
  powerUse: Mathf.PI,
  shootType: Bullets.standardCopper,
  range: 4400,
  shootLength: 0,
  shootCone: 1,
  cooldown: 0.01,
  scaledowm: 0.03,
  inaccuracy: 360,
  bullets: new Seq(),
  shootEffect: Fx.none,
  smokeEffect: Fx.none
});

const swirl = new Effect(120, 1000, e => {
  Tmp.v1.trns(Mathf.randomSeed(e.id, 360) + e.rotation * e.fin(), (16 + e.data[1]) * e.fin());
  Tmp.v1.add(e.x, e.y);
  
  Draw.color(e.color, Color.black, 0.25 + e.fin() * 0.75);
  Fill.circle(Tmp.v1.x , Tmp.v1.y, e.data[0] * e.fout());
});
swirl.layer = Layer.turret;

const max = 6000;

everythingGun.buildType = ent => {
  ent = extend(PowerTurret.PowerTurretBuild, everythingGun, {
    setEffs(){
      this.drawBias = 0;
      this.bias = 0.1;
      this.selectedBullet = 0;
      this.drawRot = Mathf.random(360);
    },
    updateTile(){
      this.super$updateTile();
      
      for(var i = 0; i < 1 + this.bias / (max / 100); i++){
        if(Mathf.chanceDelta(1)){
          swirl.at(this.x, this.y, Mathf.random(this.bias / (max / 45), this.bias / (max / 720)), this.team.color, [(4 + (this.bias / (max / 16))) + Mathf.sin((Time.time + Mathf.randomSeed(this.id)) / 30) * (this.bias / (max / 6)), this.bias / (max / 420) + Mathf.sin((Time.time + Mathf.randomSeed(this.id + 1)) / 30) * (this.bias / (max / 80))]);
        }
      }
      
      this.drawRot = Mathf.mod(this.drawRot - Time.delta * (this.bias / (max / 110)), 360);
      
      if(this.isShooting() && this.consValid()){
        this.bias = Mathf.clamp(this.bias * Mathf.pow(1.003, Time.delta), 0, max);
      }else{
        this.bias = Mathf.lerpDelta(this.bias, 0.1, everythingGun.scaledowm);
      }
    },
    updateShooting(){
      if(this.reload >= everythingGun.reloadTime){
        this.selectedBullet = Mathf.clamp(Mathf.floor(1 / (((1 / Mathf.random()) - 1) / this.bias + 1) * everythingGun.bullets.size), 0, everythingGun.bullets.size - 1);
        
        let type = this.peekAmmo();

        this.shoot(type);

        this.reload = 0;
      }else{
        this.reload += Time.delta * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed();
      }
    },
    effects(){
      everythingGun.shootEffect.at(this.x + everythingGun.tr.x, this.y + everythingGun.tr.y, this.rotation);
      everythingGun.smokeEffect.at(this.x + everythingGun.tr.x, this.y + everythingGun.tr.y, this.rotation);
      everythingGun.bullets.get(this.selectedBullet)[1].at(this.x + everythingGun.tr.x, this.y + everythingGun.tr.y, Mathf.random(0.9, 1.1));

      if(everythingGun.shootShake > 0){
        Effect.shake(everythingGun.shootShake, everythingGun.shootShake, this);
      }

      this.recoil = everythingGun.recoilAmount;
    },
    draw(){
      Draw.rect(everythingGun.baseRegion, this.x, this.y);
      Draw.z(Layer.turret);
      Drawf.shadow(everythingGun.region, this.x - (everythingGun.size / 2), this.y - (everythingGun.size / 2), this.drawRot);
      // Draw.rect(everythingGun.region, this.x, this.y, this.drawRot);
      Draw.rect(everythingGun.region, this.x, this.y, this.drawRot);
    },
    bullet(type, angle){
      var lifeScl = type.scaleVelocity ? Mathf.clamp(Mathf.dst(this.x + everythingGun.tr.x, this.y + everythingGun.tr.y, this.targetPos.x, this.targetPos.y) / type.range(), everythingGun.minRange / type.range(), everythingGun.range / type.range()) : 1;
      var laserScl = everythingGun.bullets.get(this.selectedBullet)[3] ? everythingGun.bullets.get(this.selectedBullet)[2]/this.peekAmmo().lifetime : 1;
      
      type.create(this, this.team, this.x + everythingGun.tr.x, this.y + everythingGun.tr.y, angle, 1 + Mathf.range(everythingGun.velocityInaccuracy), lifeScl * laserScl);
    },
    useAmmo(){
      return everythingGun.bullets.get(this.selectedBullet)[0];
    },
    peekAmmo(){
      return everythingGun.bullets.get(this.selectedBullet)[0];
    },
    turnToTarget(targetRot){
      this.rotation = targetRot;
    }
  });
  ent.setEffs();
  return ent;
}