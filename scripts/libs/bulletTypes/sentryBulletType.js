module.exports = {
  sentryBullet(sentryUnit, addVel){ //Do not put anything that isn't a BasicBulletType or its children as its type.
    const sentryB = extend(ArtilleryBulletType, {
      load(){
        this.region = sentryUnit.icon(Cicon.full)
      },
      despawned(b){
        if(!b) return;
        
        let sentry = sentryUnit.spawn(b.team, b.x, b.y);
        sentry.rotation = b.rotation();
        if(addVel) sentry.vel.add(b.vel);
        
        this.super$despawned(b);
      },
      draw(b){
        if(!b) return;
        var offset = -90 + (this.spin != 0 ? b.fout() * (this.spin + Mathf.randomSeed(b.id, 360)) : 0);
        var scale = 1 + Interp.pow2Out.apply(b.fslope()) * this.scaleAmount * (b.lifetime/b.type.lifetime);
        var shadowOffet = (this.region.width + this.region.height) / 8 * Mathf.curve(scale, 1, 1 + this.scaleAmount);
        
        Draw.z(Layer.effect + 1);
        
        // Drawf.shadow(this.region, b.x - shadowOffet, b.y - shadowOffet, this.region.width / 4 * scale, this.region.height / 4 * scale, b.rotation() + offset);
        Draw.color(Pal.shadow);
        Draw.rect(this.region, b.x - shadowOffet, b.y - shadowOffet, this.region.width / 4 * scale, this.region.height / 4 * scale, b.rotation() + offset);
        Draw.color();
        
        Draw.rect(this.region, b.x, b.y, this.region.width / 4 * scale, this.region.height / 4 * scale, b.rotation() + offset);
      },
      scaleVelocity: true,
      scaleAmount: 0.5,
      abosrbable: false,
      hittable: false,
      splasDamageRadius: -1,
      hitEffect: Fx.none,
      despawnEffect: Fx.spawn
    });
    return sentryB;
  }
}