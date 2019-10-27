module.exports = class TutorialList {
  constructor() {
    this.UI = document.getElementById("tutorialList");
    this.selectorButton = document.getElementById("selectListBtn");
    this.selectorButton.addEventListener("click", e => {
      this.setDir(() => {
        // load();
        alert("The list file was imported sucessfully!");
        location.reload();
      });
    });
  }

  bindEvents = (evName, callback) => {
    this.UI.addEventListener(evName, callback);
  };

  load = async () => {
    var cached_list_dir = Helper.getListDir();
    if (cached_list_dir) {
      await Helper.loadScript(cached_list_dir + "/list_mp4.js");
      await Helper.loadScript(cached_list_dir + "/list_subtitle.js");

      await this.loadOptionTags();
    }
    return new Promise((resolve, eject) => {
      resolve();
    });
  };

  setIndex = index => {
    this.UI.selectedIndex = index;
  };

  getIndex = () => this.UI.selectedIndex;
  length = () => this.UI.options.length;

  selectedValue = () => {
    if (this.UI.options[this.UI.selectedIndex]) {
      return this.UI.options[this.UI.selectedIndex].value;
    } else {
      return 0;
    }
  };

  setDir = function(cb) {
    // const win = require('electron').remote.getCurrentWindow();
    // win.setFullScreen(true);
    // return;
    const app = require("electron").remote.app;
    var basepath = Helper.getListDir() || app.getAppPath();
    const dialog = require("electron").remote.dialog;
    const list_dir = dialog.showOpenDialog(null, {
      properties: ["openDirectory"],
      defaultPath: basepath
    });
    if (list_dir) {
      Helper.setConf("list_dir", list_dir);
    }
    cb();
  };

  clearHtml = function() {
    this.UI.innerHTML = "";
  };

  loadOptionTags = () => {
    this.clearHtml();

    let temp_subtitle_dir = "";
    let optionNode;

    optionNode = document.createElement("option");
    optionNode.value = "";
    optionNode.innerHTML = "Select a video to play";
    this.UI.appendChild(optionNode);

    for (var k in subtitles) {
      var subtitle = subtitles[k];
      var subtitle_dir = subtitle.split(/\//gi)[0];

      var optionText = "";

      if (subtitle.indexOf("/") > -1) {
        if (subtitle_dir != temp_subtitle_dir) {
          optionNode = document.createElement("optgroup");
          optionNode.label = Helper.validateTitle(subtitle_dir);
          this.UI.appendChild(optionNode);
        }
        optionText = Helper.validateTitle(
          subtitle.replace(subtitle_dir + "/", "&nbsp;&nbsp;&nbsp;")
        );
      } else {
        optionText = subtitle.substr(0, subtitle.length - 4);
      }

      optionNode = document.createElement("option");
      optionNode.innerHTML = optionText;

      optionNode.value = k;
      this.UI.appendChild(optionNode);
      temp_subtitle_dir = subtitle_dir;
    }

    this.UI.appendChild(optionNode);
  };
};
