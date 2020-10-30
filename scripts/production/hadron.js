const effectSize = 0.5;

const collisionEffect = new Effect(30, e => {
  e.scaled(7, i => {
    Lines.stroke((3.1 * i.fout()) * effectSize);
    Lines.circle(e.x, e.y, (3 + i.fin() * 14) * effectSize);
  });
  
  Draw.color(Color.gray);
  
  Angles.randLenVectors(e.id, 6, (2 + 19 * e.finpow()) * effectSize, (x, y) => {
    Fill.circle(e.x + x, e.y + y, (e.fout() * 3 + 0.5) * effectSize);
    Fill.circle(e.x + x / 2, e.y + y / 2, (e.fout() * 1) * effectSize);
  });

  Draw.color(Pal.lighterOrange, Pal.lightOrange, Color.gray, e.fin());
  Lines.stroke((1.7 * e.fout()) * effectSize);

  Angles.randLenVectors(e.id + 1, 9, (1 + 23 * e.finpow()) * effectSize, (x, y) => {
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), (1 + e.fout() * 3) * effectSize);
  });
});

collisionEffect.layer = 32.5;

const hadron = extendContent(GenericCrafter, "mindron-collider", {
  load(){
    this.bottomRegion = Core.atlas.find(this.name + "-bottom");
    this.topRegion = Core.atlas.find(this.name + "-top");
  },
  icons(){
    return [
      Core.atlas.find(this.name + "-bottom"),
      Core.atlas.find(this.name + "-top")
    ]
  }
});

hadron.collidePoint = 12;
hadron.collideSep = 2;
hadron.lengthStart = 4;
hadron.lengthEnd = 32;
hadron.strokeStart = 1;
hadron.strokeEnd = 0.5;
hadron.startRot = 6120;
hadron.endPercent = 0.9625;

const p1 = new Vec2();
const p2 = new Vec2();
const p3 = new Vec2();
const p4 = new Vec2();
const collide = new Vec2();

hadron.buildType = () => {
  var colliderEntity = extendContent(GenericCrafter.GenericCrafterBuild, hadron, {
    setEff(){
      this._endRot = 0;
      this._color = [Items.titanium.color, Items.thorium.color];
      this._dist = [0, 0];
      this._length = [0, 0];
      this._curRot = [0, 0];
      this._stroke = [0, 0];
      this._rotFix = [0, 0];
      this._collided = false;
    },
    draw(){
      Draw.z(Layer.block);
      Draw.rect(hadron.bottomRegion, this.x, this.y);
      
      if(this.progress > 0){
        //test colors
        for(var i = 0; i < 2; i++){
          p1.trns(this._curRot[i], this._dist[i]);
          p1.add(this.x, this.y);
          p2.trns(this._curRot[i] - (this._length[i] / 3) * this._rotFix[i], this._dist[i]);
          p2.add(this.x, this.y);
          p3.trns(this._curRot[i] - (this._length[i] / 3 * 2) * this._rotFix[i], this._dist[i]);
          p3.add(this.x, this.y);
          p4.trns(this._curRot[i] - this._length[i] * this._rotFix[i], this._dist[i]);
          p4.add(this.x, this.y);
          
          Draw.color(this._color[i]);
          Lines.stroke(this._stroke[i]);
          Lines.curve(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y, 10);
          Draw.reset();
        }
      }
      
      Draw.z(Layer.blockOver);
      Draw.rect(hadron.topRegion, this.x, this.y);
    },
    updateTile(){
      this.super$updateTile();
      
      if(this.progress <= 0){
        this._endRot = Mathf.random(360);
      
        var order = Mathf.round(Mathf.random(1));
        if(order == 0){
          this._color = [Items.titanium.color, Items.thorium.color];
        }else{
          this._color = [Items.thorium.color, Items.titanium.color];
        }
        
        this._collided = false;
      }
      
      var before = Mathf.curve(this.progress, 0, hadron.endPercent);
      var after = Mathf.curve(this.progress, hadron.endPercent, 1);
      
      for(var i = 0; i < 2; i++){
        this._dist[i] = Mathf.lerpDelta(hadron.collidePoint + hadron.collideSep * Mathf.sign(i - 0.5), hadron.collidePoint, before);
        this._curRot[i] = this._endRot - (hadron.startRot * (1 - before)) * Mathf.sign(i - 0.5);
        this._stroke[i] = Mathf.lerpDelta(hadron.strokeStart, hadron.strokeEnd, before);
        
        if(this.progress <= hadron.endPercent){
          this._length[i] = Mathf.lerpDelta(hadron.lengthStart, hadron.lengthEnd, before) * Mathf.sign(i - 0.5);
        }else{
          this._length[i] = Mathf.lerpDelta(hadron.lengthEnd * Mathf.sign(i - 0.5), 0, after);
        }
        
        this._rotFix[i] = this._dist[i] / hadron.collidePoint;
      }
      
      if(this.progress >= hadron.endPercent && !this._collided){
        collide.trns(this._endRot - 90, 0, hadron.collidePoint);
        
        //Fx.blockExplosion.at(this.x + collide.x, this.y + collide.y);
        collisionEffect.at(this.x + collide.x, this.y + collide.y, Mathf.random(360));
        Sounds.bang.at(this.x + collide.x, this.y + collide.y, Mathf.random(1.4, 1.6), Mathf.random(0.3, 0.5));
        this._collided = true;
      }
    }
  });
  
  colliderEntity.setEff();
  return colliderEntity;
};