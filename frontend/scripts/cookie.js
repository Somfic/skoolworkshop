function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + 2 * 60 * 60 * 1000);
    var expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
    var name = cname + '=';
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

function checkAdminCookie() {
    if (getCookie('admintoken')) {
        console.log('ok');
    } else if (getCookie('usertoken')) {
        alert(
            'You are not authorised to visit this page! \n You will be sent back to the user dashboard!'
        );
        window.location.href = '../dashboardGebruiker';
    } else {
        window.location.href = '/';
    }
}

function checkUserCookie() {
    if (getCookie('usertoken') || getCookie('admintoken')) {
        console.log('ok');
    } else {
        window.location.href = '/'; // loginpagina
    }
}

function checkLoginCookie() {
    if (getCookie('usertoken')) {
        window.location.href = 'dashboardGebruiker';
    } else if (getCookie('admintoken')) {
        window.location.href = 'dashboardBeheerder';
    }
}

function logout() {
    document.cookie =
        'usertoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie =
        'admintoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie = 'userID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    window.location.href = '/';
}
