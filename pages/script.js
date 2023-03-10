document.getElementsByClassName('fadeRedirect')[0].style.opacity = 1.0

let popupVisible = false, configPhase = 1

document.getElementsByClassName('formText')[0].focus()

document.getElementsByClassName('formBox')[0].addEventListener('submit', () => {
    switch(configPhase) {
        case 1:
            document.getElementsByClassName('loadingAnim')[0].style.zIndex = 1
            document.getElementsByClassName('loadingAnim')[0].style.opacity = 1.0
            
            document.getElementsByClassName('submitBtn')[0].style.opacity = 0.0

            let ip = document.getElementsByClassName('formText')[0].value
            if(!ip.includes(':')) {
                ip = ip+':8080'
            }

            if(!ip.includes('http')) {
                ip = 'http://'+ip
            }

            fetch(ip+'/ping', {
                method: "POST"
            }).then(response => response.json())
            .then(response => {
                if(response.result === 'pong') {
                    localStorage.clear()
                    configPhase = 2
                    showNotification('Server found', false)
                    localStorage.setItem('hostnameMain', ip)
                    loadingEnd(true)
                } else {
                    showNotification('Server not found', true)
                    loadingEnd()
                }
            })
            .catch(err => {
                showNotification('Server not found', true)
                loadingEnd()
            })
            break

        case 2:
            document.getElementsByClassName('loadingAnim')[0].style.zIndex = 1
            document.getElementsByClassName('loadingAnim')[0].style.opacity = 1.0
            
            document.getElementsByClassName('submitBtn')[0].style.opacity = 0.0

            let login = {
                username: document.getElementsByClassName('formText')[0].value,
                password: document.getElementsByClassName('formText')[1].value
            }

            fetch(localStorage.getItem('hostnameMain')+'/login', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(login)
            }).then(response => response.json())
            .then(response => {
                if(response.error) {
                    showNotification(response.error, true)
                    loadingEnd()
                    return
                }

                localStorage.setItem('username', document.getElementsByClassName('formText')[0].value)
                localStorage.setItem('token', response.result)
                configPhase = 3
                loadingEnd(true)
            })
            .catch(err => {
                showNotification('Server not found, try again', true)
                loadingEnd()
                setTimeout(function(){ location.reload() }, 3200)
            })
            break

        case 2.5:
            if(document.getElementsByClassName('formText')[1].value !== document.getElementsByClassName('formText')[2].value) {
                showNotification('Passwords do not match', true)
                return
            }

            document.getElementsByClassName('loadingAnim')[0].style.zIndex = 1
            document.getElementsByClassName('loadingAnim')[0].style.opacity = 1.0
            
            document.getElementsByClassName('submitBtn')[0].style.opacity = 0.0

            let register = {
                username: document.getElementsByClassName('formText')[0].value,
                password: document.getElementsByClassName('formText')[1].value
            }

            fetch(localStorage.getItem('hostname')+'/register', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(register)
            }).then(response => response.json())
            .then(response => {
                if(response.error) {
                    showNotification(response.error, true)
                    loadingEnd()
                    return
                }

                localStorage.setItem('token', response.result)
                configPhase = 3
                loadingEnd(true)
            })
            .catch(err => {
                showNotification('Server not found, try again', true)
                loadingEnd()
                setTimeout(function(){ location.reload() }, 3200)
            })
            break

        case 4:
            let ip2 = document.getElementsByClassName('formText')[0].value
            if(!ip2.includes(':')) {
                ip2 = ip2+':8080'
            }

            if(!ip2.includes('http')) {
                ip2 = 'http://'+ip2
            }

            localStorage.setItem('hostnameAlt', ip2)

            configPhase = 3
            loadingEnd(true)
            break

        case 4.5:
            localStorage.setItem('pairdropURL', document.getElementsByClassName('formText')[0].value)

            configPhase = 3
            loadingEnd(true)
            break
    }
})

