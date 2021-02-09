module.exports = {
  scaledBasicHit(scl){
    const basicHit = new Effect(14, e => {
      Draw.color(Color.white, Pal.lightOrange, e.fin());
      
      e.scaled(7, s => {
        Lines.stroke((0.5 + s.fout()) * scl);
        Lines.circle(e.x, e.y, s.fin() * 5 * scl);
      });

      Lines.stroke((0.5 + e.fout()) * scl);

      Angles.randLenVectors(e.id, 5, e.fin() * 15 * scl, (x, y) => {
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), (e.fout() * 3 + 1) * scl);
      });
    });
    
    return basicHit;
  },
  scaledSmallBlast(scl){
    const smallBlast = new Effect(20, e => {
      Draw.color(Pal.bulletYellow);

      e.scaled(6, s => {
        Lines.stroke(3 * s.fout() * scl);
        Lines.circle(e.x, e.y, (3 + s.fin() * 10) * scl);
      });

      Draw.color(Color.gray);

      Angles.randLenVectors(e.id, 5, (2 + 23 * e.finpow()) * scl, (x, y) => {
        Fill.circle(e.x + x, e.y + y, (e.fout() * 3 + 0.5) * scl);
      });

      Draw.color(Pal.lighterOrange);
      Lines.stroke(e.fout() * scl);

      Angles.randLenVectors(e.id + 1, 4, (1 + 23 * e.finpow()) * scl, (x, y) => {
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), (1 + e.fout() * 3) * scl);
      });
    });
    
    return smallBlast;
  },
  scaledLargeBlast(scl){
    const bigBlast = new Effect(30, e => {
      Draw.color(Pal.missileYellow);

      e.scaled(7, s => {
        Lines.stroke(3 * s.fout() * scl);
        Lines.circle(e.x, e.y, (4 + s.fin() * 30) * scl);
      });

      Draw.color(Color.gray);

      Angles.randLenVectors(e.id, 8, (2 + 30 * e.finpow()) * scl, (x, y) => {
        Fill.circle(e.x + x, e.y + y, (e.fout() * 4 + 0.5) * scl);
      });

      Draw.color(Pal.missileYellowBack);
      Lines.stroke(e.fout() * scl);

      Angles.randLenVectors(e.id + 1, 6, (1 + 29 * e.finpow()) * scl, (x, y) => {
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), (1 + e.fout() * 4) * scl);
      });
    });
    
    return bigBlast;
  },
  scaledNuclearExplosion(scl, cloudScl, clouds, impact){
    const nukeBlast = new Effect(140, e => {
      e.scaled(16, s => {
        Draw.color(Pal.missileYellow);
        Lines.stroke(3 * s.fout() * scl);
        Lines.circle(e.x, e.y, (4 + s.fin() * 30) * scl);
      });
      e.scaled(60, s => {
        Draw.color(Color.gray);

        Angles.randLenVectors(e.id, 8, (2 + 30 * s.finpow()) * scl, (x, y) => {
          Fill.circle(e.x + x, e.y + y, (s.fout() * 4 + 0.5) * scl);
        });

        Draw.color(Pal.missileYellowBack);
        Lines.stroke(s.fout() * scl);

        Angles.randLenVectors(e.id + 1, 6, (1 + 29 * s.finpow()) * scl, (x, y) => {
          Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), (1 + s.fout() * 4) * scl);
        });
      });
      Angles.randLenVectors(e.id + 3, clouds, (e.finpow() * 160) * cloudScl, (x, y) => {
        var size = (e.fout() * 15) * cloudScl;
        if(impact){
          Draw.color(Pal.lighterOrange, Color.lightGray, e.fin());
        }else{
          Draw.color(Color.lime, Color.gray, e.fin());
        }
        Fill.circle(e.x + x, e.y + y, size/2);
      });
    });
    
    return nukeBlast;
  },
  trailEffect(lifetime, border){
    let trail = new Effect(lifetime, e => {
      if(border > 0){
        Draw.color(Pal.gray);
        Fill.circle(e.x, e.y, e.rotation * e.fout() + border);
      }
      Draw.color(e.color);
      Fill.circle(e.x, e.y, e.rotation * e.fout());
    });
    
    return trail;
  }
}