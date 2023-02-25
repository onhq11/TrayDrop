document.getElementsByClassName('fadeRedirect')[0].style.opacity = 1.0

let popupVisible = false, configPhase = 1

document.getElementsByClassName('formBox')[0].addEventListener('submit', () => {
    switch(configPhase) {
        case 1:
            document.getElementsByClassName('loadingAnim')[0].style.zIndex = 1
            document.getElementsByClassName('loadingAnim')[0].style.opacity = 1.0
            
            document.getElementsByClassName('submitBtn')[0].style.opacity = 0.0

            let ip = document.getElementsByClassName('formText')[0].value
            if(!ip.includes(':')) {
                ip = ip+':30420'
            }

            if(!ip.includes('http')) {
                ip = 'http://'+ip
            }

            fetch(ip+'/ping', {
                method: "POST",
                mode: 'no-cors'
            }).then(response => response.json())
            .then(response => {
                console.log(response)
            })
            break
    }
})

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

        document.getElementsByClassName('popupText')[0].innerHTML = message
    
        setTimeout(function(){
            document.getElementsByClassName('popupBox')[0].style.transform = 'translate(-100%, -100%)'
            document.getElementsByClassName('popupBox')[0].style.filter = 'box-shadow(10px 10px 15px rgb(0 0 0 / 5%))'
            document.getElementsByClassName('popupBox')[0].style.width = '20vw'
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

function getCookie(cname) {
    let name = btoa(unescape(encodeURIComponent(cname))) + "="
    let decodedCookie = decodeURIComponent(document.cookie)
    let ca = decodedCookie.split(';')

    for(let i = 0; i <ca.length; i++) {
        let c = ca[i]

        while (c.charAt(0) == ' ') {
            c = c.substring(1)
        }

        if (c.indexOf(name) == 0) {
            return decodeURIComponent(c.substring(name.length, c.length))
        }
    }

    return ''
}

function setCookie(cname, value) {
    if(!value && value !== 0) { value = '' }
    document.cookie = cname+'='+value
}