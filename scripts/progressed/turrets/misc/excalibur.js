const bul = require("libs/bulletTypes/crossLaserBulletType");
const sword = bul.crossLaser(0.3, 0.7, 3.5, 2, 18, 300, 1000, true, true, true);
sword.length = 800;
sword.width = 26;
sword.growTime = 10;
sword.fadeTime = 25;
sword.lifetime = 60;
sword.colors = [Color.valueOf("E8D174").mul(1, 1, 1, 0.4), Color.valueOf("F3E979"), Color.white];

const arthur = extendContent(PowerTurret, "excalibur", {
  load(){
    this.super$load();
    this.sides = [];
    this.outlineRegions = [];
    this.cells = [];
    this.lightRegions = [];
    
    this.baseRegion = Core.atlas.find("prog-mats-block-6");
    this.tBase = Core.atlas.find(this.name + "-bottom");
    this.tCross = Core.atlas.find(this.name + "-top");
    for(var i = 0; i < 2; i++){
      this.sides[i] = Core.atlas.find(this.name + "-side" + i);
      this.outlineRegions[i] = Core.atlas.find(this.name + "-outline-" + i);
    }
    for(var i = 0; i < 8; i++){
      this.cells[i] = Core.atlas.find(this.name + "-cell-" + i);
    }
    for(var i = 0; i < 11; i++){
      this.lightRegions[i] = Core.atlas.find(this.name + "-cell-light-" + i);
    }
  },
  icons(){
    return [
      Core.atlas.find(this.baseRegion),
      Core.atlas.find(this.name + "-icon")
    ];
  }
});
arthur.buildType = ent => {
	ent = extendContent(PowerTurret.PowerTurretBuild, arthur, {
    setEff(){
      this.openX = 0;
      this.openY = 0;
      this.chargeTimer = 0;
      this.activeAnim = false;
      this.cellLights = [0, 0, 0, 0, 0];
    },
    draw(){
      Tmp.v1.trns(this.rotation - 90, -this.openX, this.openY - this.recoil);
      Tmp.v2.trns(this.rotation - 90, this.openX, this.openY - this.recoil);
      var sXPre = [Tmp.v1.x, Tmp.v2.x];
      var sYPre = [Tmp.v1.y, Tmp.v2.y];
      var sX = [sXPre[0] + this.x, sXPre[1] + this.x];
      var sY = [sYPre[0] + this.y, sYPre[1] + this.y];
      
      this.baseLoc.trns(this.rotation, -this.recoil);
      var xPre = this.baseLoc.x;
      var yPre = this.baseLoc.y;
      var x = this.baseLoc.x + this.x;
      var y = this.baseLoc.y + this.y;
      
      Draw.rect(arthur.baseRegion, this.x, this.y);
      
      Draw.z(Layer.turret);
      
      Drawf.shadow(arthur.tBase, x - arthur.size / (4/3), y - arthur.size / (4/3), this.rotation - 90);
      Drawf.shadow(arthur.sides[0], sX[0] - arthur.size / (4/3), sY[0] - arthur.size / (4/3), this.rotation - 90);
      Drawf.shadow(arthur.sides[1], sX[1] - arthur.size / (4/3), sY[1] - arthur.size / (4/3), this.rotation - 90);
      
      Draw.rect(arthur.outlineRegions[0], x, y, this.rotation - 90);
      for(var i = 0; i < 2; i++){
        Draw.rect(arthur.outlineRegions[1], sX[i], sY[i], arthur.outlineRegions[1].width / 4 * Mathf.signs[i], arthur.outlineRegions[1].height / 4, this.rotation - 90);
      }
      Draw.rect(arthur.tBase, x, y, this.rotation - 90);
      Draw.rect(arthur.sides[0], sX[0], sY[0], this.rotation - 90);
      Draw.rect(arthur.sides[1], sX[1], sY[1], this.rotation - 90);
      
      if(this.activeAnim){
        Draw.color(Color.valueOf("F3E979"));
        var lightCoordsSet1 = [
          [21/4, -65/4, 26/4, -60/4, 3],
          [33/4, -40/4, 38/4, -35/4, 3],
          [63/4, -55/4, 63/4, -46/4, 3],
          [71/4, -47/4, 71/4, -38/4, 3],
          [61/4, -6/4, 61/4, 2/4, 4],
        ];
        for(var i = 0; i < 5; i++){
          if(this.cellLights[i] > 0.001){
            Draw.alpha(this.cellLights[i]);
            Draw.rect(arthur.cells[i], x, y, this.rotation - 90);
            for(var j = 0; j < 2; j++){
              Tmp.v3.trns(this.rotation - 90, lightCoordsSet1[i][0] * Mathf.signs[j], lightCoordsSet1[i][1]);
              Tmp.v3.add(x, y);
              Tmp.v4.trns(this.rotation - 90, lightCoordsSet1[i][2] * Mathf.signs[j], lightCoordsSet1[i][3]);
              Tmp.v4.add(x, y);
              Drawf.light(this.team, Tmp.v3.x, Tmp.v3.y, Tmp.v4.x, Tmp.v4.y, lightCoordsSet1[i][4], arthur.heatColor, this.cellLights[i] * 0.7);
            }
          }
        }
        var lightCoordsSet2 = [
          [21/4, 39/4, 21/4, 47/4, 3],
          [21/4, 52/4, 21/4, 60/4, 3],
          [21/4, 65/4, 21/4, 73/4, 3],
        ];
        for(var i = 5; i < 8; i++){
          if(this.cellLights[i - 3] > 0.001){
            Draw.alpha(this.cellLights[i - 3]);
            for(var j = 0; j < 2; j++){
              Draw.rect(arthur.cells[i], sX[j], sY[j], arthur.cells[i].width / 4 * Mathf.signs[j], arthur.cells[i].height / 4, this.rotation - 90);
              Tmp.v5.trns(this.rotation - 90, lightCoordsSet2[i - 5][0] * Mathf.signs[j], lightCoordsSet2[i - 5][1]);
              Tmp.v5.add(sX[j], sY[j]);
              Tmp.v6.trns(this.rotation - 90, lightCoordsSet2[i - 5][2] * Mathf.signs[j], lightCoordsSet2[i - 5][3]);
              Tmp.v6.add(sX[j], sY[j]);
              Drawf.light(this.team, Tmp.v5.x, Tmp.v5.y, Tmp.v6.x, Tmp.v6.y, lightCoordsSet2[i - 5][4], arthur.heatColor, this.cellLights[i - 3] * 0.7);
            }
          }
        }
        Draw.color();
      }
      
      Draw.rect(arthur.tCross, x, y, this.rotation - 90);
      
      if(arthur.heatRegion != Core.atlas.find("error") && this.heat > 0.001){
        Draw.color(arthur.heatColor, this.heat);
        Draw.blend(Blending.additive);
        Draw.rect(arthur.heatRegion, x, y, this.rotation - 90);
        Draw.blend();
        Draw.color();
      }
    },
    updateTile(){
      this.super$updateTile();
      var totalTime = arthur.chargeTime + arthur.closeTime;
      
      if(this.activeAnim && this.chargeTimer < totalTime){
        this.chargeTimer += Time.delta;
      }else if(this.activeAnim && this.chargeTimer >= totalTime){
        this.chargeTimer = 0;
        this.activeAnim = false;
      }
      
      var openAmount = Mathf.curve(this.chargeTimer / totalTime, 0, arthur.pullTime / totalTime);
      var closeAmount = Mathf.curve(this.chargeTimer / totalTime, arthur.chargeTime / totalTime, 1);
      this.openX = arthur.xOpen * Interp.pow2Out.apply(openAmount) - arthur.xOpen * Interp.pow2In.apply(closeAmount);
      this.openY = arthur.yOpen * Interp.pow5In.apply(openAmount) - arthur.yOpen * Interp.pow5Out.apply(closeAmount);
      
      if(this.activeAnim){
        var L1 = Mathf.curve(this.chargeTimer / totalTime, arthur.pullTime / totalTime, (arthur.pullTime + arthur.baseLightSpacing) / totalTime) - closeAmount;
        var L2 = Mathf.curve(this.chargeTimer / totalTime, (arthur.pullTime + arthur.baseLightSpacing) / totalTime, (arthur.pullTime + 2 * arthur.baseLightSpacing) / totalTime) - closeAmount;
        var L3 = Mathf.curve(this.chargeTimer / totalTime, (arthur.chargeTime - arthur.holyLightDelay - 4 * arthur.holyLightSpacing) / totalTime, (arthur.chargeTime - arthur.holyLightDelay - 3 * arthur.holyLightSpacing) / totalTime) - closeAmount;
        var L4 = Mathf.curve(this.chargeTimer / totalTime, (arthur.chargeTime - arthur.holyLightDelay - 3 * arthur.holyLightSpacing) / totalTime, (arthur.chargeTime - arthur.holyLightDelay - 2 * arthur.holyLightSpacing) / totalTime) - closeAmount;
        var L5 = Mathf.curve(this.chargeTimer / totalTime, (arthur.chargeTime - arthur.holyLightDelay - 2 * arthur.holyLightSpacing) / totalTime, (arthur.chargeTime - arthur.holyLightDelay - arthur.holyLightSpacing) / totalTime) - closeAmount;
        this.cellLights = [L1, L2, L3, L4, L5];
      }else{
        this.cellLights = [0, 0, 0, 0, 0];
      }
    },
    updateCooling(){
      if(!this.activeAnim){
        const liquid = this.liquids.current();
        var maxUsed = arthur.consumes.get(ConsumeType.liquid).amount;

        var used = Math.min(Math.min(this.liquids.get(liquid), maxUsed * Time.delta), Math.max(0, ((arthur.reloadTime - this.reload) / arthur.coolantMultiplier) / liquid.heatCapacity)) * this.baseReloadSpeed();
        this.reload += used * liquid.heatCapacity * arthur.coolantMultiplier;
        this.liquids.remove(liquid, used);

        if(Mathf.chance(0.06 * used)){
          arthur.coolEffect.at(this.x + Mathf.range(arthur.size * Vars.tilesize / 2), this.y + Mathf.range(arthur.size * Vars.tilesize / 2));
        }
      }
    },
    updateShooting(){
      if(this.reload > arthur.reloadTime && !this.activeAnim){
        var type = this.peekAmmo();
        
        this.shoot(type);
        
        this.reload = 0;
      }else if(!this.activeAnim){
        this.reload += Time.delta * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed();
      }
    },
    shoot(type){
      this.useAmmo();

      this.shootLoc.trns(this.rotation - 90, 0, arthur.shootLength - this.recoil);
      arthur.chargeBeginEffect.at(this.x + this.shootLoc.x, this.y + this.shootLoc.y, this.rotation);
      
      for(var i = 0; i < arthur.chargeEffects; i++){
        Time.run(Mathf.random(arthur.chargeMaxDelay), run(() => {
          arthur.chargeEffect.at(this.x + this.shootLoc.x, this.y + this.shootLoc.y, this.rotation);
        }));
      }
      
      this.charging = true;
      this.activeAnim = true;

      Time.run(arthur.chargeTime, run(() => {
        if(!this.isValid()) return;
        this.recoil = arthur.recoilAmount;
        this.heat = 1;
        type.create(this, this.team, this.x + this.shootLoc.x, this.y + this.shootLoc.y, this.rotation, 1, 1);
        this.charging = false;
      }));
    },
    shouldTurn(){
      return !this.charging && !this.activeAnim;
    }
  });
  ent.shootLoc = new Vec2();
  ent.baseLoc = new Vec2();
	ent.setEff();
  return ent;
};
arthur.heatColor = Color.valueOf("F3E979");
arthur.chargeTime = 180;
arthur.pullTime = 60;
arthur.closeTime = 90;
arthur.baseLightSpacing = 30;
arthur.holyLightDelay = 20;
arthur.holyLightSpacing = 10;
arthur.xOpen = 2;
arthur.yOpen = -3;
arthur.size = 6;
arthur.recoilAmount = 8;
arthur.restitution = 0.005;
arthur.shootType = sword;