const tr = new Vec2();
module.exports = {
  new8BitTurret(name, sides, type, build, perRot){
    const bit = extendContent(type, name, {
      load(){
        this.super$load();
        this.bits = [];
        this.heats = [];
        this.outlines = [];
        for(var i = 0; i < (perRot ? sides : 1); i++){
          //Starts at 0*, goes counter-clockwise
          this.bits[i] = Core.atlas.find(this.name + "-side-" + i); //Turret
          this.heats[i] = Core.atlas.find(this.name + "-side-heat-" + i); //Heats
          this.outlines[i] = Core.atlas.find(this.name + "-side-outline-" + i); //Outlines
        }
      },
      icons(){
        /*return[
          this.baseRegion,
          Core.atlas.find(this.name + "-side-outline-0"),
          Core.atlas.find(this.name + "-side-0")
        ];*/
        return[
          this.baseRegion,
          Core.atlas.find(this.name + "-side-0")
        ];
      }
    });
    
    bit.buildType = ent => {
      ent = extendContent(build, bit, {
        draw(){
          Draw.rect(bit.baseRegion, this.x, this.y);
          Draw.color();

          Draw.z(Layer.turret);
          
          if(perRot){
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
          }else{
            var drawRot = this.rotation - 90;
            drawRot = drawRot >= 360 ? drawRot - 360 : drawRot < 0 ? drawRot + 360 : drawRot;
            var rot = Mathf.round(drawRot + (360 / sides / 2), 360 / sides);
            rot = rot >= 360 ? rot - 360 : rot < 0 ? rot + 360 : rot;
            tr.trns(rot + 90, -this.recoil);
            tr.add(this.x, this.y);
            
            Drawf.shadow(bit.bits[0], tr.x - (bit.size / 2), tr.y - (bit.size / 2), rot);
            Draw.rect(bit.outlines[0], tr.x, tr.y, rot);
            Draw.rect(bit.bits[0], tr.x, tr.y, rot);

            if(bit.heats[0] != Core.atlas.find("error") && this.heat > 0.0001){
              Draw.color(bit.heatColor, this.heat);
              Draw.blend(Blending.additive);
              Draw.rect(bit.heats[0], tr.x, tr.y, rot);
              Draw.blend();
              Draw.color();
            }
          }
        }
      });
      return ent;
    }
    bit.shootSound = loadSound("bitShoot");
    
    return bit;
  }
}