function loadingEnd(passed) {
    if(passed) {
        document.getElementsByClassName('formBox')[0].style.transition = '0.2s'
        document.getElementsByClassName('formBox')[0].style.opacity = 0.0

        setTimeout(function(){
            switch(configPhase) {
                case 2:
                    document.getElementsByClassName('formBox')[0].innerHTML = `
                        <div class="formTextField">
                            <input type="text" class="formText" required>
                            <span></span>
                            <label>Username</label>
                        </div>
                        <div class="formTextField">
                            <input type="password" class="formText" required>
                            <span></span>
                            <label>Password</label>
                        </div>
                        <div class="loadingAnim"><div></div><div></div></div>
                        
                        <input type="submit" value="Log in" class="submitBtn">
                        <div class="formHint">Don't have an account? <div onclick="configPhase = 2.5; loadingEnd(true)">Register</div></div>
                        <div class="formHint"><div onclick="localStorage.setItem('clipboardSkipped', 'true'); configPhase = 3; loadingEnd(true)">Skip for now</div>` 

                    document.getElementsByClassName('formText')[0].focus()                   
                    break

                case 2.5:
                    document.getElementsByClassName('formBox')[0].innerHTML = `
                        <div class="formTextField">
                            <input type="text" class="formText" required>
                            <span></span>
                            <label>Username</label>
                        </div>
                        <div class="formTextField">
                            <input type="password" class="formText" required>
                            <span></span>
                            <label>Password</label>
                        </div>
                        <div class="formTextField">
                            <input type="password" class="formText" required>
                            <span></span>
                            <label>Confirm Password</label>
                        </div>
                        <div class="loadingAnim"><div></div><div></div></div>
                        
                        <input type="submit" value="Register" class="submitBtn">
                        <div class="formHint">Already have an account? <div onclick="configPhase = 2; loadingEnd(true)">Log in</div></div>
                        <div class="formHint"><div onclick="localStorage.setItem('clipboardSkipped', 'true'); configPhase = 3; loadingEnd(true)">Skip for now</div>`

                    document.getElementsByClassName('formText')[0].focus()
                    break

                case 3:
                    document.getElementsByClassName('formBox')[0].innerHTML = `
                        <h2>Everything is ready</h2><br>
                        <input type="button" value="Back to the app" class="submitBtn" id="wakeApp">

                        <div class="addonsTile" style="margin-top: 15%">
                            <h3><img src="img/circle.svg" height="16px" width="16px">Add alternative hostname</h3>
                        </div>
                        <div class="addonsTile">
                            <h3><img src="img/circle.svg" height="16px" width="16px">Add custom pairdrop URL</h3>
                        </div>`

                    if(localStorage.getItem('hostnameAlt') !== '' && localStorage.getItem('hostnameAlt')) {
                        document.getElementsByClassName('addonsTile')[0].getElementsByTagName('h3')[0].getElementsByTagName('img')[0].setAttribute('src', 'img/check-circle.svg')
                    }

                    if(localStorage.getItem('pairdropURL') !== '' && localStorage.getItem('pairdropURL')) {
                        document.getElementsByClassName('addonsTile')[1].getElementsByTagName('h3')[0].getElementsByTagName('img')[0].setAttribute('src', 'img/check-circle.svg')
                    }

                    document.getElementById('wakeApp').addEventListener('click', () => {
                        if(localStorage.getItem('token') && localStorage.getItem('hostnameMain') || localStorage.getItem('clipboardSkipped')) {
                            if(!localStorage.getItem('hostnameAlt')) {
                                localStorage.setItem('hostnameAlt', '')
                            }

                            if(!localStorage.getItem('pairdropURL')) {
                                localStorage.setItem('pairdropURL', '')
                            }

                            window.close()
                        } else {
                            showNotification('Cannot save auth data, try again later', true)
                        }
                    })

                    document.getElementsByClassName('addonsTile')[0].addEventListener('click', () => {
                        configPhase = 4
                        loadingEnd(true)
                    })

                    document.getElementsByClassName('addonsTile')[1].addEventListener('click', () => {
                        configPhase = 4.5
                        loadingEnd(true)
                    })
                    break

                case 4:
                    document.getElementsByClassName('formBox')[0].innerHTML = `
                        <div class="formTextField">
                            <input type="text" class="formText" required>
                            <span></span>
                            <label>Server address</label>
                        </div>
                        <div class="loadingAnim"><div></div><div></div></div>
                        
                        <input type="submit" value="Save" class="submitBtn">
                        <div class="formHint"><div onclick="configPhase = 3; loadingEnd(true)">Go back</div></div>`

                    document.getElementsByClassName('formText')[0].focus()                   
                    break

                case 4.5:
                    document.getElementsByClassName('formBox')[0].innerHTML = `
                        <div class="formTextField">
                            <input type="text" class="formText" required>
                            <span></span>
                            <label>Pairdrop address</label>
                        </div>
                        <div class="loadingAnim"><div></div><div></div></div>
                        
                        <input type="submit" value="Save" class="submitBtn">
                        <div class="formHint"><div onclick="configPhase = 3; loadingEnd(true)">Go back</div></div>`

                    document.getElementsByClassName('formText')[0].focus()                   
                    break
            }

            document.getElementsByClassName('formBox')[0].style.transition = '0s'
            document.getElementsByClassName('formBox')[0].style.marginLeft = '30vw'
            document.getElementsByClassName('formBox')[0].style.marginRight = '-30vw'

            setTimeout(function(){
                document.getElementsByClassName('formBox')[0].style.transition = '0.5s'
                document.getElementsByClassName('formBox')[0].style.opacity = 1.0
                document.getElementsByClassName('formBox')[0].style.marginLeft = '0vw'
                document.getElementsByClassName('formBox')[0].style.marginRight = '0vw'
            }, 100)
        }, 300)
    }

    document.getElementsByClassName('submitBtn')[0].style.opacity = 1.0

    document.getElementsByClassName('loadingAnim')[0].style.zIndex = -1
    document.getElementsByClassName('loadingAnim')[0].style.opacity = 0.0
}

