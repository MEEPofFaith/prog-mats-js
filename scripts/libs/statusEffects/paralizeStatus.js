module.exports = {
  paralizeStatus(statusName, dmgMult, healthMult, speedMult, reloadMult, dmgTick, rotScl, cooldown){
    const paralyze = extend(StatusEffect, statusName, {
      damageMultipler: dmgMult,
      healthMultiplier: healthMult,
      speedMultiplier: speedMult,
      reloadMultiplier: reloadMult,
      damage: dmgTick,
      color: Pal.lancerLaser,
      effect: Fx.lightningCharge,
      update(unit, time){
        unit.apply(StatusEffects.shocked, 10);
        var strength = Mathf.clamp(time / cooldown); //mmm yes steal
        for(var i = 0; i < unit.mounts.length; i++){
          var mount = unit.mounts[i];
          var weapon = mount.weapon;
          if(weapon.rotate){
            mount.rotation += Mathf.range(weapon.rotateSpeed * rotScl * strength);
          }
        }
        if(unit.type.flying == true && !unit.dead){
          unit.kill(); //Cut the engines. This can't possibly be op in any way.
        }else if(unit.type.canBoost && unit.boosting != null){
          unit.boosting = false;
        }
        if(!unit.dead) this.super$update(unit, time);
      }
    });
    return paralyze;
  }
}