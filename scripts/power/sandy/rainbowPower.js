const node = require("libs/blockTypes/strobeNodeType");

const gay = node.strobeNode(PowerNode, PowerNode.PowerNodeBuild, 1.5, 0.005, "rainbow-power-node", {
  maxNodes: 65535,
  laserRange: 200,
  requirements: ItemStack.with(),
  buildVisibility: BuildVisibility.sandboxOnly,
  category: Category.power
}, {});

const infiniteGay = node.strobeNode(PowerSource, PowerSource.PowerSourceBuild, 1.5, 0.005, "rainbow-power-source", {
  powerProduction: 2000000000/60,
  maxNodes: 65535,
  laserRange: 200,
  requirements: ItemStack.with(),
  buildVisibility: BuildVisibility.sandboxOnly,
  category: Category.power
}, {});