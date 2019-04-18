import '@babel/polyfill'
import LazyLoad from 'vanilla-lazyload'

import * as photos from '../node/photos/**.png'
import { mapObj, shuffle, resolution2Ratio } from './../helpers'

console.log('Photos', photos)

const $main = document.body

const makeImg = (base64, user = '', { width, height }) => {
    const img = new Image()
    img.classList.add('lazy')

    const [Rx, Ry] = resolution2Ratio(width, height)

    const photoX = (window.innerWidth / 5)

    const x = photoX < 320 ? 320 : photoX
    const y = (Ry * x) / Rx

    img.style.width = `${x}px`
    img.style.height = `${y}px`
    img.style.margin = 0
    img.style.marginBottom = '1rem'

    img.dataset.src = base64
    img.dataset.user = user
    img.alt = user


    return img
}


shuffle(mapObj(photos, (url, key) => {
    const rgx = /(.*)__\(\d+\)__(\d+)x(\d+)/i
    const match = key.match(rgx)
    if (!match) return

    const [, user, width, height] = match
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