function showNotification(message, error) {
    let animationDelay = 0

    if(popupVisible) {
        clearTimeout(popupHideAnimation)

        document.getElementsByClassName('popupBox')[0].style.transform = 'translate(-100%)'
        document.getElementsByClassName('popupBox')[0].style.filter = ''

        animationDelay = 300
    }

    setTimeout(function(){
        document.getElementsByClassName('popupTimeBar')[0].style.transition = '0s'
        document.getElementsByClassName('popupTimeBar')[0].style.width = '100%'

        if(error) {
            document.getElementsByClassName('popupIcon')[0].getElementsByTagName('img')[0].setAttribute('src', 'img/popupX.svg')
        } else {
            document.getElementsByClassName('popupIcon')[0].getElementsByTagName('img')[0].setAttribute('src', 'img/popupCheck.svg')
        }

        document.getElementsByClassName('popupText')[0].innerHTML = message
    
        setTimeout(function(){
            document.getElementsByClassName('popupBox')[0].style.transform = 'translate(-100%, -100%)'
            document.getElementsByClassName('popupBox')[0].style.filter = 'box-shadow(10px 10px 15px rgb(0 0 0 / 5%))'
            document.getElementsByClassName('popupBox')[0].style.width = '320px'
            document.getElementsByClassName('popupTimeBar')[0].style.transition = '3s'
            document.getElementsByClassName('popupTimeBar')[0].style.width = '1%'
            popupVisible = true
        }, 100)
    
        popupHideAnimation = setTimeout(function(){
            document.getElementsByClassName('popupBox')[0].style.transform = 'translate(-100%)'
            document.getElementsByClassName('popupBox')[0].style.filter = ''
            popupVisible = false
        }, 3000)
    }, animationDelay)
}