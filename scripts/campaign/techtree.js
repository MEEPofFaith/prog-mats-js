//Casually stals from [Gdeft/substructure]'s techtree.js

/**
 * Node for the research tech tree.
 *
 * @property {UnlockableContent}    parent          - The parent of the current node.
 * @property {UnlockableContent}    contentType     - The unlockable content that the current node contains.
 * @property {ItemStack}            requirements    - The research requirements required to unlock this node, will use the default if set to null.
 * @property {Seq}                  objectives      - A sequence of Objectives required to unlock this node. Can be null.
 */
const node = (parent, contentType, requirements, objectives) => {
  if(parent != null && contentType != null){
    const tnode = new TechTree.TechNode(TechTree.get(parent), contentType, requirements != null ? requirements : contentType.researchRequirements());
    let used = new ObjectSet();
    
    if(objectives != null) tnode.objectives.addAll(objectives);
  }else{
    print(parent + " or " + contentType + " is null.");
  }
};
const unitCost = (stacks) => {
  let out = [];
  for(let i = 0; i < stacks.length; i++){
    out[i] = new ItemStack(stacks[i].item, Vars.ui.roundAmount(Mathf.round(Math.pow(stacks[i].amount, 1.1) * 50)));
  }
  return out;
};
const addStacks = (stacks) => {
  let combine = new Seq();
  for(let i = 0; i < stacks.length; i++){
    for(let j = 0; j < stacks[i].length; j++){
      combine.add(stacks[i][j]);
    }
  }
  let resultItems = new Seq();
  let resultAmounts = new Seq();
  combine.each(s => {
    if(!resultItems.contains(s.item)){
      resultItems.add(s.item);
      resultAmounts.add(s.amount);
    }else{
      let index = resultItems.indexOf(s.item);
      let amount = resultAmounts.get(index);
      resultAmounts.set(index, amount + s.amount);
    }
  });
  let result = [];
  resultItems.each(i => {
    let index = resultItems.indexOf(i);
    result.push(resultItems.get(index), resultAmounts.get(index));
  });
  return ItemStack.with(result);
};
const cblock = name => Vars.content.getByName(ContentType.block, "prog-mats-" + name);
const citem = name => Vars.content.getByName(ContentType.item, "prog-mats-" + name);
const cunit = name => Vars.content.getByName(ContentType.unit, "prog-mats-" + name);

/** Turret */

// Eruptor
node(Blocks.fuse, cblock("eruptor-i"), null, null);
node(cblock("eruptor-i"), cblock("eruptor-ii"), null, Seq.with(new Objectives.SectorComplete(SectorPresets.impact0078))); // Why am I making everything canonically ripped out of the wreackage.
node(cblock("eruptor-ii"), cblock("eruptor-iii"), null, Seq.with(new Objectives.SectorComplete(SectorPresets.nuclearComplex)));

// Minigun
node(Blocks.salvo, cblock("minigun-i"), null, null);
node(cblock("minigun-i"), cblock("minigun-ii"), null, Seq.with(new Objectives.SectorComplete(SectorPresets.overgrowth)));
node(cblock("minigun-ii"), cblock("minigun-iii"), null, Seq.with(new Objectives.SectorComplete(SectorPresets.impact0078)));

// Misc
node(Blocks.fuse, cblock("blackhole"), null, Seq.with(new Objectives.SectorComplete(SectorPresets.impact0078), new Objectives.Research(Blocks.meltdown), new Objectives.Research(Blocks.spectre)));
var sectors = new Seq();
Vars.content.sectors().each(e => {
  if(e.minfo.mod === null) sectors.add(new Objectives.SectorComplete(e));
});
node(Blocks.foreshadow, cblock("chaos-array"), null, sectors);
node(Blocks.foreshadow, cblock("excalibur"), null, Seq.with(new Objectives.SectorComplete(SectorPresets.nuclearComplex)));
let basicCost = unitCost(ItemStack.with(Items.copper, 30, Items.lead, 35, Items.titanium, 15, Items.silicon, 25));
let strikeCost = unitCost(ItemStack.with(Items.copper, 40, Items.lead, 40, Items.titanium, 20, Items.silicon, 30, Items.blastCompound, 10));
let dashCost = unitCost(ItemStack.with(Items.copper, 30, Items.lead, 30, Items.titanium, 30, Items.graphite, 15, Items.silicon, 35));
//node(Blocks.ripple, cblock("tinker"), addStacks([cblock("tinker").researchRequirements(), cblock("sentry-builder").researchRequirements(), basicCost, strikeCost, dashCost]), Seq.with(new Objectives.SectorComplete(SectorPresets.windsweptIslands)));

