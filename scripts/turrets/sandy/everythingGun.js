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
          if(this.bullets.indexOf(w.bullet) == -1) this.bullets.push(w.bullet);
        }
      });
    });
    Vars.content.blocks().each(b => {
      if(b != Vars.content.getByName(ContentType.block, "prog-mats-everything-gun") && b instanceof Turret){
        if(b instanceof PowerTurret){
          if(this.bullets.indexOf(b.shootType) == -1) this.bullets.push(b.shootType);
        }else if(b instanceof ItemTurret){
          Vars.content.items().each(i => {
            if(b.ammoTypes.get(i) != null){
              if(this.bullets.indexOf(b.ammoTypes.get(i)) == -1) this.bullets.push(b.ammoTypes.get(i));
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
    updateTile(){
      this.super$updateTile();
      if(Mathf.chanceDelta(1)){
        swirl.at(this.x, this.y, Mathf.random(180, 720), this.team.color);
        swirl.at(this.x, this.y, Mathf.random(180, 720), this.team.color);
      }
    },
    draw(){
      Draw.rect(everythingGun.baseRegion, this.x, this.y);
    },
    useAmmo(){
      return everythingGun.bullets[Mathf.round(Mathf.random(everythingGun.bullets.length - 1))];
    },
    peekAmmo(){
      return everythingGun.bullets[Mathf.round(Mathf.random(everythingGun.bullets.length - 1))];
    }
  });
  return ent;
}