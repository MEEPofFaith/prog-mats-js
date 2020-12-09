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
      Lines.stroke(1 * e.fout() * scl);

      Angles.randLenVectors(e.id + 1, 4, (1 + 23 * e.finpow()) * scl, (x, y) => {
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), (1 + e.fout() * 3) * scl);
      });
    });
    
    return smallBlast;
  }
}