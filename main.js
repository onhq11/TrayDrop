const { BrowserWindow, Menu, Tray, clipboard, app, screen, shell, Notification } = require('electron')
const path = require('path')
const Store = require('electron-store')
const fs = require('fs')

const schema = {
    firstConfig: {
        type: 'boolean'
    },
    clipboardSync: {
        type: 'boolean'
    },
    token: {
        type: 'string'
    },
    username: {
        type: 'string'
    },
    hostname: {
        type: 'string'
    },
    hostnameMain: {
        type: 'string'
    },
    hostnameAlt: {
        type: 'string'
    },
    pairdropURL: {
        type: 'string'
    }
}
const store = new Store({schema})

let notConfigured = false
const fileExists = fs.existsSync('./config.json')
if(fileExists) {
    let config = fs.readFileSync('./config.json')
    let parsed = JSON.parse(config)

    if(parsed.token != 'null' && parsed.hostnameMain != 'null' && parsed.username != 'null') {
        store.set('token', parsed.token)
        store.set('username', parsed.username)
        store.set('hostname', parsed.hostnameMain)
        store.set('hostnameMain', parsed.hostnameMain)
        store.set('hostnameAlt', parsed.hostnameAlt)
        store.set('pairdropURL', parsed.pairdropURL)
        
        store.set('firstConfig', false)
        store.set('clipboardSync', true)

        if(!store.get('pairdropURL').includes('//')) {
            store.set('pairdropURL', 'https://pairdrop.net')
        }
    } else {
        notConfigured = true
    }
} else {
    notConfigured = true
}

if(notConfigured) {
    store.set('token', '')
    store.set('username', '')
    store.set('hostname', '')
    store.set('hostnameMain', '')
    store.set('hostnameAlt', '')
    store.set('pairdropURL', '')
    
    store.set('firstConfig', true)
    store.set('clipboardSync', false)
}

let copiedText = ''
let copiedTextDate = ''
let tray = null, win = null
let trayVisible = false, syncBlocked = !store.get('clipboardSync'), hostnameChanged = false
let dim = {
    width: null,
    height: null
}

let errorNotify = 0

app.on('ready', () => {
    if (app.dock) app.dock.hide()

    tray = new Tray(path.join(__dirname, 'img/icon.png'))
    tray.setIgnoreDoubleClickEvents(true)
    tray.setToolTip('TrayDrop')
    tray.on('click', () => {
        if(trayVisible) {
            toggleTray(false)
        } else {
            toggleTray(true)
        }
    })

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    dim.width = width
    dim.height = height

    const menu = Menu.buildFromTemplate([
        { label: 'Open Pairdrop', click() { toggleTray(true) } },
        { label: 'Force Clipboard Sync', click() { syncClipboard(true) } },
        { type: 'separator' },
        { label: 'Options', type: 'submenu', submenu: [
            { label: 'Clipboard Auto Sync', type: 'checkbox', checked: true, click(item) { if(item.checked) { syncBlocked = false } else { syncBlocked = true } } },
            { label: 'Reconfigure', click() { reconfigure() } },
            { type: 'separator' },
            { label: 'Report bugs', click() { shell.openExternal("https://github.com/onhq11/TrayDrop/issues") } },
            { label: 'Docs', click() { shell.openExternal("https://github.com/onhq11/TrayDrop/blob/main/README.md") } }
        ] },
        { label: 'Quit', click() { app.quit() }, },
    ])
    tray.setContextMenu(menu)

    win = new BrowserWindow({
        width: width / 4.8,
        height: height / 2.4 + 20,
        show: false,
        frame: false,
        resizable: false,
        fullscreenable: false,
        title: 'TrayDrop',
        icon: path.join(__dirname, 'img/icon.png'),
        webPreferences: {
            devTools: false,
            preload: true,
            zoomFactor: 0.8
        }
    })

    win.loadURL(store.get('pairdropURL'))
    win.on('blur', () => {
        toggleTray(false)
    })

    win.webContents.on('page-favicon-updated', (event, favicon) => {
        if(favicon.includes('https://pairdrop.net/images/favicon-96x96-notification.png')) {
            toggleTray(true)
        }
    })

    win.webContents.on('media-started-playing', () => {
        setTimeout(() => {
            getConfigWin.webContents.executeJavaScript('document.querySelector("#receiveFileDialog > x-background > x-paper > div.row-reverse.space-between > button").click()', true)
        }, 5000)
    })

    if(store.get('firstConfig')) {
        let configWin = new BrowserWindow({
            width: 750,
            height: 600,
            show: true,
            frame: false,
            resizable: true,
            fullscreenable: false,
            title: 'TrayDrop',
            icon: path.join(__dirname, 'img/icon.png'),
            webPreferences: {
                devTools: false,
                preload: true,
                zoomFactor: 0.8,
                nodeIntegration: true,
                enableRemoteModule: true,
                contextIsolation:false
            }
        })
    
        configWin.loadFile('pages/config.html')

        configWin.on('close', () => {
            extractConfig()
        })
    } else {
        tryLogin()
    }

    setInterval(syncClipboard, 5000)
})

