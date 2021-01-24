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
  missileTurret(drawBase, type, build, name, missile, obj, objb){
    if(obj == undefined) obj = {};
    if(objb == undefined) objb = {};
    obj = Object.assign({
      load(){
        this.super$load();
        this.missileRegion = Core.atlas.find(missile);
      },
      icons(){
        var regions = drawBase ? [this.baseRegion, this.region, this.missileRegion] : [this.region, this.missileRegion];
        return regions;
      }
    }, obj);
    
    objb = Object.assign({
      draw(){
        if(drawBase) Draw.rect(nospin.baseRegion, this.x, this.y);
        Draw.rect(nospin.region, this.x, this.y);
        
        Draw.draw(Draw.z(), () => {
          Drawf.construct(this.x, this.y, nospin.missileRegion, 0, this.reload / nospin.reloadTime, this._speedScl, this.reload);
        });
        
        if(Core.atlas.isFound(nospin.heatRegion) && this.heat > 0.001){
          Draw.color(nospin.heatColor, this.heat);
          Draw.blend(Blending.additive);
          Draw.rect(nospin.heatRegion, this.x, this.y);
          Draw.blend();
          Draw.color();
        }
      },
      updateTile(){
        this.super$updateTile();
        if(this.reload < nospin.reloadTime && this.hasAmmo()){
          this._speedScl = Mathf.lerpDelta(this._speedScl, 1, 0.05);
        }else{
          this._speedScl = Mathf.lerpDelta(this._speedScl, 0, 0.05);
        }
      },
      updateCooling(){
        if(this.hasAmmo()){
          this.super$updateCooling();
        }
      }
    }, objb);
    
    const nospin = extendContent(type, name, obj);
    
    nospin.rotateSpeed = 9999;
    nospin.shootLength = 0;
    nospin.shootEffect = Fx.none;
    nospin.smokeEffect = Fx.none;
    nospin.outlineIcon = false;
    
    nospin.buildType = ent => {
      ent = extendContent(build, nospin, clone(objb));
      ent._speedScl = 0;
      return ent;
    }
    
    return nospin;
  }
}