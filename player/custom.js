document.ready = function (callback) {
    if (typeof callback === 'function') {
        var onceCalled = false;
        document.addEventListener("DOMContentLoaded", function (event) {
            if (!onceCalled) {
                onceCalled = true;
                callback(event);
            }
        });
        document.onreadystatechange = function (event) {
            if (document.readyState == "interactive") {
                if (!onceCalled) {
                    onceCalled = true;
                    callback(event);
                }
            }
        }
    }
};

var Player = function () {
    var _play = function (index) {
        var base_dir = 
        video_player.src = base_dir + '/' + mp4_files[index]
        playerCaption.src = base_dir + '/' + vtt_files[index]
        video_player.textTracks[0].mode = 'showing';
        video_player.play();
    }
    return {
        play: _play
    }
}();

var TutorialList = function () {
    var _validateTitle = function (title) {
        var ret = title;
        ret = ret.replace(/\.vtt/gi, '');
        return ret.replace(/\-/gi, ' ');
    };

    var _load = function () {
        var cached_data_dir = _get_dir();
        if(cached_data_dir) {
            _load_script(cached_data_dir + '/list_mp4.js');
            _load_script(cached_data_dir + '/list_vtt.js');
            setTimeout(_load_html, 500);
        }
    };

    var _load_script = async function (path) {
        var script = document.createElement('script')
        script.src = path
        document.getElementsByTagName('head')[0].appendChild(script);
    };

    var _set_dir = function () {
        const app = require('electron').remote.app
        var basepath = app.getAppPath();
        const dialog = require('electron').remote.dialog
        const data_dir = dialog.showOpenDialog(null, {
            properties: ['openDirectory'],
            defaultPath: basepath
        })
        if (data_dir) {
            localStorage.setItem('data_dir', data_dir)
        }
        _load();
    };

    var _get_dir = function () {
        const cached_data_dir = localStorage.getItem('data_dir')
        return cached_data_dir;
    };


    var _load_html = function () {

        var temp_vtt_file_dir = '';
        var optionNode;

        optionNode = document.createElement('option')
        optionNode.value = ''
        optionNode.innerHTML = "Select a video to play"
        tutorialList.appendChild(optionNode)

        for (var k in vtt_files) {
            var vtt_file = vtt_files[k]
            var vtt_file_dir = vtt_file.split(/\//gi)[0]

            if (vtt_file_dir != temp_vtt_file_dir) {
                optionNode = document.createElement('optgroup')
                optionNode.label = _validateTitle(vtt_file_dir)
                tutorialList.appendChild(optionNode)
            }

            optionNode = document.createElement('option')
            optionNode.value = k
            optionNode.innerHTML = _validateTitle(vtt_file.replace(vtt_file_dir + "/", '&nbsp;&nbsp;&nbsp;'))
            tutorialList.appendChild(optionNode)
            temp_vtt_file_dir = vtt_file_dir
        }

        tutorialList.appendChild(optionNode)
    }
    return {
        load: _load,
        set_dir: _set_dir
    }
}();



document.ready(function (event) {

    tutorialList.addEventListener('change', function (e) {
        Player.play(e.target.value)
    });

});



