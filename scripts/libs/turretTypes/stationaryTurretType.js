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
        if(drawBase) Draw.rect(speennt.baseRegion, this.x, this.y);
        Draw.rect(speennt.region, this.x, this.y);
        if(speennt.heatRegion != Core.atlas.find("error") && this.heat > 0.001){
          Draw.color(speennt.heatColor, this.heat);
          Draw.blend(Blending.additive);
          Draw.rect(speennt.heatRegion, this.x, this.y);
          Draw.blend();
          Draw.color();
        }
      }
    }, objb);
    
    const speennt = extendContent(type, name, obj);
    
    speennt.rotateSpeed = 9999;
    speennt.shootCone = 360;
    speennt.shootLength = 0;
    speennt.shootEffect = Fx.none;
    speennt.smokeEffect = Fx.none;
    
    speennt.buildType = ent => {
      ent = extendContent(build, speennt, clone(objb));
      return ent;
    }
    
    return speennt;
  }
}