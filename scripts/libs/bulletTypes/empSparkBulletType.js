module.exports = {
  spark(dmgMult, healthMult, speedMult, reloadMult, dmgTick, rotRnd){
    const paralyze = extend(StatusEffect, "cease", {
      damageMultipler: dmgMult,
      healthMultiplier: healthMult,
      speedMultiplier: speedMult,
      reloadMultiplier: reloadMult,
      damage: dmgTick,
      color: Pal.lancerLaser,
      effect: Fx.lightningCharge,
      update(unit, time){
        unit.apply(StatusEffects.shocked, 10);
        for(var i = 0; i < unit.mounts.length; i++){
          var mount = unit.mounts[i];
          var weapon = mount.weapon;
          if(weapon.rotate){
            mount.rotation += Mathf.range(rotRnd);
          }
        }
        this.super$update(unit, time);
      }
    });
    
    const emp = extend(BulletType, {
      hittable: false,
      absorbable: false,
      reflectable: false,
      collidesTiles: false,
      pierce: true,
      status: paralyze,
      statusDuration: 600,
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