const ais = require("libs/ais");

module.exports = {
  sentryUnit(name){
    let sentryU = extend(UnitType, name, {
      drawEngine(unit){
        if(!unit.isFlying()) return;
        
        var scl = unit.elevation;
        var offset = unit.type.engineOffset / 2 + unit.type.engineOffset / 2 * scl;
        
        Draw.color(unit.team.color);
        for(let i = 0; i < this.engines; i++){
          Fill.circle(
            unit.x + Angles.trnsx(unit.rotation + this.engineRotOffset + (i * 360 / this.engines), offset),
            unit.y + Angles.trnsy(unit.rotation + this.engineRotOffset + (i * 360 / this.engines), offset),
            (unit.type.engineSize + Mathf.absin(Time.time, 2, unit.type.engineSize / 4)) * scl
          );
        }
        Draw.color(Color.white);
        for(let i = 0; i < this.engines; i++){
          Fill.circle(
            unit.x + Angles.trnsx(unit.rotation + this.engineRotOffset + (i * 360 / this.engines), offset - 1),
            unit.y + Angles.trnsy(unit.rotation + this.engineRotOffset + (i * 360 / this.engines), offset - 1),
            (unit.type.engineSize + Mathf.absin(Time.time, 2, unit.type.engineSize / 4)) /2 * scl
          );
        }
        Draw.color();
      },
      update(unit){
        var sub = (unit.type.health / this.duration) * Time.delta;
        unit.health -= sub;
        this.super$update(unit);
      },
      spawn(team, x, y){
        let out = this.create(team);
        out.set(x, y);
        out.health = out.maxHealth;
        out.add();
        return out;
      }
    });

    sentryU.constructor = () => extend(UnitEntity, {
      damaged(){
        return false;
      },
      heal(amount){},
      healFract(amount){},
      cap(){
        return Infinity;
      }
    });
    sentryU.defaultController = ais.sentryAI;

    sentryU.accel = 0;
    sentryU.speed = 0;
    sentryU.drag = 0.025;
    sentryU.flying = true;
    sentryU.engineSize = 2;
    sentryU.engines = 4;
    sentryU.engineOffset = 6;
    sentryU.engineRotOffset = 45;
    sentryU.duration = 60 * 10;
    sentryU.isCounted = false;
    
    return sentryU;
  }
}