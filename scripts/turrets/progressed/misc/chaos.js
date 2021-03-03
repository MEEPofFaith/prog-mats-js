//4 colors from outside in. Normal meltdown laser has trasnparrency 55 -> aa -> ff (no transparrency) -> ff(no transparrency)
var colors = [Color.valueOf("D99F6B55"), Color.valueOf("E8D174aa"), Color.valueOf("F3E979"), Color.valueOf("ffffff")];
var length = 900;
var width = 16;
var oscScl = 0.5;
var oscMag = 1;
var lightStroke = 60;

//Stuff you probably shouldn't edit unless you know what you're doing.
//Width of each section of the beam from thickest to thinnest
var tscales = [1, 0.7, 0.5, 0.2];
//Overall width of each color
var strokes = [2, 1.5, 1, 0.3];
//Determines how far back each section in the start should be pulled
var pullscales = [1, 1.12, 1.15, 1.17];
//Determines how far each section of the end should extend past the main thickest section
var lenscales = [1, 1.12, 1.15, 1.17];

const tmpColor = new Color();
const vec = new Vec2();
const vec2 = new Vec2();

var lightScale = 1;

var chargeLenScale = 0.75;
var chargeBeams = 20 / 2;
var widthScl = 0.75;
var rotateAmount = 360;
var chargeTime = 150;
var fadeTime = 30;

const chaosChargeBegin = new Effect(chargeTime, 1600 * chargeLenScale, e => {
  var lightOpacity = 0.4 + (e.finpow() * 0.4);
  
  Draw.color(colors[0], colors[2], 0.5 + e.finpow() * 0.5);
  Lines.stroke(Mathf.lerp(0, 28, e.finpow()));
  Lines.circle(e.x, e.y, 384 * (1 - e.finpow()));
  
  for(var i = 0; i < 36; i++){
    vec.trns(i * 10, 384 * (1 - e.finpow()));
    vec2.trns(i * 10 + 10, 384 * (1 - e.finpow()));
    Drawf.light(e.data[0], e.x + vec.x, e.y + vec.y, e.x + vec2.x, e.y + vec2.y, 14 / 2 + lightStroke * lightScale * e.finpow(), Draw.getColor(), lightOpacity + (0.2 * e.finpow()));
  }
  
  var fade = 1 - Mathf.curve(e.time, e.lifetime - fadeTime, e.lifetime);
  var grow = Mathf.curve(e.time, 0, e.lifetime - fadeTime);
  var baseLen = (length + (Mathf.absin(Time.time / ((i + 1) * 2) + Mathf.randomSeed(e.id), 0.8, 1.5) * (length / 1.5))) * chargeLenScale * fade;
  
  for(var i = 0; i < 4; i++){
    Draw.color(tmpColor.set(colors[i]).mul(1.0 + Mathf.absin(Time.time / 3 + Mathf.randomSeed(e.id), 1.0, 0.3) / 3));
    for(var j = 0; j < 2; j++){
      var dir = Mathf.signs[j];
      for(var k = 0; k < chargeBeams; k++){
        var side = k * (360 / chargeBeams);
        for(var l = 0; l < 4; l++){
          Lines.stroke((width * widthScl + Mathf.absin(Time.time, oscScl, oscMag)) * grow * strokes[i] * tscales[l]);
          Lines.lineAngle(e.x, e.y, (e.rotation + rotateAmount * e.finpow() + side) * dir, baseLen * lenscales[l], false);
        }
        
        vec.trns((e.rotation + 360 * e.finpow() + side) * dir, baseLen * 1.1);
          
        Drawf.light(e.data[0], e.x, e.y, e.x + vec.x, e.y + vec.y, ((width * widthScl + Mathf.absin(Time.time, oscScl, oscMag)) * grow * strokes[i] * tscales[j]) / 2 + lightStroke * lightScale * e.finpow(), colors[2], lightOpacity);
      }
    }
    Draw.reset();
  }
});

const duration = 114;

/*const chaosBeam = extend(ContinuousLaserBulletType, {
  update(b){
    this.super$update(b);
    
    Effect.shake(this.shake, 120, b);
  }
});*/

