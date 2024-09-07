const lembrar_senha = document.getElementById('checkbox')
const senha = document.getElementById('senha')
const email = document.getElementById('email')

const form = document.getElementById('form')

senha.value = localStorage.getItem('pass')
email.value = localStorage.getItem('email')

if (localStorage.getItem('pass') != undefined) {
    lembrar_senha.checked = true
} else {
    lembrar_senha.checked = false
}

lembrar_senha.addEventListener('click', function () {
    var isChecked = lembrar_senha.checked
    console.log(isChecked)

    if (!isChecked) {
        localStorage.removeItem('email')
        localStorage.removeItem('pass')
    } else {
        localStorage.setItem('email', email.value)
        localStorage.setItem('pass', senha.value)
    }
})

form.addEventListener('keyup', function () {
    if (lembrar_senha.checked == true) {
        localStorage.setItem('email', email.value)
        localStorage.setItem('pass', senha.value)

    } else {
        localStorage.removeItem('email')
        localStorage.removeItem('pass')
    }
})

