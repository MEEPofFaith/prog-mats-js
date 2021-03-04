module.exports = {
  particleBullet(color, uSound, uSoundChance, uSoundMinPitch, uSoundMaxPitch, obj){
    const particleEffect = new Effect(38, e => {
      Draw.color(color);

      Angles.randLenVectors(e.id, 2, 1 + 20 * e.fout(), e.rotation, 120, (x, y) => {
        Drawf.tri(e.x + x, e.y + y, e.fslope() * 3 + 1, e.fslope() * 3 + 1, Mathf.angle(x, y));
      });
    });
    
    if(obj == undefined) obj = {};
    obj = Object.assign({
      hittable: false,
      absorbable: false,
      reflectable: false,
      collidesTiles: false,
      pierce: true,
      trailEffect: particleEffect,
      trailChance: 0.5,
      hitColor: color,
      damage: 0,
      speed: 8,
      lifetime: 32,
      hitEffect: Fx.none,
      despawnEffect: Fx.none,
      init(b){
        if(!b) return;
        b.fdata = -69420;
        this.super$init(b);
      },
      update(b){
        if(Mathf.chanceDelta(uSoundChance)) uSound.at(b.x, b.y, Mathf.random(uSoundMinPitch, uSoundMaxPitch), 1);
        this.super$update(b);
      }
    }, obj);
    
    const particle = extend(BulletType, obj);
    
    return particle;
  }
}