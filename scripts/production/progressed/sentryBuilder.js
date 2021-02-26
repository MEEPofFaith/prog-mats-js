const multiLib = require("multi-lib/library");

const sentryFactory = multiLib.MultiCrafter(GenericCrafter, GenericCrafter.GenericCrafterBuild, "sentry-builder", [
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
      items: ["copper/30", "lead/35", "titanium/20", "silicon/25"],
      power: 4
    },
    output:{
      items: ["prog-mats-basic-sentry-box/3"]
    },
    craftTime: 90
  },
  {//2 (Strike Sentry)
    input: {
      items: ["copper/40", "lead/40", "titanium/25", "silicon/30", "blast-compound/10"],
      power: 4.5
    },
    output:{
      items: ["prog-mats-strike-sentry-box/3"]
    },
    craftTime: 120
  }
], {
  /*you can customize block here. ex) load()*/
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
});
/*
YOU MUST NOT MODIFY VALUE OF THESE
configurable
outputsPower
hasItems
hasLiquids
hasPower
*/

sentryFactory.itemCapacity = 50;
sentryFactory.liquidCapacity = 20;
sentryFactory.size = 4;
sentryFactory.health = 100;
sentryFactory.craftEffect = Fx.pulverizeMedium;
sentryFactory.updateEffect = Fx.none;
/*true: dump items and liquids of output according to button
false: dump items and liquids of output unconditionally*/
sentryFactory.dumpToggle = true;
sentryFactory.category = Category.crafting;
sentryFactory.buildVisibility = BuildVisibility.sandboxOnly;
sentryFactory.requirements = ItemStack.with(Items.copper,75);