const chaosBeam = extend(LaserBulletType, {
  hitTile(b, build, initialHealth, direct){
    this.super$hitTile(b, build, initialHealth, direct);
    
    if(build.team != b.team && direct){
      build.kill();
    }
  },
  hitEntity(b, other, initialHealth){
    this.super$hitEntity(b, other, initialHealth);
    
    if(other.team != b.team){
      other.kill();
    }
  },
  colors: [Color.valueOf("F3E97966"), Color.valueOf("F3E979"), Color.white],
  length: length,
  width: 75,
  lightStroke: lightStroke,
  lightColor: colors[2],
  damage: Number.MAX_VALUE,
  lifetime: duration + 16,

  lightningSpacing: 26.25,
  lightningLength: 10,
  lightningDelay: 0.825,
  lightningLengthRand: 5,
  lightningDamage: Number.MAX_VALUE,
  lightningAngleRand: 45,
  largeHit: true,
  lightningColor: colors[2],

  sideAngle: 25,
  sideWidth: width / 6,
  sideLength: length / 1.5
});

const chaosArray = extend(PowerTurret, "chaos-array", {
  load(){
    this.teamRegion = Core.atlas.find("error");
    this.baseRegion = Core.atlas.find("prog-mats-block-8");
    this.region = Core.atlas.find(this.name);
    this.heatRegion = Core.atlas.find(this.name + "-heat");
  },
  setStats(){
    this.super$setStats();
    
    this.stats.remove(Stat.damage);
    const ohno = new StatValue({
      display(table){
        let size = 8 * 2.5;
        table.image(Core.atlas.find("error")).size(size * 3, size).left();
        table.add("What the fork did you just forking say about me, you little biscuit? I'll have you know I graduated top of my class in the Navy Seals, and I've been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and I'm the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the fork out with precision the likes of which has never been seen before on this Earth, mark my forking words. You think you can get away with saying that silt to me over the Internet? Think again, forker. As we speak I am contacting my secret network of spies across the USA and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic little thing you call your life. You're forking dead, kid. I can be anywhere, anytime, and I can kill you in over seven hundred ways, and that's just with my bare hands. Not only am I extensively trained in unarmed combat, but I have access to the entire arsenal of the United States Marine Corps and I will use it to its full extent to wipe your miserable ass off the face of the continent, you little silt. If only you could have known what unholy retribution your little \"clever\" comment was about to bring down upon you, maybe you would have held your forking tongue. But you couldn't, you didn't, and now you're paying the price, you goddamn idiot. I will silt fury all over you and you will drown in it. You're forking dead, kiddo.").left().padLeft(4);
      }
    });
    this.stats.add(Stat.damage, ohno);
    
    this.stats.remove(Stat.booster);
    this.stats.add(Stat.input, new BoosterListValue(chaosArray.reloadTime, chaosArray.consumes.get(ConsumeType.liquid).amount, chaosArray.coolantMultiplier, false, l => chaosArray.consumes.liquidfilters.get(l.id)));
  },
  powerUse: 3000,
  range: 560,
  recoilAmount: 8,
  rotateSpeed: 0.3,
  shootCone: 35,
  cooldown: 0.0015,
  restitution: 0.008,
  shootType: chaosBeam,
  reloadTime: 450,
  chargeTime: chargeTime,
  chargeSound: loadSound("chaosCharge"),
  shootSound: loadSound("chaosBlast"),
  chargeBeginEffect: chaosChargeBegin,
  size: 8,
  shootDuration: duration,
  shots: 100,
  inaccuracy: 45,
  shootY: -16,
  shootShake: 150,
  coolantMultiplier: 1
});

//16000 of every vanilla item + 16000 techtanite
let stack = [];
Vars.content.items().each(e => {
  if(e.minfo.mod === null) stack.push(new ItemStack(e, 1));
});
stack.push(new ItemStack(Vars.content.getByName(ContentType.item, "prog-mats-techtanite"), 1));
chaosArray.requirements = new ItemStack.mult(stack, 16000);
chaosArray.category = Category.turret;
chaosArray.buildVisibility = BuildVisibility.shown;

