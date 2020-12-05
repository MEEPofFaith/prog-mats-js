const collidedBlocks = new IntSet(1023);

module.exports = {
  //mmm yes, code stolen from Project Unity
  //recoded drawer found in UnitType, but without the applyColor function. doesnt draw outlines, only used for certain effects.
	simpleUnitDrawer(unit, drawLegs, x, y, scl){
		var type = unit.type;

		if(drawLegs){
			//TODO draw legs
			if(unit instanceof Mechc){

			};
		};

		Draw.rect(type.region, x, y, type.region.width * scl, type.region.height * scl, unit.rotation - 90);

		for(var i = 0; i < unit.mounts.length; i++){
			var mount = unit.mounts[i];
			var weapon = mount.weapon;

			var rotation = unit.rotation - 90;
			var weaponRotation = rotation + (weapon.rotate ? mount.rotation : 0);
			var recoil = -((mount.reload) / weapon.reload * weapon.recoil);
			var wx = x + Angles.trnsx(rotation, weapon.x, weapon.y) + Angles.trnsx(weaponRotation, 0, recoil);
			var wy = y + Angles.trnsy(rotation, weapon.x, weapon.y) + Angles.trnsy(weaponRotation, 0, recoil);

			Draw.rect(weapon.region, wx, wy,
			weapon.region.width * scl * -Mathf.sign(weapon.flipSprite),
			weapon.region.height * scl,
			weaponRotation);
		};
	},
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
  },
  bulletDamage(type){
    var trueDamage = type instanceof ContinuousLaserBulletType ? type.damage * 12 : type.damage;
    //return trueDamage + type.splashDamage + (Math.max(type.lightningDamage, 0) * type.lightning * type.lightningLength);
    return type.damage + type.splashDamage + (Math.max(type.lightningDamage, 0) * type.lightning * type.lightningLength);
  }
};