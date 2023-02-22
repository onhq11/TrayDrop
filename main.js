const { BrowserWindow, Menu, Tray, clipboard, app, screen } = require('electron')
const path = require('path')

let copiedText = ''
let tray = null, win = null

app.on('ready', () => {
    if (app.dock) app.dock.hide()

    tray = new Tray(path.join(__dirname, 'icon.jpg'))

    if (process.platform === 'win32') {
        tray.on('click', tray.popUpContextMenu)
    }

    const primaryDisplay = screen.getPrimaryDisplay()
    const { desktop_width, desktop_height } = primaryDisplay.workAreaSize

    win = new BrowserWindow({
        width: 400,
        height: 450,
        show: false,
        frame: false,
        resizable: false,
        fullscreenable: false
    })

    win.loadURL(`https://pairdrop.net`)

    tray.setToolTip('TrayDrop')

    const menu = Menu.buildFromTemplate([
        { label: 'Start Pairdrop', click() { win.show(); win.setAlwaysOnTop(true, 'screen'); win.setPosition(1920 - 400, 1080 - 450 - 50, false) } },
        { label: 'Force Clipboard Sync', click() { addClipping() } },
        { type: 'separator' },
        { label: 'Quit', click() { app.quit() }, },
    ])

    tray.setContextMenu(menu)

    win.on('blur', () => {
        win.setAlwaysOnTop(false, 'screen')
        win.hide()
    })
})

const getClipboard = () => {
    copiedText = clipboard.readText()
}

const putClipboard = () => {
    clipboard.writeText(copiedText)
}