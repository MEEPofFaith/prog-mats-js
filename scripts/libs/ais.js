const sentryAIL = prov(() => {
  var ai = extend(GroundAI, {
    updateMovement(){
      if(!Units.invalidateTarget(this.target, this.unit, this.unit.range()) && this.unit.type.rotateShooting){
        if(this.unit.type.hasWeapons()){
          this.unit.lookAt(Predict.intercept(this.unit, this.target, this.unit.type.weapons.first().bullet.speed));
        }
      }
    } //Just don't move, but still turn.
  });
  return ai;
});

module.exports = {
  sentryAI: sentryAIL
}