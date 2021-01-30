const everythingGun = extendContent(PowerTurret, "everything-gun", {
  load(){
    this.super$load();
    this.baseRegion = Core.atlas.find("prog-mats-block-" + this.size);
  },
  init(){
    this.super$init();
    Vars.content.units().each(u => {
      u.weapons.each(w => {
        if(!w.bullet.killShooter){
          if(this.bullets.indexOf(w.bullet) == -1){
            this.sounds.push(w.shootSound);
            this.bullets.push(w.bullet);
          };
        }
      });
    });
    Vars.content.blocks().each(b => {
      if(b != Vars.content.getByName(ContentType.block, "prog-mats-everything-gun") && b instanceof Turret){
        if(b instanceof PowerTurret){
          if(this.bullets.indexOf(b.shootType) == -1){
            this.sounds.push(b.shootSound);
            this.bullets.push(b.shootType);
          }
        }else if(b instanceof ItemTurret){
          Vars.content.items().each(i => {
            if(b.ammoTypes.get(i) != null){
              if(this.bullets.indexOf(b.ammoTypes.get(i)) == -1){
                this.sounds.push(b.shootSound);
                this.bullets.push(b.ammoTypes.get(i));
              }
            }
          });
        }
      }
    });
  },
  setStats(){
    this.super$setStats();
    this.stats.remove(Stat.damage);
    this.stats.add(Stat.damage, "[red]yes[]");
  },
  reloadTime: 1,
  size: 6,
  category: Category.turret,
  requirements: ItemStack.with(Items.copper, 69),
  buildVisibility: BuildVisibility.sandboxOnly,
  powerUse: Mathf.PI,
  shootType: Bullets.standardCopper,
  range: 300,
  shootLength: 0,
  shootCone: 360,
  rotateSpeed: 360,
  sounds: [],
  bullets: []
});

const swirl = new Effect(90, e => {
  Tmp.v1.trns(Mathf.randomSeed(e.id, 360) + e.rotation * e.fin(), 32 * e.fin());
  Tmp.v1.add(e.x, e.y);
  
  Draw.color(e.color, Color.black, 0.25 + e.fin() * 0.75);
  Fill.circle(Tmp.v1.x , Tmp.v1.y, 8 * e.fout());
});
swirl.layer = Layer.turret;

everythingGun.buildType = ent => {
  ent = extendContent(PowerTurret.PowerTurretBuild, everythingGun, {
    setEffs(){
      this._sel = Mathf.round(Mathf.random(everythingGun.bullets.length - 1));
    },
    updateTile(){
      this.super$updateTile();
      if(Mathf.chanceDelta(1)){
        swirl.at(this.x, this.y, Mathf.random(180, 720), this.team.color);
        swirl.at(this.x, this.y, Mathf.random(180, 720), this.team.color);
      }
    },
    updateShooting(){
      if(this.reload >= everythingGun.reloadTime){
        this._sel = Mathf.round(Mathf.random(everythingGun.bullets.length - 1));
        
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
      everythingGun.sounds[this._sel].at(this.x + everythingGun.tr.x, this.y + everythingGun.tr.y, Mathf.random(0.9, 1.1));

      if(everythingGun.shootShake > 0){
        Effect.shake(everythingGun.shootShake, everythingGun.shootShake, this);
      }

      this.recoil = everythingGun.recoilAmount;
    },
    draw(){
      Draw.rect(everythingGun.baseRegion, this.x, this.y);
    },
    useAmmo(){
      return everythingGun.bullets[this._sel];
    },
    peekAmmo(){
      return everythingGun.bullets[this._sel];
    }
  });
  ent.setEffs();
  return ent;
}