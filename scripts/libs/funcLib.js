const collidedBlocks = new IntSet(1023);

module.exports = {
  //mmm yes, code stolen from Project Unity
  trueEachBlock(wx, wy, range, conss){
    collidedBlocks.clear();
    var tx = Vars.world.toTile(wx);
    var ty = Vars.world.toTile(wy);

    var tileRange = Mathf.floorPositive(range / Vars.tilesize + 1);
    var isCons = (conss instanceof Cons);

    for(var x = -tileRange + tx; x <= tileRange + tx; x++){
      yGroup:
      for(var y = -tileRange + ty; y <= tileRange + ty; y++){
        if(!Mathf.within(x * Vars.tilesize, y * Vars.tilesize, wx, wy, range)) continue yGroup;
        var other = Vars.world.build(x, y);
        if(other == null) continue yGroup;
        if(!collidedBlocks.contains(other.pos())){
          if(isCons){
            conss.get(other);
          }else{
            conss(other);
          };
          collidedBlocks.add(other.pos());
        };
      };
    };
  }
};