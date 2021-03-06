module.exports = {
  crossLaser(midLen, crossSection, border, crossBorder, crossWidth, crossLength, damage, collidesGround, collidesAir, largeHit, obj){
    //Invisble bullet for doing the cross bar damage.
    const crossDamage = extend(LaserBulletType, {
      draw(b){},
      drawLight(b){},
      length: crossLength,
      width: crossWidth,
      damage: damage,
      collidesGround: collidesGround,
      collidesAir: collidesAir,
      laserEffect: Fx.none,
      largeHit: largeHit
    });

    if(obj == undefined) obj = {};
    obj = Object.assign({
      init(b){
        if(!b) return;
        this.super$init(b);
        
        b.data = [0, 0];
        
        const cross = b.fdata * crossSection;
        Time.run(this.growTime, () => {
          crossSpawn.trns(b.rotation(), cross);
          var crossBullets = [];
          for(var i = 0; i < 2; i++){
            crossBullets[i] = crossDamage.create(b.owner, b.team, b.x + crossSpawn.x, b.y + crossSpawn.y, b.rotation() + 90 * Mathf.signs[i], 1, 1);
          }
          b.data = [crossBullets[0].fdata, crossBullets[1].fdata];
        });
      },
      draw(b){
        if(!b) return;
        var fin = Mathf.curve(b.fin(), 0, this.growTime / b.lifetime);
        var cfin = Mathf.curve(b.fin(), this.growTime / b.lifetime, this.growTime / b.lifetime * 2);
        var fout = 1 - Mathf.curve(b.fin(), (b.lifetime - this.fadeTime) / b.lifetime, 1);
        
        var block = b.fdata / this.length;
        var l = b.fdata * fin;
        var w = this.width/2 * fin * block;
        var mid = l * midLen;
        var cross = l * crossSection;
        var cblock = [b.data[0] / crossLength, b.data[1] / crossLength]
        var cl = [b.data[0] * cfin, b.data[1] * cfin];
        var cw = [crossWidth/2 * cfin * cblock[0], crossWidth/2 * cfin * cblock[1]];
        
        for(var i = 0; i < this.colors.length; i++){
          var bord = border * i * fin * block;
          var cbord = [crossBorder * i * cfin * cblock[0], crossBorder * i * cfin * cblock[1]];
          Draw.color(this.colors[i], fout);
          
          // Main
          //Start
          Tmp.v1.trns(b.rotation(), 0);
          Tmp.v1.add(b.x, b.y);
          //Mid
          Tmp.v2.trns(b.rotation(), mid, -(w - bord));
          Tmp.v2.add(b.x, b.y);
          Tmp.v3.trns(b.rotation(), mid, w - bord);
          Tmp.v3.add(b.x, b.y);
          //End
          Tmp.v4.trns(b.rotation(), l);
          Tmp.v4.add(b.x, b.y);
          
          Fill.tri(Tmp.v1.x, Tmp.v1.y, Tmp.v2.x, Tmp.v2.y, Tmp.v3.x, Tmp.v3.y);
          Fill.tri(Tmp.v4.x, Tmp.v4.y, Tmp.v2.x, Tmp.v2.y, Tmp.v3.x, Tmp.v3.y);
          
          // Cross Beam
          for(var j = 0; j < 2; j++){
            //Point
            Tmp.v1.trns(b.rotation(), cross, cl[j] * Mathf.signs[j]);
            Tmp.v1.add(b.x, b.y);
            //Base
            Tmp.v2.trns(b.rotation(), cross + cw[j] - cbord[j]);
            Tmp.v2.add(b.x, b.y);
            Tmp.v3.trns(b.rotation(), cross - cw[j] + cbord[j]);
            Tmp.v3.add(b.x, b.y);
            
            Fill.tri(Tmp.v1.x, Tmp.v1.y, Tmp.v2.x, Tmp.v2.y, Tmp.v3.x, Tmp.v3.y);
          }
          
          Draw.reset();
        }

        // Main light
        Tmp.v1.trns(b.rotation(), l);
        Tmp.v1.add(b.x, b.y);
        Drawf.light(b.team, b.x, b.y, Tmp.v1.x, Tmp.v1.y, w * 2 * fin * fout, this.colors[1], 0.6);
        
        // Cross Beam Light
        for(var i = 0; i < 2; i++){
          //Point
          Tmp.v1.trns(b.rotation(), cross, cl[i] * Mathf.signs[i]);
          Tmp.v1.add(b.x, b.y);
          //Base
          Tmp.v2.trns(b.rotation(), cross);
          Tmp.v2.add(b.x, b.y);

          Drawf.light(b.team, Tmp.v1.x, Tmp.v1.y, Tmp.v2.x, Tmp.v2.y, cw[i] * 2 * fin * fout, this.colors[1], 0.6);
        }
      },
      growTime: 5,
      fadeTime: 5,
      lifetime: 24,
      damage: damage,
      collidesGround: collidesGround,
      collidesAir: collidesAir,
      laserEffect: Fx.none,
      largeHit: largeHit
    }, obj);
    
    const crossSpawn = new Vec2();
    const holyDestruction = extend(LaserBulletType, obj);
    
    return holyDestruction;
  }
}