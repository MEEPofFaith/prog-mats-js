//mmm yes script loader stolen from Project Unity
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
//First load libraries, then items, then stuff that may or may not need those items.
const script = [
  {
    name: "libs",
    childs: ["funcLib"]
  },
  {
    name: "items",
    childs: [
      {
        name: "progressed",
        childs:["techtanite",
          "mShell",
          "missiles",
          "nShell",
          "nukes",
          "sentries"
        ]
      }
    ]
  },
  {
    name: "liquids",
    childs: [
      {
        name: "progressed",
        childs:["magma"] //Should I make magma accesable? Incendiary missiles?
      }
    ]
  },
  {
    name: "units",
    childs: [
      {
        name: "progressed",
        childs: ["sentryBasic", "sentryStrike", "sentryDash"]
      }
    ]
  },
  {
    name: "production",
    childs: [
      {
        name: "progressed",
        childs:["hadron", "shellPress", "missileCrafter", "sentryBuilder"]
      }
    ]
  },
  {
    name: "power",
    childs: [
      {
        name: "sandy",
        childs: ["rainbowPower"]
      }
    ]
  },
  {
    name: "turrets",
    childs:[
      {
        name: "progressed",
        childs:[
          {
            name: "eruptor",
            childs: ["eruptor-i", "eruptor-ii", "eruptor-iii"]
          },
          {
            name: "minigun",
            childs: ["minigun-i", "minigun-ii", "minigun-iii"]
          },
          {
            name: "tesla",
            childs: ["tesla-i", "tesla-ii", "tesla-iii"]
          },
          {
            name: "misc",
            childs: ["blackhole", "chaos", "excalibur", "tinker"]
          },
          {
            name: "missile",
            childs: ["missile-i", "missile-ii", "missile-iii"]
          },
          {
            name: "pixel",
            childs: ["pixel-i"]
          }
        ]
      },
      {
        name: "sandy",
        childs: ["everythingGun"]
      }
    ]
  },
  {
    name: "campaign",
    childs: ["techtree"] //Put this last. Make sure everything is loaded.
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
  Events.on(ClientLoadEvent, () => {
    Core.app.post(() => {
      var mod = Vars.mods.locateMod("prog-mats");
      var change = "mod."+ mod.meta.name + ".";
      mod.meta.displayName = Core.bundle.get(change + "name");
      mod.meta.author = Core.bundle.get(change + "author");
      mod.meta.version = Core.bundle.get(change + "version");
      
      const yes = new BaseDialog("$multi.title");
      yes.cont.add("$multi.text").width(500).wrap().pad(4).get().setAlignment(Align.center, Align.center);
      yes.cont.image(Core.atlas.find("prog-mats-importpls")).pad(4).get();
      yes.row();
      yes.buttons.defaults().size(64, 64).pad(2);
      yes.setFillParent(false);
      for(var i = 0; i < 45; i++){
        yes.buttons.button("[#" + Color.red.cpy().shiftHue(Time.time * 3 + i * 8).toString() + "]" + Core.bundle.get("yes"), () => {
          yes.hide();
          Vars.ui.mods.show();
          Vars.ui.mods.children.get(1).children.get(1).children.get(0).fireClick();
          Core.scene.dialog.children.get(1).children.get(0).children.get(1).fireClick();
          Core.scene.dialog.children.get(2).children.get(0).remove();
          Core.settings.put("lastmod", "younggam/multi-lib");
        });
      }
      
      /*if(Vars.mods.locateMod("multi-lib") == null){
        yes.show();
      }*/
    });
  });
}