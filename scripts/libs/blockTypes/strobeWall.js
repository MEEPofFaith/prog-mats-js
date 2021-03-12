//Haha code steal go brrrr
const clone = obj => {
  if(obj === null || typeof(obj) !== 'object') return obj;
  var copy = obj.constructor();
  for(var attr in obj) {
    if(obj.hasOwnProperty(attr)) {
      copy[attr] = obj[attr];
    }
  };
  return copy;
}

module.exports = {
  strobeWall(name, speed, obj, objb){
    if(obj == undefined) obj = {};
    if(objb == undefined) objb = {};
    obj = Object.assign({
      load(){
        this.super$load();
        this.colorRegion = Core.atlas.find(this.name + "-color");
      },
      drawPlace(x, y, rot, val){
        Draw.color(Color.red.cpy().shiftHue(Time.time * speed));
        Draw.rect(strobeWall.colorRegion, x * Vars.tilesize + strobeWall.offset, y * Vars.tilesize + strobeWall.offset);
        Draw.reset();
      }
    }, obj);

    objb = Object.assign({
      draw(){
        let shift = this.id * Mathf.randomSeed(this.id);
        Draw.color(Color.red.cpy().shiftHue(shift + Time.time * speed));
        Draw.alpha(1);
        Draw.rect(strobeWall.colorRegion, this.x, this.y);
        Draw.reset();
      }
    }, objb);

    const strobeWall = extend(Wall, name, obj);

    strobeWall.buildType = ent => {
      ent = extend(Wall.WallBuild, strobeWall, clone(objb));
      return ent;
    }

    strobeWall.setupRequirements(Category.defense, BuildVisibility.sandboxOnly, ItemStack.empty);

    return strobeWall;
  }
}