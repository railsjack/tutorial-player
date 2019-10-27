module.exports = class Player {
  constructor() {
    this.playerUI = document.getElementById("video_player");
    this.captionUI = document.getElementById("playerCaption");
    this.titleUI = document.getElementById("video_title");

    return;
    new MediaElementPlayer(this.playerUI, {
      stretching: "auto",
      pluginPath: "player/media-elements/build/",
      success: function(media) {
        var renderer = document.getElementById(media.id + "-rendername");

        media.addEventListener("loadedmetadata", function() {});

        media.addEventListener("error", function(e) {});
      }
    });
  }

  bindEvents = (evName, callback) => {
    this.playerUI[evName] = callback;
  };

  play = (index, auto_play = true) => {
    if (index === 0) {
      return;
    }
    var base_dir = Helper.getListDir();
    this.playerUI.preload = true;
    this.playerUI.src = base_dir + "/" + mp4_files[index];
    this.captionUI.src = base_dir + "/" + subtitles[index];
    this.playerUI.textTracks[0].mode = "showing";
    this.titleUI.innerText = Helper.getHumanTitle(mp4_files[index]);

    this.playerUI.ontimeupdate = () => {
      if (this.playerUI.currentTime > 0) {
        Helper.setConf("currentTime", this.playerUI.currentTime);
      }
    };

    this.playerUI.focus();

    if (auto_play) {
      this.playerUI.play();
    } else {
      setTimeout(() => {
        var currentTime;
        if ((currentTime = Helper.getConf("currentTime"))) {
          this.playerUI.currentTime = parseFloat(currentTime);
        }
      }, 1000);
    }
  };
};
