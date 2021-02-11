const node = require("libs/blockTypes/strobeNodeType");

const infinity = node.strobeNode(PowerSource, PowerSource.PowerSourceBuild, 3, "rainbow-power", {
  powerProduction: 2000000000,
  maxNodes: 3000,
  laserRange: 200,
  requirements: ItemStack.with(),
  buildVisibility: BuildVisibility.sandboxOnly,
  category: Category.power
}, {});