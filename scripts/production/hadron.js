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
    this.heatRegions = [];
    
    this.colliderRegion = Core.atlas.find(this.name + "-collider");
    this.heatRegions[0] = Core.atlas.find(this.name + "-heat-0");
    this.heatRegions[1] = Core.atlas.find(this.name + "-heat-1");
    this.glassRegion = Core.atlas.find(this.name + "-glass");
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
hadron.lengthEnd = 48;
hadron.strokeStart = 1;
hadron.strokeEnd = 1;
hadron.startRot = 540;
hadron.collideStart = 0.9;
hadron.collideEnd = 0.975;
hadron.cooldown = 0.03;
hadron.heatColor = Pal.accent;

const p1 = new Vec2();
const p2 = new Vec2();
const p3 = new Vec2();
const p4 = new Vec2();
const collide = new Vec2();
const meter = new Vec2();

hadron.buildType = () => {
  var colliderEntity = extendContent(GenericCrafter.GenericCrafterBuild, hadron, {
    setEff(){
      this._color = [Items.titanium.color, Items.thorium.color];
      this._length = [0, 0];
      this._curRot = [0, 0];
      this._stroke = [0, 0];
      this._dist = [0, 0];
      this._collided = false;
      this._released = false;
      this._before = 0;
      this._colliding = 0;
      this._after = 0;
      this._heat = 0;
      this._beforeHeat = 0;
    },
    draw(){
      Draw.z(Layer.block);
      Draw.rect(hadron.bottomRegion, this.x, this.y);
      
      if(this.progress > 0){
        //test colors
        for(var i = 0; i < 2; i++){
          p1.trns(this._curRot[i], this._dist[i]);
          p1.add(this.x, this.y);
          p2.trns(this._curRot[i] - (this._length[i] / 3), this._dist[i]);
          p2.add(this.x, this.y);
          p3.trns(this._curRot[i] - (this._length[i] / 3 * 2), this._dist[i]);
          p3.add(this.x, this.y);
          p4.trns(this._curRot[i] - this._length[i], this._dist[i]);
          p4.add(this.x, this.y);
          
          Draw.color(this._color[i]);
          Lines.stroke(this._stroke[i]);
          Lines.curve(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y, 10);
          Draw.color();
        }
      }
      
      Draw.z(Layer.blockOver);
      Draw.rect(hadron.colliderRegion, this.x, this.y);
      
      if(this._heat > 0.00001){
        Draw.blend(Blending.additive);
        Draw.color(hadron.heatColor, this._heat);
        Draw.rect(hadron.heatRegions[0], this.x, this.y);
        Draw.blend();
        Draw.color();
      }
      
      Draw.alpha(0.75);
      Draw.rect(hadron.glassRegion, this.x, this.y);
      Draw.alpha(1);
      
      Draw.rect(hadron.topRegion, this.x, this.y);
      
      if(this._heat > 0.00001){
        Draw.blend(Blending.additive);
        Draw.color(hadron.heatColor, this._heat);
        Draw.rect(hadron.heatRegions[1], this.x, this.y);
        Draw.blend();
        Draw.color();
      }
    },
    updateTile(){
      this.super$updateTile();
      
      if(this.progress <= 0){
        var order = Mathf.round(Mathf.random(1));
        if(order == 0){
          this._color = [Items.titanium.color, Items.thorium.color];
        }else{
          this._color = [Items.thorium.color, Items.titanium.color];
        }
        
        this._collided = false;
        this._released = false;
        this._beforeHeat = this._heat;
      }
      
      this._before = Mathf.curve(this.progress, 0, hadron.collideStart);
      this._colliding = Mathf.curve(this.progress, hadron.collideStart, hadron.collideEnd);
      this._after = Mathf.curve(this.progress, hadron.collideEnd, 1);
      
      for(var i = 0; i < 2; i++){
        this._curRot[i] = 180 - (hadron.startRot * (1 - this._colliding)) * Mathf.sign(i - 0.5) + 90;
        this._stroke[i] = Mathf.lerpDelta(hadron.strokeStart, hadron.strokeEnd, this._colliding);
        this._dist[i] = Mathf.lerpDelta(hadron.collidePoint + hadron.collideSep, hadron.collidePoint, this._colliding);
        
        if(this.progress <= hadron.collideStart && this.progress > 0){
          this._heat = Mathf.lerpDelta(this._beforeHeat, 1, this._before);
        }else if(this.progress >= hadron.collideStart && this.progress <= hadron.collideEnd){
          this._length[i] = Mathf.lerpDelta(hadron.lengthStart, hadron.lengthEnd, this._colliding) * Mathf.sign(i - 0.5);
          
          this._heat = Mathf.lerpDelta(this._heat, 0, hadron.cooldown);
        }else if(this.progress >= hadron.collideEnd){
          this._length[i] = Mathf.lerpDelta(hadron.lengthEnd * Mathf.sign(i - 0.5), 0, this._after);
          
          this._heat = Mathf.lerpDelta(this._heat, 0, hadron.cooldown);
        }else{
          this._heat = Mathf.lerpDelta(this._heat, 0, hadron.cooldown);
        }
      }
      
      if(this.progress >= hadron.collideStart && this.progress <= hadron.collideEnd && !this._released){
        Sounds.release.at(this.x, this.y + hadron.collidePoint, Mathf.random(1.4, 1.6), Mathf.random(0.3, 0.5));
        this._released = true;
      }
      
      if(this.progress >= hadron.collideEnd && !this._collided){
        collisionEffect.at(this.x, this.y - hadron.collidePoint, Mathf.random(360));
        Sounds.bang.at(this.x, this.y - hadron.collidePoint, Mathf.random(1.4, 1.6), Mathf.random(0.3, 0.5));
        this._collided = true;
      }
    }
  });
  
  colliderEntity.setEff();
  return colliderEntity;
};