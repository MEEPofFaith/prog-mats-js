module.exports = {
  sentryBullet(sentryUnit, addVel){ //Do not put anything that isn't a BasicBulletType or its children as its type.
    const sentryB = extend(ArtilleryBulletType, {
      load(){
        this.region = sentryUnit.icon(Cicon.full);
        this.boxRegion = Core.atlas.find(this.sprite);
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
        let slope = b.fin() * (1 - b.fin());
        let scale = this.scaleAmount * slope * scl + 1;
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
        let shadowScl = slope * scl;
        let shadowOff = this.shadowStart + this.shadowOffset * shadowScl;
        let scale = this.scaleAmount * shadowScl + 1;
        
        Draw.z(Layer.flyingUnit + 1);
        Drawf.shadow(this.boxRegion, b.x - shadowOff, b.y - shadowOff, b.rotation() + offset);
        
        Draw.z(Layer.flyingUnit + 2);
        Draw.rect(this.boxRegion, b.x, b.y, this.boxRegion.width / 4 * scale, this.boxRegion.height / 4 * scale, b.rotation() + offset);
        
        Draw.z(Layer.flyingUnit + 1);
        Drawf.shadow(this.region, b.x - shadowOff, b.y - shadowOff, b.rotation() + offset);
        
        Draw.z(Layer.flyingUnit + 2);
        Draw.rect(this.region, b.x, b.y, this.region.width / 4 * scale, this.region.height / 4 * scale, b.rotation() + offset);
      },
      drawSize: 800,
      sprite: "clear",
      scaleVelocity: true,
      scaleAmount: 0.5,
      shadowStart: 0,
      shadowOffset: 32,
      abosrbable: false,
      hittable: false,
      damage: 0,
      splasDamageRadius: -1,
      hitEffect: Fx.none,
      despawnEffect: Fx.spawn,
      trailTimeMul: 1,
      trailSize: sentryUnit.hitSize * 0.75,
      ammoMultiplier: 1
    });
    return sentryB;
  }
}