// Missile
node(Blocks.ripple, cblock("missile-i"), null, Seq.with(new Objectives.Research(Blocks.launchPad), new Objectives.SectorComplete(SectorPresets.impact0078))); // Yes, you canonically ripped this out of the wreakage.
node(cblock("missile-i"), cblock("missile-ii"), addStacks([cblock("missile-ii").researchRequirements(), cblock("shell-press").researchRequirements(), cblock("missile-crafter").researchRequirements()]), Seq.with(new Objectives.Research(Blocks.launchPad), new Objectives.SectorComplete(SectorPresets.nuclearComplex), new Objectives.Research(citem("missile-shell"))));
node(cblock("missile-ii"), cblock("missile-iii"), null, Seq.with(new Objectives.Research(Blocks.launchPad), new Objectives.Research(Blocks.interplanetaryAccelerator), new Objectives.SectorComplete(SectorPresets.planetaryTerminal))); // Big nuke big pad

//Pixel
node(Blocks.lancer, cblock("pixel-i"), null, null);

//Tesla
node(Blocks.arc, cblock("tesla-i"), null, null);
node(cblock("tesla-i"), cblock("tesla-ii"), null, Seq.with(new Objectives.Research(Blocks.differentialGenerator)));
node(cblock("tesla-ii"), cblock("tesla-iii"), null, Seq.with(new Objectives.Research(Blocks.thoriumReactor)));

/** ================================================================================================================================== */

/** Production */

node(Blocks.surgeSmelter, cblock("mindron-collider"), null, Seq.with(new Objectives.SectorComplete(SectorPresets.impact0078)));
node(cblock("tinker"), cblock("sentry-builder"), ItemStack.empty, Seq.with(new Objectives.Research(cblock("tinker"))));
node(cblock("missile-ii"), cblock("shell-press"), ItemStack.empty, Seq.with(new Objectives.Research(cblock("missile-ii"))));
node(cblock("shell-press"), cblock("missile-crafter"), ItemStack.empty, Seq.with(new Objectives.Research(cblock("missile-ii"))));

/** ================================================================================================================================== */

/** Items */
node(Items.surgeAlloy, citem("techtanite"), null, Seq.with(new Objectives.Produce(citem("techtanite"))));
node(cblock("sentry-builder"), citem("basic-sentry-box"), null, Seq.with(new Objectives.Research(cblock("tinker"))));
node(citem("basic-sentry-box"), citem("strike-sentry-box"), null, Seq.with(new Objectives.Research(cblock("tinker"))));
node(citem("basic-sentry-box"), citem("dash-sentry-box"), null, Seq.with(new Objectives.Research(cblock("tinker"))));

node(cblock("shell-press"), citem("missile-shell"), null, Seq.with(new Objectives.Produce(citem("missile-shell"))));
node(citem("missile-shell"), citem("basic-missile"), null, Seq.with(new Objectives.Produce(citem("basic-missile"))));
node(citem("missile-shell"), citem("emp-missile"), null, Seq.with(new Objectives.Produce(citem("emp-missile"))));
node(citem("missile-shell"), citem("quantum-missile"), null, Seq.with(new Objectives.Produce(citem("quantum-missile"))));

node(citem("missile-shell"), citem("nuke-shell"), null, Seq.with(new Objectives.Produce(citem("nuke-shell"))));
node(citem("nuke-shell"), citem("basic-nuke"), null, Seq.with(new Objectives.Produce(citem("basic-nuke"))));
node(citem("nuke-shell"), citem("emp-nuke"), null, Seq.with(new Objectives.Produce(citem("emp-nuke"))));
node(citem("nuke-shell"), citem("cluster-nuke"), null, Seq.with(new Objectives.Produce(citem("cluster-nuke"))));
node(citem("nuke-shell"), citem("sentry-nuke"), null, Seq.with(new Objectives.Produce(citem("sentry-nuke"))));

/** ================================================================================================================================== */

/** Unit */

node(citem("basic-sentry-box"), cunit("basic-sentry"), null, Seq.with(new Objectives.Research(cblock("tinker"))));
node(citem("strike-sentry-box"), cunit("strike-sentry"), null, Seq.with(new Objectives.Research(cblock("tinker"))));
node(citem("dash-sentry-box"), cunit("dash-sentry"), null, Seq.with(new Objectives.Research(cblock("tinker"))));