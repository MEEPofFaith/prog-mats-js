const node = require("libs/blockTypes/strobeNodeType");

const speed = 1.5;
const lerpSpeed = 0.005;

const gay = node.strobeNode(PowerNode, PowerNode.PowerNodeBuild, speed, lerpSpeed, "rainbow-power-node", {
  health: 10000,
  maxNodes: 65535,
  laserRange: 200,
  alwaysUnlocked: true
}, {});

const infiniteGay = node.strobeNode(PowerSource, PowerSource.PowerSourceBuild, speed, lerpSpeed, "rainbow-power-source", {
  health: 10000,
  powerProduction: 2000000000/60,
  maxNodes: 65535,
  laserRange: 200,
  alwaysUnlocked: true
}, {});

const uberInfiniteGay = node.strobeNode(PowerSource, PowerSource.PowerSourceBuild, speed, lerpSpeed, "rainbow-power-boost", {
  health: 10000,
  powerProduction: 2000000000/60,
  size: 2,
  maxNodes: 65535,
  laserRange: 200,
  alwaysUnlocked: true,
  speedBoost: 100,
  setStats(){
    this.stats.add(Stat.speedIncrease, (100 * this.speedBoost), StatUnit.percent);
    this.super$setStats();
  },
  setBars(){
    this.super$setBars();
    this.bars.add("boost", () => new Bar(() => Core.bundle.get("stat.prog-mats.gay") + " " + (this.speedBoost * 100) + "%", () => this.laserColor1.cpy().lerp(this.laserColor3, Mathf.absin(Time.time * lerpSpeed, 1, 1)).shiftHue(Time.time * speed), () => 100));
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