module.exports = class TutorialList {
  constructor() {
    this.UI = document.getElementById("tutorialList");
    this.selectorButton = document.getElementById("selectListBtn");
    this.selectorButton.addEventListener("click", e => {
      this.setDir();
    });
  }

  bindEvents = (evName, callback) => {
    this.UI.addEventListener(evName, callback);
  };

  load = async () => {
    var cached_list_dir = Helper.getListDir();
    if (cached_list_dir) {
      await Helper.loadScript(cached_list_dir + "/list_mp4.js");
      await Helper.loadScript(cached_list_dir + "/list_vtt.js");

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

  setDir = function() {
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
    load();
  };

  clearHtml = function() {
    this.UI.innerHTML = "";
  };

  loadOptionTags = () => {
    this.clearHtml();

    let temp_vtt_file_dir = "";
    let optionNode;

    optionNode = document.createElement("option");
    optionNode.value = "";
    optionNode.innerHTML = "Select a video to play";
    this.UI.appendChild(optionNode);

    for (var k in vtt_files) {
      var vtt_file = vtt_files[k];
      var vtt_file_dir = vtt_file.split(/\//gi)[0];

      if (vtt_file.indexOf("/") > -1 && vtt_file_dir != temp_vtt_file_dir) {
        optionNode = document.createElement("optgroup");
        optionNode.label = Helper.validateTitle(vtt_file_dir);
        this.UI.appendChild(optionNode);
      }

      optionNode = document.createElement("option");
      optionNode.value = k;
      if (vtt_file.indexOf("/") > -1){
        optionNode.innerHTML = Helper.validateTitle(
          vtt_file.replace(vtt_file_dir + "/", "&nbsp;&nbsp;&nbsp;")
        );
      } else {
        optionNode.innerHTML = vtt_file;
      }
      this.UI.appendChild(optionNode);
      temp_vtt_file_dir = vtt_file_dir;
    }

    this.UI.appendChild(optionNode);
  };
};
