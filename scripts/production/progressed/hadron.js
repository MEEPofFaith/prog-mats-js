const effectSize = 0.75;
const effectLength = 0.5;

const equalArcLen = (r1, r2, v) => {
  return (r1 / r2) * v;
};

const collisionEffect = new Effect(30, e => {
  e.scaled(7, i => {
    Lines.stroke((3.1 * i.fout()) * effectSize);
    Lines.circle(e.x, e.y, (3 + i.fin() * 14) * effectLength);
  });
  
  Draw.color(Color.gray);
  
  Angles.randLenVectors(e.id, 6, (2 + 13 * e.finpow()) * effectLength, (x, y) => {
    Fill.circle(e.x + x, e.y + y, (e.fout() * 3 + 0.5) * effectSize);
    Fill.circle(e.x + x / 2, e.y + y / 2, (e.fout() * 1) * effectSize);
  });

  Draw.color(Pal.lighterOrange, Pal.lightOrange, Color.gray, e.fin());
  Lines.stroke((1.7 * e.fout()) * effectSize);

  Angles.randLenVectors(e.id + 1, 9, (1 + 14 * e.finpow()) * effectLength, (x, y) => {
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), (1 + e.fout() * 3) * effectSize);
  });
});

collisionEffect.layer = 32.5;

const hadron = extendContent(GenericCrafter, "mindron-collider", {
  load(){
    this.heatRegions = [];
    this.lightRegions = [];
    
    this.colliderRegion = Core.atlas.find(this.name + "-collider");
    for(var i = 0; i < 2; i++){
      this.heatRegions[i] = Core.atlas.find(this.name + "-heat-" + i);
      this.lightRegions[i] = Core.atlas.find(this.name + "-light-" + i);
    }
    this.glassRegion = Core.atlas.find(this.name + "-glass");
    this.bottomRegion = Core.atlas.find(this.name + "-bottom");
    this.topRegion = Core.atlas.find(this.name + "-top");
  },
  icons(){
    return [
      Core.atlas.find(this.name + "-bottom"),
      Core.atlas.find(this.name + "-collider"),
      Core.atlas.find(this.name + "-glass"),
      Core.atlas.find(this.name + "-top")
    ]
  }
});

/**
  * requirements:[
  *   silicon/150
  *   metaglass/50
  *   plastanium/80
  *   thorium/100
  *   surge-alloy/110
  * ] 
*/
// hadron.requirements(Category.crafting, ItemStack.with(Items.silicon, 150, Items.metaglass, 50, Items.plastanium, 80, Items.thorium, 100, Items.surgeAlloy, 110));
hadron.requirements = ItemStack.with(Items.silicon, 150, Items.metaglass, 50, Items.plastanium, 80, Items.thorium, 100, Items.surgeAlloy, 110);
hadron.category = Category.crafting;
hadron.buildVisibility = BuildVisibility.shown;

hadron.collidePoint = 12;
hadron.collideSep = 3;
hadron.lengthStart = 4;
hadron.lengthEnd = 72;
hadron.strokeStart = 1.25;
hadron.strokeEnd = 0.75;
hadron.strokes = [1, 0.9, 0.75, 0.55];
hadron.particleSize = 1.05;
hadron.startRot = 540;
hadron.collideStart = 0.65;
hadron.collideEnd = 0.9;
hadron.cooldown = 0.03;
hadron.heatColor = Pal.accent;

const p1 = new Vec2();
const p2 = new Vec2();
const p3 = new Vec2();
const p4 = new Vec2();
const p5 = new Vec2();
const collide = new Vec2();
const meter = new Vec2();

