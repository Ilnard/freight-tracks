// Навигация в форме
const navLinks = document.querySelectorAll('.auth-form__main-link')
const regNavLinksBlock = document.querySelector('.auth-form__nav_2')
const regNavLinks = document.querySelectorAll('.auth-form__reg-link')
const form = document.querySelector('.auth-form__fields')

function formComponent(select) {
    switch (select) {
        case 'auth': {
            doActiveNavLink(navLinks, navLinks[0])

            form.innerHTML = `
            <div class="auth-form-field">
                <div class="auth-form-field__input-wrapper">
                    <span class="auth-form-field__placeholder">Email</span>
                    <input type="email" class="auth-form-field__input" name="email">
                </div>
                <span class="auth-form-field__error"></span>
            </div>
            <div class="auth-form-field">
                <div class="auth-form-field__input-wrapper">
                    <span class="auth-form-field__placeholder">Пароль</span>
                    <input type="password" class="auth-form-field__input" name="password">
                </div>
                <span class="auth-form-field__error"></span>
            </div>
            <div class="auth-form-field">
                <input type="submit" class="auth-form-field__input auth-form-field__submit fw700" name="auth" value="Войти">
                <span class="auth-form-field__global-error"></span>
            </div>`

            changeSubmitBtn()
            regNavLinksBlock.classList.remove('auth-form__nav_active')
            animPlaceholders()
            break
        }
        case 'reg': {
            doActiveNavLink(navLinks, navLinks[1])
            changeSubmitBtn()
            formRegComponent('regDriver')
            regNavLinksBlock.classList.add('auth-form__nav_active')
            animPlaceholders()
            break
        }
    }
}
function formRegComponent(select) {
    switch (select) {
        case 'regDriver': {
            doActiveNavLink(regNavLinks, regNavLinks[0])

            form.innerHTML = `
            <div class="auth-form-field">
                <div class="auth-form-field__input-wrapper">
                    <span class="auth-form-field__placeholder">Имя</span>
                    <input type="text" class="auth-form-field__input" name="name">
                </div>
                <span class="auth-form-field__error"></span>
            </div>
            <div class="auth-form-field">
                <div class="auth-form-field__input-wrapper">
                    <span class="auth-form-field__placeholder">Фамилия</span>
                    <input type="text" class="auth-form-field__input" name="surname">
                </div>
                <span class="auth-form-field__error"></span>
            </div>
            <div class="auth-form-field">
                <div class="auth-form-field__input-wrapper">
                    <span class="auth-form-field__placeholder">Email</span>
                    <input type="email" class="auth-form-field__input" name="email">
                </div>
                <span class="auth-form-field__error"></span>
            </div>
            <div class="auth-form-field">
                <div class="auth-form-field__input-wrapper">
                    <span class="auth-form-field__placeholder">Номер телефона</span>
                    <input type="tel" class="auth-form-field__input" name="phone">
                </div>
                <span class="auth-form-field__error"></span>
            </div>
            <div class="auth-form-field">
                <div class="auth-form-field__input-wrapper">
                    <span class="auth-form-field__placeholder">Марка и модель транспорта</span>
                    <input type="text" class="auth-form-field__input" name="model">
                </div>
                <span class="auth-form-field__error"></span>
            </div>
            <div class="auth-form-field">
                <div class="auth-form-field__input-wrapper">
                    <span class="auth-form-field__placeholder">Пароль</span>
                    <input type="password" class="auth-form-field__input" name="password">
                </div>
                <span class="auth-form-field__error"></span>
            </div>
            <div class="auth-form-field">
                <input type="submit" class="auth-form-field__input auth-form-field__submit fw700" name="reg-driver" value="Зарегистрироваться">
                <span class="auth-form-field__global-error"></span>
            </div>`

            changeSubmitBtn()
            animPlaceholders()
            break
        }
        case 'regCompany': {
            doActiveNavLink(regNavLinks, regNavLinks[1])

            form.innerHTML = `
            <div class="auth-form-field">
                <div class="auth-form-field__input-wrapper">
                    <span class="auth-form-field__placeholder">Имя</span>
                    <input type="text" class="auth-form-field__input" name="name">
                </div>
                <span class="auth-form-field__error"></span>
            </div>
            <div class="auth-form-field">
                <div class="auth-form-field__input-wrapper">
                    <span class="auth-form-field__placeholder">Фамилия</span>
                    <input type="text" class="auth-form-field__input" name="surname">
                </div>
                <span class="auth-form-field__error"></span>
            </div>
            <div class="auth-form-field">
                <div class="auth-form-field__input-wrapper">
                    <span class="auth-form-field__placeholder">Email</span>
                    <input type="email" class="auth-form-field__input" name="email">
                </div>
                <span class="auth-form-field__error"></span>
            </div>
            <div class="auth-form-field">
                <div class="auth-form-field__input-wrapper">
                    <span class="auth-form-field__placeholder">Номер телефона</span>
                    <input type="tel" class="auth-form-field__input" name="phone">
                </div>
                <span class="auth-form-field__error"></span>
            </div>
            <div class="auth-form-field">
                <div class="auth-form-field__input-wrapper">
                    <span class="auth-form-field__placeholder">Название компании</span>
                    <input type="text" class="auth-form-field__input" name="company">
                </div>
                <span class="auth-form-field__error"></span>
            </div>
            <div class="auth-form-field">
                <div class="auth-form-field__input-wrapper">
                    <span class="auth-form-field__placeholder">Пароль</span>
                    <input type="password" class="auth-form-field__input" name="password">
                </div>
                <span class="auth-form-field__error"></span>
            </div>
            <div class="auth-form-field">
                <input type="submit" class="auth-form-field__input auth-form-field__submit fw700" name="reg-company" value="Зарегистрироваться">
                <span class="auth-form-field__global-error"></span>
            </div>`

            changeSubmitBtn()
            animPlaceholders()
            break
        }
    }
}
function doActiveNavLink(links, el) {
    links.forEach(link => {
        link.classList.remove('auth-form__link_active')
    })
    el.classList.add('auth-form__link_active')
}
formComponent('auth')
navLinks[0].addEventListener('click', () => { formComponent('auth') })
navLinks[1].addEventListener('click', () => { formComponent('reg') })
regNavLinks[0].addEventListener('click', () => { formRegComponent('regDriver') })
regNavLinks[1].addEventListener('click', () => { formRegComponent('regCompany') })

