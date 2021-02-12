const ais = require("libs/ais");
const register = require("libs/unit/register");

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
        if(!unit.dead && unit.health > 0) unit.elevation = Mathf.clamp(unit.elevation + this.riseSpeed * Time.delta);
        
        var sub = (unit.type.health / this.duration) * Time.delta;
        unit.health -= sub;
        this.super$update(unit);
      },
      create(team){
        let unit = sentryU.constructor.get();
        unit.team = team;
        unit.setType(this);
        unit.ammo = sentryU.ammoCapacity;
        unit.elevation = 0;
        unit.health = unit.maxHealth;
        return unit;
      },
      setStats(){
        this.super$setStats();
        const dur = new StatValue({
          display(table){
            let durSec = sentryU.duration / 60;
            let val = durSec + " " + StatUnit.seconds.localized();
            table.add("(" + Core.bundle.get("stat.prog-mats.sentry-lifetime") + ": " + val + ")");
          }
        });
        this.stats.add(Stat.abilities, dur);
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
      },
      prefRotation(){
        return this.rotation; //Don't turn to velocity, just turn and shoot emediately.
      },
      classId: () => sentryU.classId
    });
    sentryU.defaultController = ais.sentryAI;

    sentryU.accel = 0;
    sentryU.speed = 0;
    sentryU.drag = 0.025;
    sentryU.flying = true;
    sentryU.lowAltitude = true;
    sentryU.engineSize = 2;
    sentryU.engines = 4;
    sentryU.engineOffset = 6;
    sentryU.engineRotOffset = 45;
    sentryU.duration = 60 * 10;
    sentryU.isCounted = false;
    sentryU.riseSpeed = 0.016;
    sentryU.itemCapacity = 10;
    
    register(sentryU);
    
    return sentryU;
  }
}