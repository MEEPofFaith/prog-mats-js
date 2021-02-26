const node = require("libs/blockTypes/strobeNodeType");

const gay = node.strobeNode(PowerNode, PowerNode.PowerNodeBuild, 1.5, 0.005, "rainbow-power-node", {
  health: 10000,
  maxNodes: 65535,
  laserRange: 200,
  requirements: ItemStack.with(),
  buildVisibility: BuildVisibility.sandboxOnly,
  category: Category.power,
  alwaysUnlocked: true
}, {});

const infiniteGay = node.strobeNode(PowerSource, PowerSource.PowerSourceBuild, 1.5, 0.005, "rainbow-power-source", {
  health: 10000,
  powerProduction: 2000000000/60,
  maxNodes: 65535,
  laserRange: 200,
  requirements: ItemStack.with(),
  buildVisibility: BuildVisibility.sandboxOnly,
  category: Category.power,
  alwaysUnlocked: true
}, {});

const uberInfiniteGay = node.strobeNode(PowerSource, PowerSource.PowerSourceBuild, 1.5, 0.005, "rainbow-power-boost", {
  health: 10000,
  powerProduction: 2000000000/60,
  size: 2,
  maxNodes: 65535,
  laserRange: 200,
  requirements: ItemStack.with(),
  buildVisibility: BuildVisibility.sandboxOnly,
  category: Category.power,
  alwaysUnlocked: true,
  speedBoost: 10,
  setStats(){
    this.stats.add(Stat.speedIncrease, (100 * this.speedBoost), StatUnit.percent);
    this.super$setStats();
  }
}, {
  updateTile(){
    let l = this.power.links;
    for(let i = 0; i < l.size; i++){
      let b = Vars.world.tile(l.items[i]).build;
      if(b != null) b.applyBoost(uberInfiniteGay.speedBoost, 2 * Time.delta);
    }
    this.super$updateTile();
  }
});