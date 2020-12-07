const newAmmoListValue = require("libs/newAmmoListValue");
module.exports = (weapon, icon, bullet) => {
  const w = new StatValue({
    display(table){
      table.image(icon).size(60).scaling(Scaling.bounded).right().top();
      
      table.table(Tex.underline, w => {
        w.left().defaults().padRight(3).left();

        if(weapon.inaccuracy > 0){
          this.sep(w, "[lightgray]" + Stat.inaccuracy.localized() + ": [white]" + weapon.inaccuracy + " " + StatUnit.degrees.localized());
        }
        if(weapon.range > 0){
          this.sep(w, "[lightgray]" + Stat.shootRange.localized() + ": [white]" + Strings.fixed(weapon.range / Vars.tilesize, 1) + " " + StatUnit.blocks);
        }
        this.sep(w, "[lightgray]" + Stat.reload.localized() + ": [white]" + Strings.autoFixed(60 / weapon.reloadTime * weapon.shots, 1));
        
        this.sep(w, "[lightgray]" + Stat.targetsAir.localized() + ": [white]" + (!weapon.targetAir ? Core.bundle.get("no") : Core.bundle.get("yes")));
        this.sep(w, "[lightgray]" + Stat.targetsGround.localized() + ": [white]" + (!weapon.targetGround ? Core.bundle.get("no") : Core.bundle.get("yes")));
        
        const b = newAmmoListValue(bullet);
        b.display(w);
      }).padTop(-9).left();
      table.row();
    },
    sep(table, text){
      table.row();
      table.add(text);
    }
  });
  
  return w;
}