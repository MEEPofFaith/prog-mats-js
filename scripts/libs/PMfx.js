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
  trailEffect(lifetime, clip, border){
    let trail = new Effect(lifetime, clip, e => {
      if(border > 0){
        Draw.color(Pal.gray);
        Fill.circle(e.x, e.y, e.rotation * e.fout() + border);
      }
      Draw.color(e.color);
      Fill.circle(e.x, e.y, e.rotation * e.fout());
    });
    
    return trail;
  },
  critSparkle(lifetime, clip, amount, dist, length, diameter){
    let sparkle = new Effect(lifetime, clip, e => {
      Draw.color(e.color);
      Draw.alpha(e.fout());

      Tmp.v1.trns(e.rotation + 90, 0, length * e.fin(Interp.pow2Out));

      Angles.randLenVectors(e.id, amount, dist, (x, y) => {
        for(let i = 0; i < 2; i++){
          let rot = Mathf.randomSeed(e.id + x + y, 360) + 90 * i;
          let tx = x * e.fin(Interp.pow2Out);
          let ty = y * e.fin(Interp.pow2Out);
          Fill.rect(e.x + tx + Tmp.v1.x, e.y + ty + Tmp.v1.y, 1 * diameter, 0.25 * diameter, rot);
        }
      });
      Draw.reset();
    });

    return sparkle;
  },
  mushroomCloud(lifetime, clip, size){
    let mush = new Effect(lifetime, clip, e => {
      let colorFin = e.fin(Interp.pow2Out);
      let slopeFin = e.fin(Interp.pow3Out);
      let slopeFout = 1 - e.fin(Interp.pow3In);

      Angles.randLenVectors(e.id, 300, 140 * size * slopeFin, (x, y) => {
        Draw.color(Color.white, Color.gray, colorFin);
        Fill.circle(e.x + x, e.y + y, 8 * size * slopeFout);
      });

      Draw.color(Color.yellow, Color.lightGray, colorFin);
      Lines.stroke(6 * size * e.fout());
      Lines.circle(e.x, e.y, 180 * size * slopeFin);

      Angles.randLenVectors(e.id * 2, 400, 60 * size * slopeFin, (x, y) => {
        Draw.color(Color.orange.cpy().lerp([Color.orange, Color.red, Color.crimson, Color.darkGray], colorFin));
        Fill.circle(e.x + x, e.y + y, 8 * size * slopeFout);
      });
    });

    return mush;
  }
}