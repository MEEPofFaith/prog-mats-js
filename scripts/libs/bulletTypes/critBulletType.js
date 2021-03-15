// rAnDoM cRiTs ArE fAiR aNd BaLaNcEd
module.exports = {
  critBullet(type, obj){
    if(obj == undefined) obj = {};
    obj = Object.assign({
      init(b){
        if(!b) return;
        if(b.data == null){ //If it's not already set, randomise it.
          if(Mathf.chance(this.critChance)){
            b.data = true;
          }else{
            b.data = false;
          }
        }
        if(b.data) b.damage *= this.critMultiplier;

        this.super$init(b);
      },
      update(b){
        if(!b) return;
        if(Mathf.chanceDelta(1) && b.data){
          this.critEffect.at(b.x, b.y, b.rotation(), b.team.color);
        }

        this.super$update(b);
      },
      hit(b, x, y){
        if(!b) return;
        let hitX = b.x;
        let hitY = b.y;
        if(x != null) hitX = x;
        if(y != null) hitY = y;

        b.hit = true;
        this.hitEffect.at(hitX, hitY, b.rotation(), this.hitColor);
        this.hitSound.at(hitX, hitY, this.hitSoundPitch, this.hitSoundVolume);

        Effect.shake(this.hitShake, this.hitShake, b);

        if(this.fragBullet != null){
          for(let i = 0; i < this.fragBullets; i++){
            let len = Mathf.random(1, 7);
            let a = b.rotation() + Mathf.range(this.fragCone/2) + this.fragAngle;
            //If this is a crit, the frags are also a crit
            this.fragBullet.create(b.owner, b.team, hitX + Angles.trnsx(a, len), hitY + Angles.trnsy(a, len), a, -1, Mathf.random(this.fragVelocityMin, this.fragVelocityMax), Mathf.random(this.fragLifeMin, this.fragLifeMax), b.data);
          }
        }

        if(this.puddleLiquid != null && this.puddles > 0){
          for(let i = 0; i < this.puddles; i++){
            let tile = Vars.world.tileWorld(hitX + Mathf.range(this.puddleRange), hitY + Mathf.range(this.puddleRange));
            Puddles.deposit(tile, this.puddleLiquid, this.puddleAmount);
          }
        }

        if(Mathf.chance(this.incendChance)){
          Damage.createIncend(hitX, hitY, this.incendSpread, this.incendAmount);
        }

        if(this.splashDamageRadius > 0 && !b.absorbed){
          Damage.damage(b.team, hitX, hitY, this.splashDamageRadius, this.splashDamage * b.damageMultiplier() * (b.data ? this.critMultiplier : 1), this.collidesAir, this.collidesGround);

          if(this.status != StatusEffects.none){
            Damage.status(b.team, hitX, hitY, this.splashDamageRadius, this.status, this.statusDuration, this.collidesAir, this.collidesGround);
          }

          if(this.healPercent > 0){
            Vars.indexer.eachBlock(b.team, hitX, hitY, this.splashDamageRadius, other => other.damaged, other => {
              Fx.healBlockFull.at(other.x, other.y, other.block.size, Pal.heal);
              other.heal(this.healPercent / 100 * other.maxHealth());
            });
          }

          if(this.makeFire){
            Vars.indexer.eachBlock(null, hitX, hitY, this.splashDamageRadius, other => other.team != b.team, other => {
              Fires.create(other.tile);
            });
          }
        }

        for(let i = 0; i < this.lightning; i++){
          Lightning.create(b, this.lightningColor, (this.lightningDamage < 0 ? this.damage : this.lightningDamage) * (b.data ? this.critMultiplier : 1), b.x, b.y, b.rotation() + Mathf.range(this.lightningCone/2) + this.lightningAngle, this.lightningLength + Mathf.random(this.lightningLengthRand));
        }
      },

      critChance: 0.25,
      critMultiplier: 5,
      critEffect: Fx.none
    }, obj);

    const crit = extend(type, obj);

    return crit;
  }
}