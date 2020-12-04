module.exports = {
  newMount(b){
    const mount = new ObjectMap();
    mount.x = 0;
    mount.y = 0;
    mount.shootX = 0;
    mount.shootY = 0;
    mount.reload = 30;
    mount.bullet = b;
    mount.recoil = 1;
    mount.restitution = 1;
    mount.heatColor = Color.clear;
    mount.cooldown = 1;
    mount.sprite;
    mount.range;
    mount.rotateSpeed;
    mount.shootEffect;
    mount.smokeEffect;
    
    return mount;
  },
  newMultiTurret(type, build, name, amount){
    multiTur = extendContent(type, name, {});
    multiTur.buildType = ent => {
      ent = extendContent(build, multiTur, {
      }
      return ent;
    }
    multiTur.mounts;
    return multiTur;
  }
}