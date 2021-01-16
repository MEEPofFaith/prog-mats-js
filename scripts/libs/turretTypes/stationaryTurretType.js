//Haha code steal go brrrr
const clone = obj => {
    if(obj === null || typeof(obj) !== 'object') return obj;
    var copy = obj.constructor();
    for(var attr in obj) {
        if(obj.hasOwnProperty(attr)) {
            copy[attr] = obj[attr];
        }
    };
    return copy;
}

module.exports = {
  stationaryTurret(drawBase, type, build, name, obj, objb){
    if(obj == undefined) obj = {};
    if(objb == undefined) objb = {};
    obj = Object.assign(obj);
    objb = Object.assign({
      draw(){
        if(drawBase) Draw.rect(nospin.baseRegion, this.x, this.y);
        Draw.rect(nospin.region, this.x, this.y);
        if(nospin.heatRegion != Core.atlas.find("error") && this.heat > 0.001){
          Draw.color(nospin.heatColor, this.heat);
          Draw.blend(Blending.additive);
          Draw.rect(nospin.heatRegion, this.x, this.y);
          Draw.blend();
          Draw.color();
        }
      }
    }, objb);
    
    const nospin = extendContent(type, name, obj);
    
    nospin.rotateSpeed = 9999;
    nospin.shootLength = 0;
    nospin.shootEffect = Fx.none;
    nospin.smokeEffect = Fx.none;
    
    nospin.buildType = ent => {
      ent = extendContent(build, nospin, clone(objb));
      return ent;
    }
    
    return nospin;
  }
}