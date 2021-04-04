const moltenRock = extend(Liquid, "magma", {
  flammability: 1000,
  temperature: 1000,
  heatCapacity: 0,
  viscosity: 0.8,
  color: Color.valueOf("F58859"),
  barColor: Color.valueOf("F58859"),
  lightColor: Color.valueOf("F58859"),
  
  isHidden(){
    return true;
  }
});