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
      },

      arrows: 5,
      warmup: 0.05,
      chargeup: 0.07,
      speed: 0.05,
      sep: 0.5
    }, obj);
    
    objb = Object.assign({
      draw(){
        this.super$draw();
        if(this.warmup > 0.01){
          Draw.color(this.team.color);
          for(let i = 0; i < launch.arrows; i++){
            Draw.alpha(Mathf.clamp(Mathf.sin(this.current - i * launch.sep, 1, this.warmup)));
            Draw.rect(launch.arrowRegions[i], this.x + launch.tr2.x, this.y + launch.tr2.y, this.rotation - 90);
          }
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
        
        this.super$updateTile();
      }
    }, objb);

    const launch = extend(type, name, obj);

    launch.buildType = ent => {
      ent = extend(build, launch, clone(objb));
      ent.warmup = 0;
      ent.speed = 0;
      ent.current = 0;
      return ent;
    }

    return launch;
  }
}