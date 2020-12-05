module.exports = {
  newMount(b, n){
    /*Notes: Too lazy to do charging, or continuous.*/
    const mount = {
      x: 0,
      y: 0,
      shootX: 0,
      xRand: 0,
      shootY: 0,
      yRand: 0,
      width: 3,
      height: 3,
      elevation: 4,
      
      reloadTime: 30,
      bullet: b,
      ammoPerShot: 1,
      range: 80,
      rotateSpeed: 5,
      inaccuracy: 0,
      velocityInaccuracy: 0,
      shootCone: 8,
      targetAir: true,
      targetGround: true,
      
      recoilAmount: 1,
      restitution: 0.02,
      heatColor: Pal.turretHeat,
      cooldown: 0.02,
      
      name: n,
      
      shootEffect: Fx.none,
      smokeEffect: Fx.none,
      coolEffect: Fx.fuelburn,
      ejectEffect: Fx.none,
      ejectX: 1,
      ejectY: -1,
      altEject: true,
      ejectRight: true,
      shootSound: Sounds.shoot,
      shootShake: 0,
      
      minRange: 0,
      shots: 1,
      barrels: 1,
      barrelSpacing: 0,
      sequential: false,
      spread: 0,
      burstSpacing: 0,
      
      unitSort: (u, x, y) => Mathf.dst(u.x, u.y, x, y)
    };
    
    return mount;
  },
  newMultiTurret(name, mounts, ammoItem, mainBullet){
    const amount = mounts.length;
    const multiTur = extendContent(ItemTurret, name, {
      load(){
        this.super$load();
        this.turrets = [];
        for(var i = 0; i < amount; i++){
          //[Sprite, Outline, Heat]
          var sprites = [Core.atlas.find(mounts[i].name), Core.atlas.find(mounts[i].name + "-outline"), Core.atlas.find(mounts[i].name + "-heat")];
          this.turrets[i] = sprites;
        }
      },
      drawPlace(x ,y ,rotation, valid){
        this.super$drawPlace(x, y, rotation, valid);
        for(var i = 0; i < amount; i++){
          var tX = x * Vars.tilesize + this.offset + mounts[i].x;
          var tY = y * Vars.tilesize + this.offset + mounts[i].y;
          Drawf.dashCircle(tX,tY, mounts[i].range, Pal.placing); //I already know this'll be terrible in game.
        }
      },
      icons(){
        return[this.baseRegion, Core.atlas.find(this.name + "-icon")]
      }
    });
    
    multiTur.ammo(ammoItem, mainBullet);
    multiTur.mountTimer = multiTur.timers++;
    multiTur.mountInterval = 20;
    
    multiTur.buildType = ent => {
      ent = extendContent(ItemTurret.ItemTurretBuild, multiTur, {
        setEffs(){
          this._reloads = [];
          this._heats = [];
          this._recoils = [];
          this._shotCounters = [];
          this._rotations = [];
          this._targets = [];
          this._targetPoss = [];
          for(var i = 0; i < amount; i++){
            this._reloads[i] = 0;
            this._heats[i] = 0;
            this._recoils[i] = 0;
            this._shotCounters[i] = 0;
            this._rotations[i] = 0;
            this._targets[i] = null;
            this._targetPoss[i] = new Vec2();
          }
        },
        drawSelect(){
          this.super$drawSelect();
          for(var i = 0; i < amount; i++){
            Tmp.v1.trns(this.rotation - 90, mounts[i].x, mounts[i].y);
            Tmp.v1.add(this.x, this.y);
            Drawf.dashCircle(Tmp.v1.x, Tmp.v1.y, mounts[i].range, Pal.placing); //I already know this'll be terrible in game.
          }
        },
        draw(){
          this.super$draw();
          
          for(var i = 0; i < amount; i++){
            Tmp.v1.trns(this.rotation - 90, mounts[i].x, mounts[i].y - this.recoil);
            Tmp.v1.add(this.x, this.y);
            Tmp.v2.trns(this._rotations[i], -this._recoils[i]);
            
            var x = Tmp.v1.x + Tmp.v2.x;
            var y = Tmp.v1.y + Tmp.v2.y;
            
            Drawf.shadow(multiTur.turrets[i][0], x - mounts[i].elevation, y - mounts[i].elevation, this._rotations[i] - 90);
            Draw.rect(multiTur.turrets[i][1], x, y, this._rotations[i] - 90);
            Draw.rect(multiTur.turrets[i][0], x, y, this._rotations[i] - 90);
            
            if(multiTur.turrets[i][2] != Core.atlas.find("error") && this._heats[i] > 0.00001){
              Draw.color(Tmp.v1.heatColor, this._heats[i]);
              Draw.blend(Blending.additive);
              Draw.rect(multiTur.turrets[i][2], x, y, this._rotations[i] - 90);
              Draw.blend();
              Draw.color();
            }
          }
        },
        updateTile(){
          this.super$updateTile();
          
          for(var i = 0; i < amount; i++){
            this._recoils[i] = Mathf.lerpDelta(this._recoils[i], 0, mounts[i].restitution);
            this._heats[i] = Mathf.lerpDelta(this._heats[i], 0, mounts[i].cooldown);
            
            if(!this.validateMountTarget(i)) this._targets[i] = null;
          }
          
          if(this.hasAmmo()){
            if(this.timer.get(multiTur.mountTimer, multiTur.mountInterval)){
              for(var i = 0; i < amount; i++){
                Tmp.v1.trns(this.rotation - 90, mounts[i].x, mounts[i].y);
                Tmp.v1.add(this.x, this.y);
                
                this._targets[i] = this.findMountTargets(i, Tmp.v1.x, Tmp.v1.y);
              }
            }
            
            for(var i = 0; i < amount; i++){
              Tmp.v1.trns(this.rotation - 90, mounts[i].x, mounts[i].y);
              Tmp.v1.add(this.x, this.y);
              var x = Tmp.v1.x;
              var y = Tmp.v1.y
              
              if(this.validateMountTarget(i)){
                var canShoot = true;

                if(this.isControlled()){ //player behavior
                  this._targetPoss[i].set(this.unit.aimX, this.unit.aimY);
                  canShoot = this.unit.isShooting;
                }else if(this.logicControlled()){ //logic behavior
                  this._targetPoss[i] = this.targetPos;
                  canShoot = this.logicShooting;
                }else{ //default AI behavior
                  this.mountTargetPosition(i, this._targets[i], x, y);

                  if(isNaN(this._rotations[i])){
                    this._rotations[i] = 0;
                  }
                }

                var targetRot = Angles.angle(x, y, this._targetPoss[i].x, this._targetPoss[i].y);

                this.mountTurnToTarget(i, targetRot);

                if(Angles.angleDist(this._rotations[i], targetRot) < mounts[i].shootCone && canShoot){
                  this.wasShooting = true;
                  this.updateMountShooting(i);
                }
              }
            }
          }
        },
        turnToTarget(target){
          this.super$turnToTarget(target);
          var speed = multiTur.rotateSpeed * this.delta() * this.baseReloadSpeed()
          var dist = Math.abs(Angles.angleDist(this.rotation, target));
          
          if(dist < speed) return;
          var angle = Mathf.mod(this.rotation, 360);
          var to = Mathf.mod(target, 360);

          if((angle > to && Angles.backwardDistance(angle, to) > Angles.forwardDistance(angle, to)) || (angle < to && Angles.backwardDistance(angle, to) < Angles.forwardDistance(angle, to))){
            var allRot = -speed;
          }else{
            var allRot = speed;
          }
          
          for(var i = 0; i < amount; i++){
            this._rotations[i] = (this._rotations[i] + allRot) % 360;;
          }
        },
        mountTurnToTarget(mount, target){
          this._rotations[mount] = Angles.moveToward(this._rotations[mount], target, mounts[mount].rotateSpeed * this.delta() * this.baseReloadSpeed());
        },
        findMountTargets(mount, x, y){
          if(mounts[mount].targetAir && !mounts[mount].targetGround){
            return Units.bestEnemy(this.team, x, y, mounts[mount].range, e => !e.dead && !e.isGrounded(), mounts[mount].unitSort);
          }else{
            return Units.bestTarget(this.team, x, y, mounts[mount].range, e => !e.dead && (e.isGrounded() || mounts[mount].targetAir) && (!e.isGrounded() || mounts[mount].targetGround), b => true, mounts[mount].unitSort);
          }
        },
        validateMountTarget(mount){
          Tmp.v1.trns(this.rotation - 90, mounts[mount].x, mounts[mount].y);
          Tmp.v1.add(this.x, this.y);
          
          return !Units.invalidateTarget(this._targets[mount], this.team, Tmp.v1.x, Tmp.v1.y) || this.isControlled() || this.logicControlled();
        },
        mountTargetPosition(mount, pos, x, y){
          if(!this.hasAmmo()) return;
          var bullet = mounts[mount].bullet;
          var speed = bullet.speed;
          //slow bullets never intersect
          if(speed < 0.1) speed = 9999999;
          
          this._targetPoss[mount].set(Predict.intercept(Tmp.v4.set(x, y), pos, speed));
          
          if(this._targetPoss[mount].isZero()){
            this._targetPoss[mount].set(this._targets[mount]);
          }
        },
        updateMountShooting(mount){
          if(this._reloads[mount] >= mounts[mount].reloadTime){
            const type = mounts[mount].bullet;
            
            this.mountShoot(mount, type);
            
            this._reloads[mount] = 0;
          }else{
            this._reloads[mount] += this.delta() * mounts[mount].bullet.reloadMultiplier * this.baseReloadSpeed();
          }
        },
        updateCooling(){
          this.super$updateCooling();
          
          var maxUsed = multiTur.consumes.get(ConsumeType.liquid).amount / amount;

          var liquid = this.liquids.current();
          
          for(var i = 0; i < amount; i++){
            var used = Math.min(Math.min(this.liquids.get(liquid), maxUsed * Time.delta), Math.max(0, ((mounts[i].reloadTime - this._reloads[i]) / multiTur.coolantMultiplier) / liquid.heatCapacity)) * this.baseReloadSpeed();
            this._reloads[i] += used * liquid.heatCapacity * multiTur.coolantMultiplier;
            
            this.liquids.remove(liquid, used);
            
            Tmp.v1.trns(this.rotation - 90, mounts[i].x, mounts[i].y - this.recoil);
            Tmp.v1.add(this.x, this.y);
            
            if(Mathf.chance(0.06 / amount * used)){
              mounts[i].coolEffect.at(Tmp.v1.x + Mathf.range(mounts[i].width), Tmp.v1.y + Mathf.range(mounts[i].height));
            }
          }
        },
        mountShoot(mount, type){
          for(var j = 0; j < mounts[mount].shots; j++){
            const spreadAmount = j;
            Time.run(mounts[mount].burstSpacing * j, () => {
              if(!this.isValid() || !this.hasAmmo()) return;
              
              var i = (this._shotCounters[mount] % mounts[mount].barrels) - (mounts[mount].barrels - 1) / 2;
              
              Tmp.v1.trns(this.rotation - 90, mounts[mount].x, mounts[mount].y - this.recoil);
              Tmp.v1.add(this.x, this.y);
              Tmp.v2.trns(this._rotations[mount], -this._recoils[mount]);
              Tmp.v3.trns(this._rotations[mount] - 90, mounts[mount].shootX + mounts[mount].barrelSpacing * i + mounts[mount].xRand, mounts[mount].shootY + mounts[mount].yRand);
              
              var x = Tmp.v1.x + Tmp.v2.x + Tmp.v3.x;
              var y = Tmp.v1.y + Tmp.v2.y + Tmp.v3.y;
              
              if(mounts[mount].shootShake > 0){
                Effect.shake(mounts[mount].shootShake, mounts[mount].shootShake, x, y);
              }
              
              var fshootEffect = mounts[mount].shootEffect == Fx.none ? type.shootEffect : mounts[mount].shootEffect;
              var fsmokeEffect = mounts[mount].smokeEffect == Fx.none ? type.smokeEffect : mounts[mount].smokeEffect;

              fshootEffect.at(x, y, this._rotations[mount]);
              fsmokeEffect.at(x, y, this._rotations[mount]);
              
              mounts[mount].shootSound.at(x, y, Mathf.random(0.9, 1.1));
              
              this._recoils[mount] = mounts[mount].recoilAmount;
              this._heats[mount] = 1;
              
              this.mountUseAmmo(mount);
              
              var velScl = 1 + Mathf.range(mounts[mount].velocityInaccuracy);
              var lifeScl = type.scaleVelocity ? Mathf.clamp(Mathf.dst(x, y, this._targetPoss[mount].x, this._targetPoss[mount].y) / type.range(), mounts[mount].minRange / type.range(), mounts[mount].range / type.range()) : 1;
              var angle = this._rotations[mount] + Mathf.range(mounts[mount].inaccuracy + type.inaccuracy) + (spreadAmount - (mounts[mount].shots / 2)) * mounts[mount].spread;
              
              type.create(this, this.team, x, y, angle, velScl, lifeScl);
              
              if(mounts[mount].sequential){
                this._shotCounters[mount]++;
              }
            });
          }
          
          if(!mounts[mount].sequential){
            this._shotCounters[mount]++;
          }
        },
        mountUseAmmo(mount){
          if(this.cheating()) return this.peekAmmo();

          const entry = this.ammo.peek();
          entry.amount -= mounts[mount].ammoPerShot;
          if(entry.amount <= 0) this.ammo.pop();
          this.totalAmmo -= mounts[mount].ammoPerShot;
          this.totalAmmo = Mathf.maxZero(this.totalAmmo);
          this.mountEjectEffects(mount);
          return entry.type();
        },
        mountEjectEffects(mount){
          if(!this.isValid()) return;
          
          var side = mounts[mount].altEject ? Mathf.signs[this._shotCounters[mount] % 2] : mounts[mount].ejectRight;
          
          Tmp.v1.trns(this.rotation - 90, mounts[mount].x, mounts[mount].y - this.recoil);
          Tmp.v1.add(this.x, this.y);
          Tmp.v2.trns(this._rotations[mount], -this._recoils[mount]);
          Tmp.v3.trns(this.rotation - 90, mounts[mount].ejectX * side, mounts[mount].ejectY);
          
          var x = Tmp.v1.x + Tmp.v2.x + Tmp.v3.x;
          var y = Tmp.v1.y + Tmp.v2.y + Tmp.v3.y;
          
          mounts[mount].ejectEffect.at(x, y, this._rotations[mount] * side);
        }
      });
      ent.setEffs();
      return ent;
    }
    return multiTur;
  }
}