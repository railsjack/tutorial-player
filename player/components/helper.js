module.exports = class Helper {
  static validateTitle = title => {
    var ret = title;
    ret = ret.replace(/\.vtt/gi, "");
    ret = ret.replace(/\.srt/gi, "");
    return ret.replace(/\-/gi, " ");
  };

  static loadScript = async path => {
    let script = document.createElement("script");
    script.src = path;
    document.getElementsByTagName("head")[0].appendChild(script);
    return new Promise((resolve, eject) => {
      script.onload = () => resolve();
      script.onerror = () => eject();
    });
  };

  static getListDir = () => {
    const cached_list_dir = Helper.getConf("list_dir");
    return cached_list_dir;
  };

  static getHumanTitle = path => {
    let ret = path.replace(/[\\\/]/g, " > ");
    ret = ret.replace(/\.mp4/g, "");
    ret = ret.replace(/\.vtt/g, "");
    ret = ret.replace(/\.srt/g, "");
    return ret.replace(/[^A-Za-z0-9\.\>]/g, " ");
  };

  static getConf = key => {
    return localStorage.getItem(key);
  };

  static setConf = (key, value) => {
    localStorage.setItem(key, value);
  };
};
