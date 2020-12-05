const moltenRock = extendContent(Liquid, "magma", {
  isHidden(){
    return true;
  }
});
moltenRock.localizedName = "Magma";
moltenRock.description = "Actually, it's supposed to be lava...";
moltenRock.details = "How the heck are you reading this?";
moltenRock.flammability = 1000;
moltenRock.temperature = 1000;
moltenRock.heatCapacity = 0;
moltenRock.viscosity = 0.8;
moltenRock.color = Color.valueOf("F58859");
moltenRock.barColor = Color.valueOf("F58859");
moltenRock.lightColor = Color.valueOf("F58859");