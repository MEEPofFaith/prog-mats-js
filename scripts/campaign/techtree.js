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
const cblock = name => Vars.content.getByName(ContentType.block, "prog-mats-" + name);
const citem = name => Vars.content.getByName(ContentType.item, "prog-mats-" + name);

/** Items */
node(Items.surgeAlloy, citem("techtanite"), null, null);
// node(Items.thorium, citem("missile-shell"), null, Seq.with(new Objectives.Research(cblock("missile-ii"))));

/** Production */
node(Blocks.plastaniumCompressor, cblock("mindron-collider"), null, Seq.with(new Objectives.SectorComplete(SectorPresets.impact0078)));
// node(cblock("mindron-collider"), cblock("shell-press"), null, Seq.with(new Objectives.Research(cblock("missile-i"))));
// node(cblock("shell-press"), cblock("missile-crafter"), null, Seq.with(new Objectives.Research(cblock("missile-i"))));
// node(cblock("missile-crafter"), cblock("nuke-crafter"), null, Seq.with(new Objectives.Research(cblock("missile-ii"))));

/** Turret */

// Eruptor
node(Blocks.fuse, cblock("eruptor-i"), null, null);
node(cblock("eruptor-i"), cblock("eruptor-ii"), null, Seq.with(new Objectives.SectorComplete(SectorPresets.impact0078))); // Why am I making everything canonically ripped out of the wreackage.
node(cblock("eruptor-ii"), cblock("eruptor-iii"), null, Seq.with(new Objectives.SectorComplete(SectorPresets.nuclearComplex)));

// Minigun
node(Blocks.salvo, cblock("minigun-i"), null, null);
node(cblock("minigun-i"), cblock("minigun-ii"), null, Seq.with(new Objectives.SectorComplete(SectorPresets.overgrowth)));
node(cblock("minigun-iii"), cblock("minigun-iii"), null, Seq.with(new Objectives.SectorComplete(SectorPresets.impact0078)));

// Misc
node(Blocks.fuse, cblock("blackhole"), null, Seq.with(new Objectives.SectorComplete(SectorPresets.impact0078), new Objectives.Research(Blocks.meltdown), new Objectives.Research(Blocks.spectre)));
var sectors = new Seq();
Vars.content.sectors().each(e => {
  if(e.minfo.mod === null) sectors.add(new Objectives.SectorComplete(e));
});
node(Blocks.foreshadow, cblock("chaos-array"), null, sectors);
//node(Blocks.foreshadow, cblock("excalibur"), null, Seq.with(new Objectives.SectorComplete(SectorPresets.nuclearComplex)));

// Missile
//node(Blocks.ripple, cblock("missile-i"), null, Seq.with(new Objectives.Research(Blocks.launchPad), new Objectives.SectorComplete(SectorPresets.impact0078))); // Yes, you canonically ripped this out of the wreakage.
//node(cblock("missile-i"), cblock("missile-ii"), null, Seq.with(new Objectives.Research(Blocks.launchPad), new Objectives.SectorComplete(SectorPresets.nuclearComplex), new Objectives.Research(citem("missile-shell"))));
//node(cblock("missile-ii"), cblock("missile-iii"), null, Seq.with(new Objectives.Research(Blocks.launchPad), new Objectives.Research(Blocks.interplanetaryAccelerator), new Objectives.SectorComplete(SectorPresets.planetaryTerminal))); // Big nuke big pad

//Multi
node(Blocks.hail, cblock("multi-i"), null, Seq.with(new Objectives.Research(Blocks.duo), new Objectives.Research(Blocks.wave)));

//Pixel
node(Blocks.lancer, cblock("pixel-i"), null, null);

//Tesla
node(Blocks.arc, cblock("tesla-i"), null, null);
node(cblock("tesla-i"), cblock("tesla-ii"), null, Seq.with(new Objectives.Research(Blocks.differentialGenerator)));
node(cblock("tesla-ii"), cblock("tesla-iii"), null, Seq.with(new Objectives.Research(Blocks.thoriumReactor)));