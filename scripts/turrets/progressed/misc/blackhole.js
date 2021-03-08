const horizonColor = Color.valueOf("bd5200");
const horizonRad = 5;

const chargeBegin = new Effect(50, e => {
  Draw.color(Color.valueOf("000000"));
  Fill.circle(e.x, e.y, e.fin() * (e.data / 2));
  Draw.color();
  
  Drawf.light(e.x , e.y, e.fin() * (e.data / 2 + horizonRad), horizonColor, 0.7);
  Draw.reset();
});

const charge = new Effect(38, e => {
  Draw.color(Color.valueOf("000000"));
  
  Angles.randLenVectors(e.id, 2, 1 + 40 * e.fout(), e.rotation, 180, (x, y) => {
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), e.fslope() * 3 + 1);
  });
});

const bh = require("libs/bulletTypes/blackHoleBulletType");
const ballOfSucc = bh.blackHole(6, horizonColor, horizonRad, 25, {});

const kugelblitz = extend(PowerTurret, "blackhole", {
  setStats(){
    this.super$setStats();
    
    //damages every 5 ticks
    this.stats.remove(Stat.damage);
    this.stats.add(Stat.damage, this.shootType.damage * 30, StatUnit.perSecond);
  },
  load(){
    this.super$load();
    
    this.spaceRegion = Core.atlas.find(this.name + "-space");
  },
  size: 4,
  range: 128,
  health: 800,
  reloadTime: 520,
  shootEffect: Fx.none,
  smokeEffect: Fx.none,
  rotateSpeed: 1.25,
  shootSound: Sounds.release,
  shootType: ballOfSucc,
  chargeEffect: charge,
  chargeBeginEffect: chargeBegin,
  chargeTime: 50,
  chargeMaxDelay: 30,
  chargeEffects: 16,
  recoilAmount: 2,
  heatColor: Color.valueOf("000000"),
  restitution: 0.015,
  cooldown: 0.005,
  shootLength: 0
});

kugelblitz.setupRequirements(Category.turret, ItemStack.with(
  Items.titanium, 100,
  Items.thorium, 150,
  Items.plastanium, 250,
  Items.surgeAlloy, 250,
  Items.silicon, 800,
  Items.phaseFabric, 500,
  Vars.content.getByName(ContentType.item, "prog-mats-techtanite"), 500
));

const tmpCol = new Color();
const pow6In = new Interp.PowIn(6);

//More stolen code :D
kugelblitz.heatDrawer = tile => {
	if(tile.heat <= 0.00001) return;
	var r = pow6In.apply(tile.heat);
	var g = (Interp.pow3In.apply(tile.heat) + ((1 - Interp.pow3In.apply(tile.heat)) * 0.12)) / 2;
	var b = Interp.pow2Out.apply(tile.heat);
	var a = Interp.pow2Out.apply(tile.heat);
	tmpCol.set(r, g, b, a);
	Draw.color(tmpCol);

	Draw.blend(Blending.additive);
	Draw.rect(kugelblitz.heatRegion, tile.x + kugelblitz.tr2.x, tile.y + kugelblitz.tr2.y, tile.rotation - 90);
	Draw.blend();
	Draw.color();
};

const spaceColor = new Color.valueOf("140017");

kugelblitz.buildType = ent => {
  ent = extend(PowerTurret.PowerTurretBuild, kugelblitz, {
    setEff(){
      this._spaceAlpha = 0;
    },
    draw(){
      this.super$draw();
      
      Tmp.v1.trns(this.rotation - 90, 0, -this.recoil);
      Tmp.v1.add(this.x, this.y);
      
      Draw.color(spaceColor.cpy().shiftHue(Time.time / 2).shiftValue(Mathf.absin(Time.time, 4, 0.15)));
      Draw.alpha(this._spaceAlpha);
      Draw.rect(kugelblitz.spaceRegion, Tmp.v1.x, Tmp.v1.y, this.rotation - 90);
      Draw.reset();
    },
    updateTile(){
      this.super$updateTile();
      
      this._spaceAlpha = Mathf.lerpDelta(this._spaceAlpha, Mathf.num(this.cons.valid()), 0.1);
    }
  });
  ent.shootLoc = new Vec2();
  ent.setEff();
  
  return ent;
};