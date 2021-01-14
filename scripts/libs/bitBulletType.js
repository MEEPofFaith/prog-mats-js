module.exports = {
  newBitBullet(color1, color2, fadeSpeed, size, hueShift, strokes, stroke, length, burstTime, burstSize, trailTime, trailDelay){
    const burst = new Effect(burstTime, e => {
      var set = [];
      set[0] = Mathf.curve(e.time, 0, e.lifetime * 2/3);
      set[1] = Mathf.curve(e.time, e.lifetime * 1/3, e.lifetime);
      
      if(hueShift){
        var c = Tmp.c1.set(color1).shiftHue(Time.time * fadeSpeed + Mathf.randomSeed(e.id, 360));
      }else{
        var c = Tmp.c1.set(color1).lerp(color2, Mathf.absin(Time.time * fadeSpeed + Mathf.randomSeed(e.id, 360), 1, 1));
      }
      Draw.color(c);
      Lines.stroke(stroke);
      
      for(var i = 0; i < 2; i++){
        if(set[i] > 0 && set[i] < 1){
          for(var j = 0; j < strokes; j++){
            var s = burstSize/2 * set[i];
            var front = Mathf.clamp(s, 0, burstSize/2 - 2 * length);
            var back = Mathf.clamp(s - length, 0, burstSize/2 - 2 * length);
            
            Tmp.v1.trns(j * (360/strokes), 0, front);
            Tmp.v1.add(e.x, e.y);
            Tmp.v2.trns(j * (360/strokes), 0, back);
            Tmp.v2.add(e.x, e.y);
            
            Lines.line(Tmp.v1.x, Tmp.v1.y, Tmp.v2.x, Tmp.v2.y);
          }
        }
      }
    });
    
    const trail = new Effect(trailTime, e => {
      var offset = Mathf.randomSeed(e.rotation, 0, 360);
      if(hueShift){
        var c = Tmp.c1.set(color1).shiftHue(Time.time * fadeSpeed + offset);
      }else{
        var c = Tmp.c1.set(color1).lerp(color2, Mathf.absin(Time.time * fadeSpeed + offset, 1, 1));
      }
      
      Draw.color(c);
      Fill.rect(e.x, e.y, size * e.fout(), size * e.fout());
    });
    trail.layer = Layer.bullet;
    
    const bit = extend(BulletType, {
      update(b){
        if(!b) return;
        this.super$update(b);
        
        var offset = Mathf.randomSeed(b.id, 0, 360);
        if(hueShift){
          var c = Tmp.c1.set(color1).shiftHue(Time.time * fadeSpeed + offset);
        }else{
          var c = Tmp.c1.set(color1).lerp(color2, Mathf.absin(Time.time * fadeSpeed + offset, 1, 1));
        }

        if(b.timer.get(0, trailDelay)){
          this.trailEffect.at(b.x, b.y, b.id);
        }
      },
      draw(b){
        if(!b) return;
        
        var offset = Mathf.randomSeed(b.id, 0, 360);
        if(hueShift){
          var c = Tmp.c1.set(color1).shiftHue(Time.time * fadeSpeed + offset);
        }else{
          var c = Tmp.c1.set(color1).lerp(color2, Mathf.absin(Time.time * fadeSpeed + offset, 1, 1));
        }
        
        Draw.color(c);
        Draw.z(Layer.bullet + 0.01)
        Fill.rect(b.x, b.y, size, size);
      }
    });
    bit.hitEffect = burst;
    bit.despawnEffect = burst;
    bit.trailEffect = trail;
    bit.shootEffect = Fx.none;
    bit.smokeEffect = Fx.none;
    bit.absorbable = false;
    bit.hittable = false;
    bit.hitSound = loadSound("bitHit");
    
    return bit;
  }
}