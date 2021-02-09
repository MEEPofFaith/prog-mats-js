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
        
        let slope = Interp.pow2Out.apply(b.fslope()) * (b.lifetime/b.type.lifetime);
        if(b.timer.get(0, (3 + slope * 2) * this.trailTimeMul)){
          this.trailEffect.at(b.x, b.y, sentryUnit.hitSize * this.trailSizeMul * (slope + 1), this.backColor);
        }
        this.super$update(b);
      },
      draw(b){
        if(!b) return;
        var offset = -90 + (this.spin != 0 ? b.fout() * (this.spin + Mathf.randomSeed(b.id, 360)) : 0);
        var scale = 1 + Interp.pow2Out.apply(b.fslope()) * this.scaleAmount * (b.lifetime/b.type.lifetime);
        var shadow = this.shadowOffset * scale * Interp.pow2Out.apply(b.fslope());
        
        Draw.z(Layer.flyingUnit + 1);
        
        Draw.color(Pal.shadow);
        Draw.rect(this.boxRegion, b.x - shadow, b.y - shadow, this.boxRegion.width / 4 * scale, this.boxRegion.height / 4 * scale, b.rotation() + offset);
        Draw.color();
        
        Draw.z(Layer.flyingUnit + 2);
        Draw.rect(this.boxRegion, b.x, b.y, this.boxRegion.width / 4 * scale, this.boxRegion.height / 4 * scale, b.rotation() + offset);
        
        Draw.z(Layer.flyingUnit + 1);
        // Drawf.shadow(this.region, b.x - shadow, b.y - shadow, this.region.width / 4 * scale, this.region.height / 4 * scale, b.rotation() + offset);
        Draw.color(Pal.shadow);
        Draw.rect(this.region, b.x - shadow, b.y - shadow, this.region.width / 4 * scale, this.region.height / 4 * scale, b.rotation() + offset);
        Draw.color();
        
        Draw.z(Layer.flyingUnit + 2);
        Draw.rect(this.region, b.x, b.y, this.region.width / 4 * scale, this.region.height / 4 * scale, b.rotation() + offset);
      },
      drawSize: 240,
      sprite: "clear",
      scaleVelocity: true,
      scaleAmount: 0.5,
      shadowOffset: 16,
      abosrbable: false,
      hittable: false,
      damage: 0,
      splasDamageRadius: -1,
      hitEffect: Fx.none,
      despawnEffect: Fx.spawn,
      trailTimeMul: 1,
      trailSizeMul: 0.25,
      ammoMultiplier: 1
    });
    return sentryB;
  }
}