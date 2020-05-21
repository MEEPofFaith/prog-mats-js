const heatRiser = extendContent(LaserTurret, "eruptor", {});
const move = new Vec2();
const shooDur = 600;
const burnRadius = 18;
const damagePerTick = 500;

heatRiser.shootType = extend(BasicBulletType, {
  update(b){
    if(b.getOwner().bulletLife ==  shooDur){
      xLoc = b.getOwner().target.getX();
      yLoc = b.getOwner().target.getY();
    }
    if(dst(xLoc, yLoc, b.getOwner().target.getX(), b.getOwner().target.getY())/2 != 0){
      move = 1/(dst(xLoc, yLoc, b.getOwner().target.getX(), b.getOwner().target.getY())/2);
    }
    xLoc = Mathf.lerpDelta(xLoc, b.getOwner().target.getX(), move);
    yLoc = Mathf.lerpDelta(yLoc, b.getOwner().target.getY(), move);
    
    Damage.damage(b.getTeam(), xLoc, yLoc, burnRadius, damagePerTick);
  }
  draw(b){
    if(b.getOwner().bulletLife == shooDur){
      xLoc = b.getOwner().target.getX();
      yLoc = b.getOwner().target.getY();
    }
    if(dst(xLoc, yLoc, b.getOwner().target.getX(), b.getOwner().target.getY())/2 != 0){
      move = 1/(dst(xLoc, yLoc, b.getOwner().target.getX(), b.getOwner().target.getY())/2);
    }
    xLoc = Mathf.lerpDelta(xLoc, b.getOwner().target.getX(), move);
    yLoc = Mathf.lerpDelta(yLoc, b.getOwner().target.getY(), move);
    
    //test
    Draw.color(Color.valueOf("d17000"));
    Lines.stroke(1);
    Lines.circle(xLoc, yLoc, burnRadius);
  }
});
heatRiser.shootType.speed = 0.001;

heatRiser.shootDuration = shooDur;