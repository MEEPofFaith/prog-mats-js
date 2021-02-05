module.exports = {
  spark(statusName, dmgMult, healthMult, speedMult, reloadMult, dmgTick, rotRnd){
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
        var strength = Mathf.clamp(time / 120); //mmm yes steal
        for(var i = 0; i < unit.mounts.length; i++){
          var mount = unit.mounts[i];
          var weapon = mount.weapon;
          if(weapon.rotate){
            mount.rotation += Mathf.range(rotRnd * strength);
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
    
    const emp = extend(BulletType, {
      hittable: false,
      absorbable: false,
      reflectable: false,
      collidesTiles: false,
      pierce: true,
      status: paralyze,
      statusDuration: 60 * 5,
      trailEffect: Fx.lightningCharge,
      trailChance: 0.5,
      hitColor: Pal.lancerLaser,
      damage: 0,
      speed: 8,
      lifetime: 32,
      hitEffect: Fx.none,
      despawnEffect: Fx.none,
      init(b){
        if(!b) return;
        b.fdata = -69420;
        this.super$init(b);
      }
    });
    
    return emp;
  }
}