const liquidPerSec = 150 / 60;
chaosArray.consumes.add(new ConsumeLiquidFilter(l => l.temperature <= 0.5 && l.flammability < 0.1, liquidPerSec)).update(false);

const tmpCol = new Color();
const pow6In = new Interp.PowIn(6);

//More stolen code :D
chaosArray.heatDrawer = tile => {
	if(tile.heat <= 0.00001) return;
	var r = Interp.pow2Out.apply(tile.heat);
	var g = Interp.pow3In.apply(tile.heat) + ((1 - Interp.pow3In.apply(tile.heat)) * 0.12);
	var b = pow6In.apply(tile.heat);
	var a = Interp.pow2Out.apply(tile.heat);
	tmpCol.set(r, g, b, a);
	Draw.color(tmpCol);

	Draw.blend(Blending.additive);
	Draw.rect(chaosArray.heatRegion, tile.x + chaosArray.tr2.x, tile.y + chaosArray.tr2.y, tile.rotation - 90);
	Draw.blend();
	Draw.color();
};

chaosArray.buildType = ent => {
	ent = extend(PowerTurret.PowerTurretBuild, chaosArray, {
    setEff(){
      this._bulletLife = 0;
    },
    updateCooling(){
      //do nothing, cooling is irrelevant here
    },
    updateTile(){
      this.super$updateTile();
      this._shootLoc.trns(this.rotation, chaosArray.size * 4 - this.recoil + chaosArray.shootY);
      
      if(this._bulletLife > 0){
        this.heat = 1;
        //this.recoil = chaosArray.recoilAmount;
        this._bulletLife -= Time.delta;
        
        if(this._bulletLife <= 0){
          this.charging = false;
        }
      }else if(this.reload >= 0 && !this.charging && this.cons.valid()){
        const liquid = this.liquids.current();
        var maxUsed = chaosArray.consumes.get(ConsumeType.liquid).amount;

        var used = (this.cheating() ? maxUsed * Time.delta : Math.min(this.liquids.get(liquid), maxUsed * Time.delta)) * liquid.heatCapacity * chaosArray.coolantMultiplier;
        this.reload -= used;
        this.liquids.remove(liquid, used);

        if(Mathf.chance(0.06 * used)){
          chaosArray.coolEffect.at(this.x + Mathf.range(chaosArray.size * Vars.tilesize / 2), this.y + Mathf.range(chaosArray.size * Vars.tilesize / 2));
        }
      }
    },
    updateShooting(){
      if(this._bulletLife > 0){
        return;
      }
      
      if(this.reload < 0 && !this.charging){
        var type = this.peekAmmo();
        
        this.shoot(type);
        
        this.reload = chaosArray.reloadTime;
      }
    },
    shoot(ammo){
      this.useAmmo();
      this.charging = true;
      
      this._shootLoc.trns(this.rotation, chaosArray.size * 4 - this.recoil + chaosArray.shootY);
      chaosArray.chargeBeginEffect.at(this.x + this._shootLoc.x, this.y + this._shootLoc.y, Mathf.random(360), [this.team]);
      chaosArray.chargeSound.at(this.x + this._shootLoc.x, this.y + this._shootLoc.y, 1);

      Time.run(chaosArray.chargeTime, run(() => {
        if(!this.isValid()) return;
        this.recoil = chaosArray.recoilAmount;
        this.heat = 1;
        this._bulletLife = chaosArray.shootDuration;
        for(var i = 0; i < chaosArray.shots; i++){
          this._shootLoc.trns(this.rotation, chaosArray.size * 4 - this.recoil + chaosArray.shootY);
          this.bullet(ammo, this.rotation + Mathf.range(chaosArray.inaccuracy));
          chaosArray.shootSound.at(this.x + this._shootLoc.x, this.y + this._shootLoc.y, 1);
          Effect.shake(chaosArray.shootShake, chaosArray.shootShake, this);
        };
      }));
    },
    bullet(type, angle){
      this._shootLoc.trns(this.rotation, chaosArray.size * 4 - this.recoil);
      
      type.create(this, this.team, this.x + this._shootLoc.x, this.y + this._shootLoc.y, angle);
    },
  });
  ent._shootLoc = new Vec2();
  return ent;
};