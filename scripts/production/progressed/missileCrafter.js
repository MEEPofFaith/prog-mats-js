const multiLib = require("multi-lib/library");

const shellPress = multiLib.MultiCrafter(GenericCrafter, GenericCrafter.GenericCrafterBuild, "missile-crafter", [
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
  {//1 (Missile)
    input: {
      items: ["prog-mats-missile-shell/1", "thorium/5", "blast-compound/5"],
      power: 3
    },
    output:{
      items: ["prog-mats-basic-missile/1"]
    },
    craftTime: 60
  },
  {//2 (Nuke)
    input: {
      items: ["prog-mats-missile-shell/1", "silicon/5", "copper/10", "lead/10"],
      power: 5
    },
    output:{
      items: ["prog-mats-emp-missile/1"]
    },
    craftTime: 90
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

shellPress.itemCapacity = 30;
shellPress.liquidCapacity = 20;
shellPress.size = 4;
shellPress.health = 100;
shellPress.craftEffect = Fx.pulverizeMedium;
shellPress.updateEffect = Fx.none;
/*true: dump items and liquids of output according to button
false: dump items and liquids of output unconditionally*/
shellPress.dumpToggle = true;
shellPress.category = Category.crafting;
shellPress.buildVisibility = BuildVisibility.sandboxOnly;
shellPress.requirements = ItemStack.with(Items.copper,75);