module.exports = {
  stationaryTurret(type, build, name){
    const speennt = extendContent(type, name, {});
    
    speennt.buildType = ent => {
      ent = extendContent(build, speennt, {
        draw(){
          Draw.rect(speennt.baseRegion, this.x, this.y);
          Draw.rect(speennt.region, this.x, this.y);
          if(speennt.heatRegion != Core.atlas.find("error") && this.heat > 0.001){
            Draw.color(speennt.heatColor, this.heat);
            Draw.blend(Blending.additive);
            Draw.rect(speennt.heatRegion, this.x, this.y);
            Draw.blend();
            Draw.color();
          }
        }
      });
      return ent;
    }
    
    speennt.rotateSpeed = 9999;
    speennt.shootCone = 360;
    speennt.shootLength = 0;
    
    return speennt;
  }
}