hadron.buildType = ent => {
  ent = extendContent(GenericCrafter.GenericCrafterBuild, hadron, {
    setEff(){
      this._color = [Items.titanium.color, Items.thorium.color];
      this._length = [0, 0];
      this._curRot = [0, 0];
      this._dist = [0, 0];
      this._stroke = 0;
      this._collided = false;
      this._released = false;
      this._before = 0;
      this._colliding = 0;
      this._interpColliding = 0;
      this._after = 0;
      this._heat = 0;
      this._beforeHeat = 0;
    },
    draw(){
      Draw.z(Layer.block);
      Draw.rect(hadron.bottomRegion, this.x, this.y);
      
      if(this.progress > 0){
        for(var i = 0; i < 2; i++){
          p1.trns(this._curRot[i], this._dist[i]);
          p1.add(this.x, this.y);
          p2.trns(this._curRot[i] + (this._length[i] / 4), this._dist[i]);
          p2.add(this.x, this.y);
          p3.trns(this._curRot[i] + (this._length[i] / 4 * 2), this._dist[i]);
          p3.add(this.x, this.y);
          p4.trns(this._curRot[i] + (this._length[i] / 4 * 3), this._dist[i]);
          p4.add(this.x, this.y);
          p5.trns(this._curRot[i] + this._length[i], this._dist[i]);
          p5.add(this.x, this.y);
          var points = [p1, p2, p3, p4, p5];
          
          Draw.color(this._color[i]);
          Lines.stroke(this._stroke);
          Fill.circle(points[0].x, points[0].y, Lines.getStroke() * hadron.particleSize);
          for(var j = 0; j < 4; j++){
            Lines.stroke(this._stroke * hadron.strokes[j]);
            Lines.line(points[j].x, points[j].y, points[j + 1].x, points[j + 1].y);
          }
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
      
      Drawf.light(this.team, this.x, this.y, hadron.lightRegions[0], hadron.heatColor, this._heat);
      
      Draw.rect(hadron.glassRegion, this.x, this.y);
      Draw.rect(hadron.topRegion, this.x, this.y);
      
      if(this._heat > 0.00001){
        Draw.blend(Blending.additive);
        Draw.color(hadron.heatColor, this._heat);
        Draw.rect(hadron.heatRegions[1], this.x, this.y);
        Draw.blend();
        Draw.color();
      }
      
      Drawf.light(this.team, this.x, this.y, hadron.lightRegions[1], hadron.heatColor, this._heat);
    },
    updateTile(){
      this.super$updateTile();
      
      if(this.progress <= 0){
        if(Mathf.chance(0.5)){
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
      this._interpColliding = Interp.pow2In.apply(Mathf.curve(this.progress, hadron.collideStart, hadron.collideEnd));
      this._after = Mathf.curve(this.progress, hadron.collideEnd, 1);
      
      this._stroke = Mathf.lerp(hadron.strokeStart, hadron.strokeEnd, this._interpColliding);
      
      for(var i = 0; i < 2; i++){
        var side = Mathf.signs[i];
        
        this._curRot[i] = (hadron.startRot * (1 - this._interpColliding)) * side - 90;
        this._dist[i] = Mathf.lerp(hadron.collidePoint + hadron.collideSep * side, hadron.collidePoint, this._colliding);
        
        if(this.progress <= hadron.collideStart && this.progress > 0){
          this._heat = Mathf.lerpDelta(this._beforeHeat, 1, this._before);
          this._length[i] = 0;
        }else if(this.progress > hadron.collideStart && this.progress < hadron.collideEnd){
          this._length[i] = Mathf.lerp(hadron.lengthStart, hadron.lengthEnd, this._interpColliding) * side;
          
          this._heat = Mathf.lerpDelta(this._heat, 0, hadron.cooldown);
        }else if(this.progress >= hadron.collideEnd){
          this._length[i] = Mathf.lerp(hadron.lengthEnd, 0, this._after) * side;
          
          this._heat = Mathf.lerpDelta(this._heat, 0, hadron.cooldown);
        }else{
          this._heat = Mathf.lerpDelta(this._heat, 0, hadron.cooldown);
        }
        
        this._length[i] = equalArcLen(hadron.collidePoint, this._dist[i], this._length[i]);
      }
      
      if(this.progress >= hadron.collideStart && this.progress <= hadron.collideEnd && !this._released){
        Sounds.railgun.at(this.x, this.y + hadron.collidePoint, Mathf.random(1.4, 1.6), Mathf.random(0.1, 0.3));
        this._released = true;
      }
      
      if(this.progress >= hadron.collideEnd && !this._collided){
        collisionEffect.at(this.x, this.y - hadron.collidePoint, Mathf.random(360));
        Sounds.bang.at(this.x, this.y - hadron.collidePoint, Mathf.random(1.4, 1.6), Mathf.random(0.3, 0.5));
        this._collided = true;
      }
    }
  });
  
  ent.setEff();
  return ent;
};