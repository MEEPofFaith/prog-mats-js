const sentryAIL = prov(() => {
  var ai = extend(FlyingAI, {
    updateMovement(){ //Just don't move, but still turn.
      if(!Units.invalidateTarget(this.target, this.unit, this.unit.range()) && this.unit.type.rotateShooting){
        if(this.unit.type.hasWeapons()){
          this.unit.lookAt(Predict.intercept(this.unit, this.target, this.unit.type.weapons.first().bullet.speed));
        }
      }
    },
    retarget(){
      return this.timer.get(this.timerTarget, this.target == null ? 10 : 20);
    }
  });
  return ai;
});

module.exports = {
  sentryAI: sentryAIL
}