//Don't ask where I stol-copied this code from.
global.pm = {};
const loadFile = (prev, array) => {
  var results = [];
  var names = [];

  var p = prev;

  for(var i = 0; i < array.length; i++){
    var file = array[i];

    if(typeof(file) === "object"){
      p.push(file.name);
      var temp = loadFile(p, file.childs);

      results = results.concat(temp.res);
      names = names.concat(temp.fileNames);

      p.pop();
    }else{
      var temp = p.join("/") + "/" + file;

      results.push(temp);
      names.push(file);
    };
  };

  return {
    res: results,
    fileNames: names
  };
};

//Basically just folders and the stuff inside those folders.
const script = [
  {
    name: "libs",
    childs: ["funcLib"]
  },
  {
    name: "turrets",
    childs: [
      {
        name: "eruptor",
        childs: ["eruptor", "magmator", "hell"]
      },
      {
        name: "minigun",
        childs: ["minigun", "miinigun", "mivnigun"]
      },
      {
        name: "tesla",
        childs: ["tesla-i", "tesla-ii", "tesla-iii"]
      },
      {
        name: "misc",
        childs: ["blackhole", "chaos"]
      }
    ]
  },
  {
    name: "production",
    childs: ["hadron"]
  },
  {
    name: "liquids",
    childs: ["magma"]
  }
];

const loadedScript = loadFile([], script);
for(var i = 0; i < loadedScript.res.length; i++){
  var res = loadedScript.res[i];
  var name = loadedScript.fileNames[i];
  try{
    var content = require("prog-mats/" + res);
    if(typeof(content) !== "undefined"){
      global.pm[name] = content;
    };
  }catch(e){
    print(e);
	};
};

if(!Vars.headless){
  Core.app.post(() => {
    const meta = Vars.mods.locateMod("prog-mats").meta;
    meta.displayName = "[#FCC21B]Progressed Materials";
    meta.author = "[#FCC21B]MEEP of Faith";
  });
}