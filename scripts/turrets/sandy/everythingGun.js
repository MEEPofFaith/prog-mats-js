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

const everythingGun = extendContent(PowerTurret, "everything-gun", {
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
              this.bullets.add([w.bullet, w.shootSound, w.bullet.lifetime]);
            };
          }
        }
      });
    });
    Vars.content.blocks().each(b => {
      if(b != Vars.content.getByName(ContentType.block, "prog-mats-everything-gun") && b instanceof Turret){
        if(b instanceof PowerTurret){
          if(b.shootType != null){
            if(this.bullets.indexOf(b.shootType) == -1){
              this.bullets.add([b.shootType, b.shootSound, b.shootType.lifetime]);
            }
          }
        }else if(b instanceof ItemTurret){
          Vars.content.items().each(i => {
            if(b.ammoTypes.get(i) != null){
              if(this.bullets.indexOf(b.ammoTypes.get(i)) == -1){
                this.bullets.add([b.ammoTypes.get(i), b.shootSound, b.ammoTypes.get(i).lifetime]);
              }
            }
          });
        }
      }
    });
    
    this.bullets.sort(floatf(b => {return bfrit(b[0], b[2])}));
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
  requirements: ItemStack.with(),
  buildVisibility: BuildVisibility.sandboxOnly,
  powerUse: Mathf.PI,
  shootType: Bullets.standardCopper,
  range: 4400,
  shootLength: 0,
  shootCone: 360,
  rotateSpeed: 360,
  cooldown: 0.01,
  bullets: new Seq()
});

const swirl = new Effect(90, e => {
  Tmp.v1.trns(Mathf.randomSeed(e.id, 360) + e.rotation * e.fin(), 32 * e.fin());
  Tmp.v1.add(e.x, e.y);
  
  Draw.color(e.color, Color.black, 0.25 + e.fin() * 0.75);
  Fill.circle(Tmp.v1.x , Tmp.v1.y, e.data * e.fout());
});
swirl.layer = Layer.turret;

everythingGun.buildType = ent => {
  ent = extendContent(PowerTurret.PowerTurretBuild, everythingGun, {
    setEffs(){
      this._bias = 0.1;
      this._sel = 0;
      this._drawRot = Mathf.random(360);
    },
    updateTile(){
      this.super$updateTile();
      if(Mathf.chanceDelta(1)){
        swirl.at(this.x, this.y, Mathf.random(180, 720), this.team.color, 10 + Mathf.sin(Time.time / 30) * 3);
      }
      this._drawRot -= Time.delta * (0.01 + (Interp.pow2In.apply(this.heat) * 4.99));
      if(this.isShooting() && this.consValid()){
        this._bias *= Mathf.pow(1.003, Time.delta);
      }else{
        this._bias = Mathf.lerpDelta(this._bias, 0.1, 0.01);
      }
    },
    updateShooting(){
      if(this.reload >= everythingGun.reloadTime){
        this._sel = Mathf.clamp(Mathf.floor(1 / (((1 / Mathf.random()) - 1) / this._bias + 1) * everythingGun.bullets.size), 0, everythingGun.bullets.size - 1);
        
        let type = this.peekAmmo();

        this.shoot(type);

        this.reload = 0;
      }else{
        this.reload += Time.delta * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed();
      }
    },
    effects(){
      let fshootEffect = everythingGun.shootEffect == Fx.none ? this.peekAmmo().shootEffect : everythingGun.shootEffect;
      let fsmokeEffect = everythingGun.smokeEffect == Fx.none ? this.peekAmmo().smokeEffect : everythingGun.smokeEffect;

      fshootEffect.at(this.x + everythingGun.tr.x, this.y + everythingGun.tr.y, this.rotation);
      fsmokeEffect.at(this.x + everythingGun.tr.x, this.y + everythingGun.tr.y, this.rotation);
      everythingGun.bullets.get(this._sel)[1].at(this.x + everythingGun.tr.x, this.y + everythingGun.tr.y, Mathf.random(0.9, 1.1));

      if(everythingGun.shootShake > 0){
        Effect.shake(everythingGun.shootShake, everythingGun.shootShake, this);
      }

      this.recoil = everythingGun.recoilAmount;
    },
    draw(){
      Draw.rect(everythingGun.baseRegion, this.x, this.y);
      Draw.z(Layer.turret);
      Drawf.shadow(everythingGun.region, this.x - (everythingGun.size / 2), this.y - (everythingGun.size / 2), this._drawRot);
      Draw.rect(everythingGun.region, this.x, this.y, this._drawRot);
    },
    useAmmo(){
      return everythingGun.bullets.get(this._sel)[0];
    },
    peekAmmo(){
      return everythingGun.bullets.get(this._sel)[0];
    }
  });
  ent.setEffs();
  return ent;
}