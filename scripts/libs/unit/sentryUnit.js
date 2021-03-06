const ais = require("libs/unit/ais");
const register = require("libs/unit/register");

module.exports = {
  sentryUnit(name, obj){
    if(obj == undefined) obj = {};
    obj = Object.assign({
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
      },
      
      accel: 0,
      speed: 0,
      drag: 0.025,
      flying: true,
      lowAltitude: true,
      engineSize: 2,
      engines: 4,
      engineOffset: 6,
      engineRotOffset: 45,
      duration: 60 * 10,
      isCounted: false,
      riseSpeed: 0.016,
      itemCapacity: 10,
      health: 200
    }, obj);

    let sentryU = extend(UnitType, name, obj);

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
    
    register(sentryU);
    
    return sentryU;
  }
}