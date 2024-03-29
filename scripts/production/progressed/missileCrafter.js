const multiLib = require("libs/blockTypes/younggamMultiLib");

const missileAssembly = multiLib.MultiCrafter(GenericCrafter, GenericCrafter.GenericCrafterBuild, "missile-crafter", [
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
  
  //region missiles
  
  {//1 (Basic Missile)
    input: {
      items: ["prog-mats-missile-shell/1", "thorium/3", "blast-compound/6"],
      power: 3
    },
    output:{
      items: ["prog-mats-basic-missile/1"]
    },
    craftTime: 60
  },
  {//2 (Emp Missile)
    input: {
      items: ["prog-mats-missile-shell/1", "lead/12", "titanium/10", "silicon/10"],
      power: 4
    },
    output:{
      items: ["prog-mats-emp-missile/1"]
    },
    craftTime: 75
  },
  {//2 (Quantum Missile) (Missile Exclusive)
    input: {
      items: ["prog-mats-missile-shell/1", "thorium/8", "phase-fabric/15", "silicon/13"],
      liquids: ["water/20"],
      power: 7
    },
    output:{
      items: ["prog-mats-quantum-missile/1"]
    },
    craftTime: 120
  },
  
  //endregion
  //region nukes
  
  {//1 (Basic Nuke)
    input: {
      items: ["prog-mats-nuke-shell/1", "thorium/35", "titanium/25", "blast-compound/25", "prog-mats-techtanite/30"],
      power: 6
    },
    output:{
      items: ["prog-mats-basic-nuke/1"]
    },
    craftTime: 90
  },
  {//2 (Emp Nuke)
    input: {
      items: ["prog-mats-nuke-shell/1", "silicon/30", "surge-alloy/20", "prog-mats-techtanite/40"],
      power: 8
    },
    output:{
      items: ["prog-mats-emp-nuke/1"]
    },
    craftTime: 105
  },
  {//3 (Cluster Nuke) (Nuke Exclusive)
    input: {
      items: ["prog-mats-nuke-shell/1", "prog-mats-basic-missile/5", "copper/30", "plastanium/15", "prog-mats-techtanite/25"],
      power: 6.25
    },
    output:{
      items: ["prog-mats-cluster-nuke/1"]
    },
    craftTime: 120
  },
  {//4 (Drop Pod Nuke) (Nuke Exclusive)
    input: {
      items: ["prog-mats-nuke-shell/1", "prog-mats-basic-sentry-box/3", "prog-mats-strike-sentry-box/3", "prog-mats-dash-sentry-box/3", "pyratite/10", "blast-compound/5"],
      power: 5.5
    },
    output:{
      items: ["prog-mats-sentry-nuke/1"]
    },
    craftTime: 150
  }
], {
  load(){
    this.super$load();
    this.colorRegion = Core.atlas.find(this.name + "-color");
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
      let outputItems = recs[current].output.items;
      Draw.color(outputItems[0].item.color);
      Draw.rect(missileAssembly.colorRegion, this.x, this.y);
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

missileAssembly.itemCapacity = 50;
missileAssembly.liquidCapacity = 50;
missileAssembly.size = 4;
missileAssembly.health = 100;
missileAssembly.craftEffect = Fx.pulverizeMedium;
missileAssembly.updateEffect = Fx.none;
/*true: dump items and liquids of output according to button
false: dump items and liquids of output unconditionally*/
missileAssembly.dumpToggle = true;
missileAssembly.setupRequirements(Category.crafting, ItemStack.with(
  Items.copper, 300,
  Items.lead, 200,
  Items.silicon, 200,
  Items.plastanium, 150,
  Items.thorium, 100,
  Items.surgeAlloy, 110
));