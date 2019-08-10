document.ready = (callback) =>{
    if (typeof callback === 'function') {
        var onceCalled = false
        document.addEventListener("DOMContentLoaded", function (event) {
            if (!onceCalled) {
                onceCalled = true
                callback(event)
            }
        })
        document.onreadystatechange = function (event) {
            if (document.readyState == "interactive") {
                if (!onceCalled) {
                    onceCalled = true
                    callback(event)
                }
            }
        }
    }
}

class Player {
    constructor(){
        this.playerUI = document.getElementById('video_player')
        this.captionUI = document.getElementById('playerCaption')
    }
    play = (index, auto_play = true) => {
        var base_dir = Helper.getListDir()
        this.playerUI.preload = true
        this.playerUI.src = base_dir + '/' + mp4_files[index]
        this.captionUI.src = base_dir + '/' + vtt_files[index]
        this.playerUI.textTracks[0].mode = 'showing'
        this.playerUI.ontimeupdate = () => {
            if (this.playerUI.currentTime > 0) {
                localStorage.setItem('currentTime', this.playerUI.currentTime)
            }
        }

        this.playerUI.onended = () => {
            localStorage.setItem('currentTime', 0)
        }

        this.playerUI.focus()

        setTimeout(() => {
            var currentTime
            if (currentTime = localStorage.getItem('currentTime')) {
                this.playerUI.currentTime = parseFloat(currentTime)
            }
        }, 1000)

        if (auto_play) {
            this.playerUI.play()
        }
    }
}

class Helper {
    static validateTitle = (title) => {
        var ret = title
        ret = ret.replace(/\.vtt/gi, '')
        return ret.replace(/\-/gi, ' ')
    }

    static loadScript = async (path) => {
        let script = document.createElement('script')
        script.src = path
        document.getElementsByTagName('head')[0].appendChild(script)
        return new Promise((resolve, eject) => {
            script.onload = () => resolve()
            script.onerror = () => eject()
        })
    }

    static getListDir = function () {
        const cached_list_dir = localStorage.getItem('list_dir')
        return cached_list_dir
    }

}


class TutorialList {

    constructor() {
        this.UI = document.getElementById('tutorialList')
    }

    load = async () => {

        this.bindEvents()

        var cached_list_dir = Helper.getListDir()
        if (cached_list_dir) {
            await Helper.loadScript(cached_list_dir + '/list_mp4.js')
            await Helper.loadScript(cached_list_dir + '/list_vtt.js')

            await this.loadOptionTags()
        }
        return new Promise((resolve, eject)=>{resolve()})
    }

    bindEvents = () => {
        this.UI.addEventListener('change', function (e) {
            Player.play(e.target.value)
            localStorage.setItem('playedIndex', this.UI.selectedIndex)
        })
    }

    setIndex = (index) => {
        this.UI.selectedIndex = index
    }

    selectedValue = () => this.UI.options[this.UI.selectedIndex].value

    setDir = function () {
        const app = require('electron').remote.app
        var basepath = Helper.getListDir() || app.getAppPath()
        const dialog = require('electron').remote.dialog
        const list_dir = dialog.showOpenDialog(null, {
            properties: ['openDirectory'],
            defaultPath: basepath
        })
        if (list_dir) {
            localStorage.setItem('list_dir', list_dir)
        }
        load()
    }

    clearHtml = function () {
        this.UI.innerHTML = ''
    }

    loadOptionTags = () => {

        this.clearHtml()

        let temp_vtt_file_dir = ''
        let optionNode

        optionNode = document.createElement('option')
        optionNode.value = ''
        optionNode.innerHTML = "Select a video to play"
        this.UI.appendChild(optionNode)

        for (var k in vtt_files) {
            var vtt_file = vtt_files[k]
            var vtt_file_dir = vtt_file.split(/\//gi)[0]

            if (vtt_file_dir != temp_vtt_file_dir) {
                optionNode = document.createElement('optgroup')
                optionNode.label = Helper.validateTitle(vtt_file_dir)
                this.UI.appendChild(optionNode)
            }

            optionNode = document.createElement('option')
            optionNode.value = k
            optionNode.innerHTML = Helper.validateTitle(vtt_file.replace(vtt_file_dir + "/", '&nbsp;&nbsp;&nbsp;'))
            this.UI.appendChild(optionNode)
            temp_vtt_file_dir = vtt_file_dir
        }

        this.UI.appendChild(optionNode)
    }
}



document.ready(async (event) => {

    const tutorialList = new TutorialList()
    const player = new Player()
    await tutorialList.load()

    if (playedIndex = localStorage.getItem('playedIndex')) {
        tutorialList.setIndex(parseInt(playedIndex))
        player.play(tutorialList.selectedValue(), false)
    }

})

