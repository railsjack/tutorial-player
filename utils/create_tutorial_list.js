const glob = require("glob");
const path = require("path");
const fs = require("fs");

function writeListFile(arrList, varName, fileName, dirPath) {
  let newArrList = arrList.map(function(item) {
    return item.replace(dirPath + "/", "");
  });
  let content = newArrList.join('",\n"');
  content = "var " + varName + ' = [\n"' + content + '"\n];';
  fs.writeFileSync(dirPath + "/" + fileName, content);
}

function naturalSort(myArray) {
  var collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base"
  });
  return myArray.sort(collator.compare);
}

function validateVTT(mp4_files, vtt_files) {
	var new_vtt_files = [];
  for( var i = 0; i < mp4_files.length; i++ ) {
		var mp4_file = mp4_files[i];
    var vtt_file = mp4_file.substr(0, mp4_file.length - 4) + ".vtt";
    var srt_file = mp4_file.substr(0, mp4_file.length - 4) + ".srt";
    if (vtt_files.indexOf(vtt_file) > -1) {
      new_vtt_files.push(vtt_file);
    } else if (vtt_files.indexOf(srt_file) > -1) {
      new_vtt_files.push(srt_file);
    } else {
      new_vtt_files.push(vtt_file);
    }
  }
  return new_vtt_files;
}

module.exports = (dirPath, cb) => {
  let mp4_files = glob.sync(path.join(dirPath, "/**/*.mp4"));
  let vtt_files = glob.sync(path.join(dirPath, "/**/*.vtt"));
  let srt_files = glob.sync(path.join(dirPath, "/**/*.srt"));

  if ( vtt_files.length < srt_files.length ) {
    vtt_files = srt_files;
	}

	mp4_files = naturalSort(mp4_files);
	
	vtt_files = validateVTT(mp4_files, vtt_files);

  const newDirPath = dirPath.replace(/\\/g, "/");
  writeListFile(mp4_files, "mp4_files", "list_mp4.js", newDirPath);

  if (vtt_files.length > 0) {
    writeListFile(vtt_files, "vtt_files", "list_vtt.js", newDirPath);
  } else {
    writeListFile([], "vtt_files", "list_vtt.js", newDirPath);
  }

  cb({ result: true });
};
