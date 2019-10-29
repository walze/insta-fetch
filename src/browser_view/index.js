import _ps from '../node/filtered_photos/**.png'

import { runLazyloader } from './lazyload'

const $imgs = document.querySelector('.imgs')

const getPaths = obj => Object.entries(obj).map(([, path]) => path)

const photos = new Map
const _photos = getPaths(_ps)

_photos.map(path => photos.set(path.split('.')[0], path))

console.log(photos, _photos.length)

Object.entries(_ps)
    .map(([, path]) => {
        const img = new Image()

        img.dataset.src = path
        img.width = 160

        $imgs.appendChild(img)
    })




runLazyloader()