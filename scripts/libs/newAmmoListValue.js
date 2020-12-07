module.exports = (bullet) => {
  const b = new StatValue({
    display(table){
      table.row();
      
      table.table(null, bt => {
        const type = bullet;
        bt.left().defaults().padRight(3).left();
        
        if(type.damage > 0 && (type.collides || type.splashDamage <= 0)){
          this.sep(bt, Core.bundle.format("bullet.damage", type.damage));
        }

        if(type.splashDamage > 0){
          bt.add(Core.bundle.format("bullet.splashdamage", type.splashDamage, Strings.fixed(type.splashDamageRadius / Vars.tilesize, 1)));
        }

        if(!Mathf.equal(type.reloadMultiplier, 1)){
          this.sep(bt, Core.bundle.format("bullet.reload", Strings.fixed(type.reloadMultiplier, 1)));
        }

        if(type.knockback > 0){
          this.sep(bt, Core.bundle.format("bullet.knockback", Strings.fixed(type.knockback, 1)));
        }

        if(type.healPercent > 0){
          this.sep(bt, Core.bundle.format("bullet.healpercent", type.healPercent));
        }

        if(type.pierce || type.pierceCap != -1){
          this.sep(bt, type.pierceCap == -1 ? "@bullet.infinitepierce" : Core.bundle.format("bullet.pierce", type.pierceCap));
        }

        if(type.status == StatusEffects.burning || type.status == StatusEffects.melting || type.incendAmount > 0){
          this.sep(bt, "@bullet.incendiary");
        }

        if(type.status == StatusEffects.freezing){
          this.sep(bt, "@bullet.freezing");
        }

        if(type.status == StatusEffects.tarred){
          this.sep(bt, "@bullet.tarred");
        }

        if(type.status == StatusEffects.sapped){
          this.sep(bt, "@bullet.sapping");
        }

        if(type.homingPower > 0.01){
          this.sep(bt, "@bullet.homing");
        }

        if(type.lightning > 0){
          this.sep(bt, "@bullet.shock");
        }

        if(type.fragBullet != null){
          this.sep(bt, "@bullet.frag");
        }
      }).padTop(0).left().get();
      
      table.row();
    },
    sep(table, text){
      table.row();
      table.add(text);
    }
  });
  
  return b;
}