module.exports = class Seekbar {
  constructor() {
    this.UI = document.getElementById("seekbar");
    this.posUI = document.getElementById("seekbar_pos");
    this.UI.ontimeupdate = function() {
      var percentage = (vid.currentTime / vid.duration) * 100;
      $("#custom-seekbar span").css("width", percentage + "%");
    };

    this.drag_started = false;

    this.posUI.onmousedown = e => {
      console.log("onmousedown...");
      this.drag_started = true;
    };
    this.UI.onmousemove = e => {
      if (this.drag_started) {
        console.log("onmousemove...");
        this.posUI.style.left = e.pageX;
      }
    };
    this.UI.onmouseup = e => {
      console.log("onmouseup...");
      this.drag_started = false;
    };
    this.posUI.onmouseup = e => {
      console.log("onmouseup...");
      this.drag_started = false;
    };
  }

  bindEvents = (evName, callback) => {
    this.UI.addEventListener(evName, callback);
    this.UI[evName] = callback;
  };
};
