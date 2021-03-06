module.exports = {
  sentryBullet(sentryUnit, addVel, obj){
    if(obj == undefined) obj = {};
    obj = Object.assign({
      load(){
        this.frontRegion = sentryUnit.icon(Cicon.full);
        this.backRegion = Core.atlas.find(this.sprite);
      },
      despawned(b){
        if(!b) return;
        
        let sentry = sentryUnit.spawn(b.team, b.x, b.y);
        sentry.rotation = b.rotation();
        if(addVel) sentry.vel.add(b.vel);
        
        this.super$despawned(b);
      },
      update(b){
        if(!b) return;
        
        let scl = b.lifetime / b.type.lifetime;
        //let slope = b.fin() * (1 - b.fin()) * 4; It's normally 0 - 0.25 - 0 without the *4
        let slope = b.fin() * (1 - b.fin());
        let scale = this.scaleAmount * (slope * 4) * scl + 1;
        let trail = this.trailSize * scale;
        if(b.timer.get(0, (3 + slope * 2) * this.trailTimeMul)){
          this.trailEffect.at(b.x, b.y, trail, this.backColor);
        }
        this.super$update(b);
      },
      draw(b){
        if(!b) return;
        let offset = -90 + (this.spin != 0 ? b.fout() * (this.spin + Mathf.randomSeed(b.id, 360)) : 0);
        let scl = b.lifetime / b.type.lifetime;
        let slope = b.fin() * (1 - b.fin());
        let shadowScl = (slope * 4) * scl;
        let shadowOff = this.shadowStart + this.shadowOffset * shadowScl;
        let scale = this.scaleAmount * shadowScl + 1;
        
        Draw.z(Layer.flyingUnit + 1);
        Drawf.shadow(this.backRegion, b.x - shadowOff, b.y - shadowOff, b.rotation() + offset);
        
        Draw.z(Layer.flyingUnit + 2);
        Draw.rect(this.backRegion, b.x, b.y, this.backRegion.width / 4 * scale, this.backRegion.height / 4 * scale, b.rotation() + offset);
        
        Draw.z(Layer.flyingUnit + 1);
        Drawf.shadow(this.frontRegion, b.x - shadowOff, b.y - shadowOff, b.rotation() + offset);
        
        Draw.z(Layer.flyingUnit + 2);
        Draw.rect(this.frontRegion, b.x, b.y, this.frontRegion.width / 4 * scale, this.frontRegion.height / 4 * scale, b.rotation() + offset);
      },
      drawSize: 800,
      sprite: "clear",
      scaleVelocity: true,
      scaleAmount: 0.2,
      shadowStart: 0,
      shadowOffset: 10,
      abosrbable: false,
      hittable: false,
      damage: 0,
      splasDamageRadius: -1,
      hitEffect: Fx.none,
      despawnEffect: Fx.spawn,
      trailTimeMul: 1,
      trailSize: sentryUnit.hitSize * 0.75,
      ammoMultiplier: 1
    }, obj);

    const sentryB = extend(ArtilleryBulletType, obj);
    return sentryB;
  }
}