// Анимация placeholder
function animPlaceholders() {
    const authFromFields = document.querySelectorAll('.auth-form-field')

    authFromFields.forEach(field => {
        const input = field.querySelector('.auth-form-field__input')

        input.addEventListener('focus', () => {
            field.classList.add('auth-form-field_active')
        })
        input.addEventListener('blur', () => {
            if (!input.value) field.classList.remove('auth-form-field_active')
        })
    })
}
// Замена кнопки нажатия
function changeSubmitBtn() {
    const submit = document.querySelector('.auth-form-field__submit')
    submit.addEventListener('click', e => {
        e.preventDefault()
        const inputs = document.querySelectorAll('.auth-form-field__input')
        let data = []
        inputs.forEach(input => {
            data.push(input.value)
        })
        auth(data, submit.getAttribute('name'))
    })
}
// Отправка данных на валидацию
async function auth(data, form) {
    fetch('../auth-server.php', {
        method: "POST",
        body: JSON.stringify({
            data: data,
            form: form
        }),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    })
        .then(response => response.json())
        .then(data => {
            const errorsEls = document.querySelectorAll('.auth-form-field__error')
            if (data.have_validation_errors) {
                for (let i = 0; i < errorsEls.length; i++) errorsEls[i].innerHTML = data.validation_errors[i]
            }
            else {
                errorsEls.forEach(errorEl => errorEl.innerHTML = '')
                if (data.status) {
                    location.href = '/'
                }
                else {
                    const globalErrorEl = document.querySelector('.auth-form-field__global-error')
                    globalErrorEl.innerHTML = data.message
                }
            }
        })
}