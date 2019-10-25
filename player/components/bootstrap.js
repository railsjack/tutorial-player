class BootStrap {
  onReady = callback => {
    if (typeof callback === "function") {
      var onceCalled = false;
      document.addEventListener("DOMContentLoaded", function(event) {
        if (!onceCalled) {
          onceCalled = true;
          callback(event);
        }
      });
      document.onreadystatechange = function(event) {
        if (document.readyState == "interactive") {
          if (!onceCalled) {
            onceCalled = true;
            callback(event);
          }
        }
      };
    }
  };

  loadComponents = async event => {
    const { ipcRenderer } = require("electron");
    let selectDir = "";
    document.addEventListener("dragover", e => {
      e.preventDefault();
    });
    document.addEventListener("drop", e => {
      e.preventDefault();
      if (e.dataTransfer.files.length === 1) {
        selectDir = e.dataTransfer.files[0].path;
        ipcRenderer.send("Request", selectDir);
      } else {
        alert("You can drop only 1 directory at once.");
      }
      return false;
    });

    ipcRenderer.on("Response", (event, response) => {
      if (response.code !== 201) {
        alert(response.content);
      } else {
        if (selectDir != "") {
          Helper.setConf("list_dir", selectDir);
          Helper.setConf("currentTime", 0);
          Helper.setConf("playedIndex", 0);
        }
        alert(response.content);
        location.reload();
      }
    });

    const tutorialList = new TutorialList();
    const player = new Player();

    await tutorialList.load();

    tutorialList.bindEvents("change", e => {
      Helper.setConf("currentTime", 0);
      player.play(tutorialList.selectedValue());
      Helper.setConf("playedIndex", tutorialList.getIndex());
    });

    player.bindEvents("onended", args => {
      Helper.setConf("currentTime", 0);
      let nextIndex = tutorialList.getIndex() + 1;
      if (nextIndex < tutorialList.length()) {
        tutorialList.setIndex(nextIndex);
        player.play(tutorialList.selectedValue(), true);
      }
    });

    let playedIndex;
    if ((playedIndex = Helper.getConf("playedIndex"))) {
      tutorialList.setIndex(parseInt(playedIndex));
      player.play(tutorialList.selectedValue(), false);
    }
  };

  initialize = () => {
    this.onReady(this.loadComponents);
  };
}

module.exports = new BootStrap();
