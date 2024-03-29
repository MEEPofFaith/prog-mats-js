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
  missileTurret(drawBase, type, build, name, obj, objb){
    if(obj == undefined) obj = {};
    if(objb == undefined) objb = {};
    obj = Object.assign({
      icons(){
        return drawBase ? [this.baseRegion, this.region] : [this.region];
      }
    }, obj);
    
    objb = Object.assign({
      draw(){
        if(drawBase) Draw.rect(missileSilo.baseRegion, this.x, this.y);
        Draw.rect(missileSilo.region, this.x, this.y);
        
        if(this.hasAmmo() && this.peekAmmo() != null){
          Draw.draw(Draw.z(), () => {
            let missileRegion = Core.atlas.find(this.peekAmmo().sprite);
            Drawf.construct(this.x, this.y, missileRegion, this.team.color, 0, this.reload / missileSilo.reloadTime, this._speedScl, this.reload);
          });
        }
        
        if(Core.atlas.isFound(missileSilo.heatRegion) && this.heat > 0.001){
          Draw.color(missileSilo.heatColor, this.heat);
          Draw.blend(Blending.additive);
          Draw.rect(missileSilo.heatRegion, this.x, this.y);
          Draw.blend();
          Draw.color();
        }
      },
      updateTile(){
        this.super$updateTile();
        
        if(this.reload < missileSilo.reloadTime && this.hasAmmo() && this.consValid()){
          this._speedScl = Mathf.lerpDelta(this._speedScl, 1, 0.02);
        }else{
          this._speedScl = Mathf.lerpDelta(this._speedScl, 0, 0.02);
        }
      },
      updateShooting(){
        if(this.hasAmmo() && this.consValid()) this.super$updateShooting();
      },
      updateCooling(){
        if(this.hasAmmo() && this.consValid()){
          this.super$updateCooling();
        }else{
          this.reload = 0;
        }
      },
      handleItem(source, item){
        this.reload = 0; //Sorry, but you can't just turn a half-built missile into a different type of missile. Gotta restart construction.
        this.super$handleItem(source, item);
      },
      turnToTarget(targetRot){
        this.rotation = targetRot;
      }
    }, objb);
    
    const missileSilo = extend(type, name, obj);
    
    missileSilo.rotateSpeed = 9999;
    missileSilo.shootLength = 0;
    missileSilo.shootEffect = Fx.none;
    missileSilo.smokeEffect = Fx.none;
    missileSilo.outlineIcon = false;
    
    missileSilo.buildType = ent => {
      ent = extend(build, missileSilo, clone(objb));
      ent._speedScl = 0;
      return ent;
    }
    
    return missileSilo;
  }
}