const toggleTray = (show) => {
    if(show) {
        win.show()
        win.setAlwaysOnTop(true, 'screen')
        win.setPosition(dim.width - dim.width / 4.8, dim.height - (dim.height / 2.4 + 20), false)
        trayVisible = true
        fadeWindowIn(win)
    } else {
        fadeWindowOut(win)

        setTimeout(() => {
            win.setAlwaysOnTop(false, 'screen')
            win.hide()
            trayVisible = false
        }, 1000)
    }
}

const extractConfig = () => {
    let getConfigWin = new BrowserWindow({
        show: false
    })

    getConfigWin.loadFile('pages/config.html')

    getConfigWin.webContents.executeJavaScript('localStorage.getItem("username")+"{SEPARATOR}"+localStorage.getItem("token")+"{SEPARATOR}"+localStorage.getItem("hostnameMain")+"{SEPARATOR}"+localStorage.getItem("hostnameAlt")+"{SEPARATOR}"+localStorage.getItem("pairdropURL")', true)
    .then(result => {
        let config = result.split('{SEPARATOR}')
        let out = {
            username: config[0],
            token: config[1],
            hostnameMain: config[2],
            hostnameAlt: config[3],
            pairdropURL: config[4]
        }

        fs.writeFileSync('./config.json', JSON.stringify(out))

        syncBlocked = false
        app.relaunch()
        app.exit()
    })
}

const tryLogin = () => {
    fetch(store.get('hostname')+'/validateToken', {
        method: 'POST',
        body: JSON.stringify({"username": store.get('username')}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': store.get('token')
        }
    }).then(response => response.json())
    .then(response => {
        if(response.error) {
            reconfigure()
        }
    })
    .catch(err => {
        if(store.get('hostnameAlt') && !hostnameChanged) {
            store.set('hostname', store.get('hostnameAlt'))
            store.set('hostnameAlt', store.get('hostnameMain'))
            store.set('hostnameMain', store.get('hostname'))

            tryLogin()
            errorNotify++
        } else {
            new Notification({ title: 'Network error', body: 'Cannot connect to TrayDrop server' }).show()
            errorNotify++
        }
    })
}

const syncClipboard = (forced) => {
    if(syncBlocked) {
        return
    }

    if(copiedText != clipboard.readText()) {
        copiedText = clipboard.readText()
        let date = new Date()
        date.setTime(date.getTime() + 1 * 60 * 60 * 1000)
        copiedTextDate = date
    }

    fetch(store.get('hostname')+'/clipboard', {
        method: 'POST',
        body: JSON.stringify({"username": store.get('username'), "cbText": copiedText, "cbDate": copiedTextDate}),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': store.get('token')
        }
    }).then(response => response.json())
    .then(response => {
        copiedText = response.result
        copiedTextDate = response.date

        clipboard.writeText(response.result)
    })
    .catch(err => {
        errorNotify++

        if(errorNotify >= 5) {
            syncBlocked = true
            new Notification({ title: 'Clipboard service stopped', body: 'The service has been stopped due to problems with the connection to the server' }).show()
        }
    })
}

const fadeWindowIn = (browserWindowToFadeIn) => {
    let opacity = browserWindowToFadeIn.getOpacity(), fadeEveryXSeconds = 10, step = 0.1

    const interval = setInterval(() => {
        if (opacity >= 1) clearInterval(interval)

        browserWindowToFadeIn.setOpacity(opacity)
        opacity += step
    }, fadeEveryXSeconds)

    return interval
}

const fadeWindowOut = (browserWindowToFadeOut) => {
    let opacity = browserWindowToFadeOut.getOpacity(), fadeEveryXSeconds = 10, step = 0.1

    const interval = setInterval(() => {
        if (opacity <= 0) clearInterval(interval)
        
        browserWindowToFadeOut.setOpacity(opacity)
        opacity -= step
    }, fadeEveryXSeconds)

    return interval
}

const reconfigure = () => {
    fs.unlinkSync('./config.json')

    let configWin = new BrowserWindow({
        width: 750,
        height: 600,
        show: true,
        frame: false,
        resizable: true,
        fullscreenable: false,
        title: 'TrayDrop',
        icon: path.join(__dirname, 'img/icon.png'),
        webPreferences: {
            devTools: false,
            preload: true,
            zoomFactor: 0.8,
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation:false
        }
    })

    configWin.loadFile('pages/config.html')

    configWin.on('close', () => {
        extractConfig()
    })

    store.set('token', '')
    store.set('username', '')
    store.set('hostname', '')
    
    store.set('firstConfig', true)
    store.set('clipboardSync', false)
    syncBlocked = true
}