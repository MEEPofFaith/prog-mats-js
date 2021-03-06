const multiLib = require("libs/blockTypes/younggamMultiLib");

const cunit = name => Vars.content.getByName(ContentType.unit, "prog-mats-" + name);
const sprite = sentryUnit => cunit(sentryUnit + "-sentry").icon(Cicon.full);
const spriteNames = ["basic", "strike", "dash"]

const sFac = multiLib.MultiCrafter(GenericCrafter, GenericCrafter.GenericCrafterBuild, "sentry-builder", [
  /*default form for each recipes. You can change values.
  {
    input: {
      items: [],     Modded Item:  "mod-name-item-name/amount", Vanilla Item: "item-name/amount"
      liquids: [],   Modded Liquid:  "mod-name-liquid-name/amount",  Vanilla liquid: "liquid-name/amount"
      power:0,
    },
    output: {
      items: [],
      liquids: [],
      power: 0,
    },
    craftTime: 80,
  },*/
  {//1 (Basic Sentry)
    input: {
      items: ["copper/30", "lead/35", "titanium/15", "silicon/25"],
      power: 4
    },
    output:{
      items: ["prog-mats-basic-sentry-box/3"]
    },
    craftTime: 90
  },
  {//2 (Strike Sentry)
    input: {
      items: ["copper/40", "lead/40", "titanium/20", "silicon/30", "blast-compound/10"],
      power: 4.5
    },
    output:{
      items: ["prog-mats-strike-sentry-box/3"]
    },
    craftTime: 120
  },
  {//2 (Dash Sentry)
    input: {
      items: ["copper/30", "lead/30", "titanium/30", "graphite/15", "silicon/35"],
      power: 4.5
    },
    output:{
      items: ["prog-mats-dash-sentry-box/3"]
    },
    craftTime: 105
  }
], {
  load(){
    this.super$load();
    this.colorRegion = Core.atlas.find(this.name + "-color");
    this.sentrySprites = [];
    for(let i = 0; i < spriteNames.length; i++){
      this.sentrySprites[i] = sprite(spriteNames[i]);
    }
  }
},
/*this is Object constructor. This way is much better than literal way{a:123}
you can replace this with {} if you don't want to modify entity*/
function Extra(){
  /*you can use customUpdate = function(){}. this function excuted before update()
  also this.draw = function(){}
  you can customize entity here.
  ex)
  this._myProp=0;
  this.getMyProp=function(){
      return this._myProp;
  };
  this.setMyProp=function(a){
      this._myProp=a;
  };*/

  this.draw = function(){
    this.super$draw();
    let current = this._toggle;
    if(current >= 0){
      let recs = this.block.getRecipes();
      let sentryItem = recs[current].output.items[0];
      Draw.color(sentryItem.item.color);
      Draw.rect(sFac.colorRegion, this.x, this.y);
      Draw.color();

      Draw.draw(Draw.z(), () => {
        Drawf.construct(this.x, this.y, sFac.sentrySprites[current], this.team.color, 0, this.progress, this.warmup, this.progress * recs[current].craftTime);
      });
    }
  }
});
/*
YOU MUST NOT MODIFY VALUE OF THESE
configurable
outputsPower
hasItems
hasLiquids
hasPower
*/

sFac.itemCapacity = 100;
sFac.liquidCapacity = 40;
sFac.size = 4;
sFac.health = 100;
sFac.craftEffect = Fx.pulverizeMedium;
sFac.updateEffect = Fx.none;
/*true: dump items and liquids of output according to button
false: dump items and liquids of output unconditionally*/
sFac.dumpToggle = true;
sFac.category = Category.crafting;
sFac.buildVisibility = BuildVisibility.shown;
sFac.requirements = ItemStack.with(Items.copper, 90, Items.silicon, 150, Items.titanium, 50);
sFac.craftEffect = Fx.none;