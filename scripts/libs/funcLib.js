const collidedBlocks = new IntSet(1023);

module.exports = {
  //mmm yes, code stolen from Project Unity
  //recoded drawer found in UnitType, but without the applyColor function. doesnt draw outlines, only used for certain effects.
	simpleUnitDrawerStatic(unit, drawLegs, x, y, scl, rotation, mounts){
		var type = unit.type;

		if(drawLegs){
			//TODO draw legs
			if(unit instanceof Mechc){

			};
		};
    
    Draw.rect(type.region, x, y, type.region.width * scl / 4, type.region.height * scl / 4, rotation);

		for(var i = 0; i < mounts.length; i++){
			var mount = mounts[i];
			var weapon = mount.weapon;
      
			var weaponRotation = rotation + (weapon.rotate ? mount.rotation : 0);
			var recoil = -((mount.reload) / weapon.reload * weapon.recoil);
			var wx = x + Angles.trnsx(rotation, weapon.x, weapon.y) * scl + Angles.trnsx(weaponRotation, 0, recoil) * scl;
			var wy = y + Angles.trnsy(rotation, weapon.x, weapon.y) * scl + Angles.trnsy(weaponRotation, 0, recoil) * scl;

			Draw.rect(weapon.region, wx, wy,
			weapon.region.width * scl * -Mathf.sign(weapon.flipSprite) / 4,
			weapon.region.height * scl / 4,
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
    return trueDamage + type.splashDamage + (Math.max(type.lightningDamage, 0) * type.lightning * type.lightningLength);
    //return type.damage + type.splashDamage + (Math.max(type.lightningDamage, 0) * type.lightning * type.lightningLength);
  }
};