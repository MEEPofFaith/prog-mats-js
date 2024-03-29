const multiLib = require("libs/blockTypes/younggamMultiLib");

const shellPress = multiLib.MultiCrafter(GenericCrafter, GenericCrafter.GenericCrafterBuild, "shell-press", [
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
      items: ["titanium/5", "copper/5", "lead/5"],
      power: 3
    },
    output:{
      items: ["prog-mats-missile-shell/2"]
    },
    craftTime: 60
  },
  {//2 (Nuke)
    input: {
      items: ["titanium/10", "surge-alloy/10", "prog-mats-techtanite/10"],
      power: 5
    },
    output:{
      items: ["prog-mats-nuke-shell/1"]
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
shellPress.size = 3;
shellPress.health = 100;
shellPress.craftEffect = Fx.pulverizeMedium;
shellPress.updateEffect = Fx.none;
/*true: dump items and liquids of output according to button
false: dump items and liquids of output unconditionally*/
shellPress.dumpToggle = true;
shellPress.setupRequirements(Category.crafting, ItemStack.with(
  Items.copper, 75,
  Items.lead, 100,
  Items.titanium, 100,
  Items.silicon, 80
));