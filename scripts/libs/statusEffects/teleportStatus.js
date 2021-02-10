const fLib = this.global.pm.funcLib;

module.exports = {
  teleportStatus(statusName, dmgMult, healthMult, speedMult, reloadMult, dmgTick, tpRnd, tpDamageScl, cooldown){
    const effLifetime = 60;
    const teleportEffect = new Effect(effLifetime, tpRnd * 10, e => {
      Draw.mixcol(Color.valueOf("EFE4CA"), 1);
      Draw.color(1, 1, 1, e.fout());
      
      Lines.stroke(4 * e.fout());
      Lines.line(e.x, e.y, e.data[1], e.data[2]);
      fLib.simpleUnitDrawerStatic(e.data[0], false, e.x, e.y, e.fout(), e.rotation - 90, e.data[0].mounts);
      
      Draw.color();
      Draw.mixcol();
    });
    const teleportAfterEffect = new Effect(effLifetime, tpRnd * 10, e => {
      Draw.mixcol(Color.valueOf("EFE4CA"), 1);
      Draw.color(1, 1, 1, e.fout());
      
      fLib.simpleUnitDrawerStatic(e.data, false, e.x, e.y, e.fout(), e.rotation - 90, e.data.mounts);
      
      Draw.color();
      Draw.mixcol();
    });
    
    const suffer = extend(StatusEffect, statusName, {
      damageMultipler: dmgMult,
      healthMultiplier: healthMult,
      speedMultiplier: speedMult,
      reloadMultiplier: reloadMult,
      damage: dmgTick,
      color: Pal.lancerLaser,
      effect: Fx.overdriven,
      update(unit, time){
        var strength = Mathf.clamp(time / cooldown); //mmm yes steal
        if(strength > 0.001){
          Tmp.v1.rnd(Mathf.random(tpRnd * strength / 2, tpRnd * strength));
          Tmp.v1.add(unit.x, unit.y);
          teleportEffect.at(unit.x, unit.y, unit.rotation, [unit, Tmp.v1.x, Tmp.v1.y]);
          unit.set(Tmp.v1.x, Tmp.v1.y);
          unit.rotation += Mathf.range(180 * strength);
          let hit = Mathf.clamp(unit.type.hitSize * tpDamageScl * strength, 0.1, unit.maxHealth);
          unit.damagePierce(hit);
          unit.maxHealth -= hit;
          if(unit.maxHealth < 0 || unit.health < 0){
            unit.killed();
          }
          teleportAfterEffect.at(unit.x, unit.y, unit.rotation, unit);
          for(var i = 0; i < unit.mounts.length; i++){
            var mount = unit.mounts[i];
            var weapon = mount.weapon;
            if(weapon.rotate){
              mount.rotation += Mathf.range(180 * strength);
              mount.reload = Mathf.random(0, weapon.reload);
            }
          }
        }
        if(!unit.dead) this.super$update(unit, time);
      }
    });
    return suffer;
  }
}