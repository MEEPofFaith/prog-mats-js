const tr = new Vec2();
module.exports = {
  new8BitTurret(name, sides, type, build){
    const bit = extendContent(type, name, {
      load(){
        this.super$load();
        this.bits = [];
        this.heats = [];
        this.outlines = [];
        for(var i = 0; i < sides; i++){
          //Starts at 0*, goes counter-clockwise
          this.bits[i] = Core.atlas.find(this.name + "-side-" + i); //Turret
          this.heats[i] = Core.atlas.find(this.name + "-side-heat-" + i); //Heats
          this.outlines[i] = Core.atlas.find(this.name + "-side-outline-" + i); //Outlines
        }
      },
      icons(){
        return[this.baseRegion, Core.atlas.find(this.name + "-icon")]
      }
    });
    
    bit.buildType = ent => {
      ent = extendContent(build, bit, {
        draw(){
          Draw.rect(bit.baseRegion, this.x, this.y);
          Draw.color();

          Draw.z(Layer.turret);
          
          var drawRot = this.rotation - 90;
          drawRot = drawRot >= 360 ? drawRot - 360 : drawRot < 0 ? drawRot + 360 : drawRot;
          var rot = Mathf.round(drawRot + (360 / sides / 2), 360 / sides);
          rot = rot >= 360 ? rot - 360 : rot < 0 ? rot + 360 : rot;
          var curRot = Mathf.round(rot / (360 / sides));
          tr.trns(rot + 90, -this.recoil);
          tr.add(this.x, this.y);
          
          //Debug
          /*for(var i = 0; i < sides; i++){
            Lines.lineAngle(this.x, this.y, i * (360 / sides) + 90 + (360 / sides / 2), 80);
          }*/
          //End Debug
          
          Drawf.shadow(bit.bits[curRot], tr.x - (bit.size / 2), tr.y - (bit.size / 2), 0);
          Draw.rect(bit.outlines[curRot], tr.x, tr.y, 0);
          Draw.rect(bit.bits[curRot], tr.x, tr.y, 0);

          if(bit.heats[curRot] != Core.atlas.find("error") && this.heat > 0.0001){
            Draw.color(bit.heatColor, this.heat);
            Draw.blend(Blending.additive);
            Draw.rect(bit.heats[curRot], tr.x, tr.y, 0);
            Draw.blend();
            Draw.color();
          }
        }
      });
      return ent;
    }
    return bit;
  }
}