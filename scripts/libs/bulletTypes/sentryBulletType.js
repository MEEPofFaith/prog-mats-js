module.exports = {
  sentryBullet(sentryUnit, type){
    const sentryB = extend(type, {
      despawned(b){
        if(!b) return;
        
        let sentry = sentryUnit.spawn(b.team, b.x, b.y);
        sentry.rotation = b.rotation();
        sentry.vel.add(b.vel);
        
        this.super$despawned(b);
      }
    });
    return sentryB;
  }
}