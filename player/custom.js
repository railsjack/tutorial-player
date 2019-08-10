document.ready = (callback) => {
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

    static getListDir = () => {
        const cached_list_dir = Helper.getConf('list_dir')
        return cached_list_dir
    }

    static getHumanTitle = (path) => {
        let ret = path.replace(/[\\\/]/g, ' > ')
        ret = ret.replace(/\.mp4/g, '')
        ret = ret.replace(/\.vtt/g, '')
        return ret.replace(/[^A-Za-z0-9\.\>]/g, ' ')
    }

    static getConf = (key) => {
        return localStorage.getItem(key)
    }

    static setConf = (key, value) => {
        localStorage.setItem(key, value)
    }

}


class Player {

    constructor() {
        this.playerUI = document.getElementById('video_player')
        this.captionUI = document.getElementById('playerCaption')
        this.titleUI = document.getElementById('video_title')
    }

    bindEvents = (evName, callback) => {
        this.playerUI[evName] = callback
    }

    play = (index, auto_play = true) => {
        if (index === 0) {
            return
        }
        var base_dir = Helper.getListDir()
        this.playerUI.preload = true
        this.playerUI.src = base_dir + '/' + mp4_files[index]
        this.captionUI.src = base_dir + '/' + vtt_files[index]
        this.playerUI.textTracks[0].mode = 'showing'
        this.titleUI.innerText = Helper.getHumanTitle(mp4_files[index])

        this.playerUI.ontimeupdate = () => {
            if (this.playerUI.currentTime > 0) {
                Helper.setConf('currentTime', this.playerUI.currentTime)
            }
        }

        this.playerUI.focus()

        setTimeout(() => {
            var currentTime
            if (currentTime = Helper.getConf('currentTime')) {
                this.playerUI.currentTime = parseFloat(currentTime)
            }
        }, 1000)

        if (auto_play) {
            this.playerUI.play()
        }
    }
}


class TutorialList {

    constructor() {
        this.UI = document.getElementById('tutorialList')
        this.selectorButton = document.getElementById('selectListBtn')
        this.selectorButton.addEventListener('click', (e) => {
            this.setDir()
        })
        this.bindEvents()
    }

    bindEvents = (evName, callback) => {
        this.UI.addEventListener(evName, callback)
    }

    load = async () => {
        var cached_list_dir = Helper.getListDir()
        if (cached_list_dir) {
            await Helper.loadScript(cached_list_dir + '/list_mp4.js')
            await Helper.loadScript(cached_list_dir + '/list_vtt.js')

            await this.loadOptionTags()
        }
        return new Promise((resolve, eject) => { resolve() })
    }

    setIndex = (index) => {
        this.UI.selectedIndex = index
    }

    getIndex = () => this.UI.selectedIndex
    length = () => this.UI.options.length

    selectedValue = () => {
        if (this.UI.options[this.UI.selectedIndex]) {
            return this.UI.options[this.UI.selectedIndex].value
        } else {
            return 0
        }
    }

    setDir = function () {
        const app = require('electron').remote.app
        var basepath = Helper.getListDir() || app.getAppPath()
        const dialog = require('electron').remote.dialog
        const list_dir = dialog.showOpenDialog(null, {
            properties: ['openDirectory'],
            defaultPath: basepath
        })
        if (list_dir) {
            Helper.setConf('list_dir', list_dir)
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

    tutorialList.bindEvents('change', (e) => {
        Helper.setConf('currentTime', 0)
        player.play(tutorialList.selectedValue())
        Helper.setConf('playedIndex', this.UI.selectedIndex)
    })

    player.bindEvents('onended', (args) => {
        Helper.setConf('currentTime', 0)
        let nextIndex = tutorialList.getIndex() + 1
        if (nextIndex < tutorialList.length()) {
            tutorialList.setIndex(nextIndex)
            player.play(tutorialList.selectedValue(), true)
        }
    })

    if (playedIndex = Helper.getConf('playedIndex')) {
        tutorialList.setIndex(parseInt(playedIndex))
        player.play(tutorialList.selectedValue(), false)
    }

})

