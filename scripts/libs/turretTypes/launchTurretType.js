//Haha code steal go brrrr
const clone = obj => {
  if(obj === null || typeof(obj) !== 'object') return obj;
  var copy = obj.constructor();
  for(var attr in obj) {
    if(obj.hasOwnProperty(attr)) {
      copy[attr] = obj[attr];
    }
  };
  return copy;
}

module.exports = {
  launchTurret(type, build, name, obj, objb){
    if(obj == undefined) obj = {};
    if(objb == undefined) objb = {};

    obj = Object.assign({
      load(){
        this.super$load();
        this.arrowRegions = [];
        for(let i = 0; i < this.arrows; i++){
          this.arrowRegions[i] = Core.atlas.find(this.name + "-arrow-" + i);
        }
        this.topRegion = Core.atlas.find(this.name + "-top");
      },
      
      chargeTime: 10,
      shootEffect: Fx.none,
      smokeEffect: Fx.none,
      shootSound: Sounds.artillery,

      arrows: 5,
      warmup: 0.05,
      chargeup: 0.07,
      speed: 0.05,
      sep: 0.5,
      back: 0,
      end: -6,
      pauseTime: 1.25,

      launchEffect: Fx.none,
      launchSmokeEffect: Fx.none
    }, obj);
    
    objb = Object.assign({
      draw(){
        Draw.rect(launch.baseRegion, this.x, this.y);

        launch.tr2.trns(this.rotation, -this.recoil);

        let x = this.x + launch.tr2.x;
        let y = this.y + launch.tr2.y;

        Draw.z(Layer.turret);

        Drawf.shadow(launch.region, x - launch.elevation, y - launch.elevation, this.rotation - 90);
        
        Draw.rect(launch.region, x, y, this.rotation - 90);

        if(this.warmup > 0.01){
          Draw.color(this.team.color);
          for(let i = 0; i < launch.arrows; i++){
            Draw.alpha(Mathf.clamp(Mathf.sin(this.current - i * launch.sep, 1, this.warmup)));
            Draw.rect(launch.arrowRegions[i], x, y, this.rotation - 90);
          }
        }
        Draw.color();
        
        if(this.hasAmmo()){
          let sentryRegion = this.peekAmmo().frontRegion;
          let dst = (launch.shootLength + sentryRegion.height / 4) - launch.back;
          let hdst = dst / 2;
          let s = launch.size * Vars.tilesize;

          let rect1 = Tmp.r1.setCentered(this.x, this.y, s, dst).move(0, this.recoil - hdst);
          let rect2 = Tmp.r2.setCentered(this.x, this.y, sentryRegion.width / 4, sentryRegion.height / 4).move(0, this.recoil - this.offset);

          let clipped = this.clipRegion(rect1, rect2, sentryRegion);

          Tmp.v1.trns(this.rotation, this.offset - clipped.height / 2 * Draw.scl);
          Draw.rect(clipped, x + Tmp.v1.x, y + Tmp.v1.y, this.rotation - 90);
        }
        
        Draw.rect(launch.topRegion, x, y, this.rotation - 90);
      },
      updateShooting(){
        if(this.consValid()){
          if(this.reload >= launch.reloadTime && !this.charging){
            let type = this.peekAmmo();

            this.shoot(type);

            this.reload = 0;
          }else if(this.hasAmmo()){
            this.reload += this.delta() * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed();
          }
        }
      },
      updateCooling(){
        if(this.hasAmmo() && this.consValid()){
          this.super$updateCooling();
        }else{
          this.reload = 0;
        }
      },
      updateTile(){
        if(this.isShooting() && this.hasAmmo() && this.consValid()){
          this.warmup = Mathf.lerpDelta(this.warmup, 1, launch.warmup);
          this.speed = Mathf.lerpDelta(this.warmup, 1, launch.chargeup);
        }else{
          this.warmup = Mathf.lerpDelta(this.warmup, 0, launch.warmup);
          this.speed = Mathf.lerpDelta(this.warmup, 0, launch.chargeup);
        }
        this.current += launch.speed * this.speed * Time.delta;

        if(this.speed < 0.01){
          this.current = 0;
        }
        
        if(this.charging && this.hasAmmo()){
          this.charge = Mathf.clamp(this.charge + Time.delta / launch.chargeTime);
          let sentryRegion = this.peekAmmo().frontRegion;
          this.offset = Mathf.lerp(launch.back, launch.shootLength + sentryRegion.height / 8, this.charge);
        }else{
          this.charge = 0;
          this.offset = Mathf.lerp(launch.end, launch.back, Mathf.clamp(this.reload / launch.reloadTime * launch.pauseTime));
        }

        this.super$updateTile();
      },
      shoot(type){
        this.preEffscts();

        launch.tr.trns(this.rotation, launch.shootLength - this.recoil);

        launch.chargeBeginEffect.at(this.x + launch.tr.x, this.y + launch.tr.y, this.rotation);
        launch.chargeSound.at(this.x + launch.tr.x, this.y + launch.tr.y, 1);

        for(let i = 0; i < launch.chargeEffects; i++){
          Time.run(Mathf.random(launch.chargeMaxDelay), () => {
            if(!this.isValid()) return;
            launch.tr.trns(this.rotation, launch.shootLength - this.recoil);
            launch.chargeEffect.at(this.x + launch.tr.x, this.y + launch.tr.y, this.rotation);
          });
        }

        this.charging = true;

        Time.run(launch.chargeTime, () => {
          if(!this.isValid()) return;
          launch.tr.trns(this.rotation, launch.shootLength - this.recoil);
          this.bullet(type, this.rotation + Mathf.range(launch.inaccuracy));
          this.effects();
          this.charging = false;
          this.useAmmo();
        });
      },
      preEffscts(){
        this.recoil = launch.recoilAmount;
        this.heat = 1;

        if(launch.shootShake > 0){
          Effect.shake(launch.shootShake, launch.shootShake, this);
        }

        if(this.hasAmmo()){
          let sentryRegion = this.peekAmmo().frontRegion;
          Tmp.v1.trns(this.rotation, launch.back - sentryRegion.height / 8 - this.recoil);

          let x = this.x + Tmp.v1.x;
          let y = this.y + Tmp.v1.y;
    
          launch.launchEffect.at(x, y, this.rotation);	
          launch.launchSmokeEffect.at(x, y, this.rotation);	
          
          launch.shootSound.at(x, y, Mathf.random(0.9, 1.1));
        }
      },
      effects(){
        const fshootEffect = launch.shootEffect == Fx.none ? this.peekAmmo().shootEffect : launch.shootEffect;
        const fsmokeEffect = launch.smokeEffect == Fx.none ? this.peekAmmo().smokeEffect : launch.smokeEffect;
        
        let x = this.x + launch.tr.x;
        let y = this.y + launch.tr.y;
  
        fshootEffect.at(x, y, this.rotation);	
        fsmokeEffect.at(x, y, this.rotation);	
      },
      clipRegion(bounds, sprite, region){ //Just gonna steal this from payload conveyors don't mind me.
        let over = Tmp.r3;

        let overlaps = Intersector.intersectRectangles(bounds, sprite, over);

        let out = Tmp.tr1;
        out.set(region.texture);

        if(overlaps){
          let w = region.u2 - region.u;
          let h = region.v2 - region.v;
          let x = region.u, y = region.v;
          let newX = (over.x - sprite.x) / sprite.width * w + x;
          let newY = (over.y - sprite.y) / sprite.height * h + y;
          let newW = (over.width / sprite.width) * w, newH = (over.height / sprite.height) * h;

          out.set(newX, newY, newX + newW, newY + newH);
        }else{
          out.set(0, 0, 0, 0);
        }

        return out;
      },
      handleItem(source, item){
        this.reload = 0; //Sorry, but you can't just turn a half-built sentry into a different type of sentry. Gotta restart construction.
        this.super$handleItem(source, item);
      }
    }, objb);

    const launch = extend(type, name, obj);

    launch.buildType = ent => {
      ent = extend(build, launch, clone(objb));
      ent.warmup = 0;
      ent.speed = 0;
      ent.current = 0;
      ent.offset = 0;
      ent.charge = 0;
      return ent;
    }

    return launch;
  }
}