import '@babel/polyfill'
import LazyLoad from 'vanilla-lazyload'

import * as photos from '../node/photos/**.png'
import { mapObj, shuffle } from './../helpers'


const $main = document.body

const makeImg = (base64, user = '', size) => {
    const container = document.createElement('div')
    container.classList.add('img')

    const img = new Image(
        size.width / 4,
        size.height / 4
    )

    img.dataset.src = base64
    img.dataset.user = user
    img.alt = user

    img.classList.add('lazy')
    container.append(img)

    return img
}


shuffle(mapObj(photos, (url, key) => {
    const rgx = /(.*)__\(\d+\)__(\d+)x(\d+)/i
    if (!key.match(rgx)) return

    const [, user, width, height] = key.match(rgx)
    const img = makeImg(escape(url), user, { width, height })

    img.addEventListener('click', () => {
        const url = p => `https://instagram.com/${p}`
        if (confirm(`@${user}, open profile?`))
            window.open(url(user))
    })

    return img
})).map(img => $main.append(img))


const ll = new LazyLoad({
    elements_selector: 'img',
})

console.log(ll)
