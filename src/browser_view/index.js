import '@babel/polyfill'
import LazyLoad from 'vanilla-lazyload'

import * as photos from '../node/photos/**.png'

/** @type { {id: number, user: string, width: number, height: number}[] } */
import photosData from '../links_data.json'

console.log(photosData)

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
    const [filename] = key.split('.')
    const found = photosData.find(data => data.filename === filename)
    if (!found) return

    const { user, width, height } = found

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
