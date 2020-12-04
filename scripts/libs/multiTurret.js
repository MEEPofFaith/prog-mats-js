module.exports = {
  newWeapon(){
  },
  newMultiTurret(type, build, name, amount){
    multiTur = extendContent(type, name, {});
    multiTur.buildType = ent => {
      ent = extendContent(build, multiTur, {
      }
      return ent;
    }
    return multiTur;
  }
}