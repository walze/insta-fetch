import '@babel/polyfill'
import LazyLoad from 'vanilla-lazyload'

import { shuffle } from './../helpers'


import _ps from '../node/photos_filter/**.png'
import _psJ from '../sizes.json'

/** @type { Ips[] } */
const psJ = _psJ

console.log(psJ)

shuffle(Object.entries(_ps))
    .map(([file, path]) => {
        const keyPhoto = file.split('.')[0]
        const img = new Image()
        const { width, height } = psJ.find(({ key }) => key === keyPhoto)

        img.dataset.src = path
        img.dataset.width = width
        img.dataset.height = height
        img.width = width
        img.height = height


        document.querySelector('.imgs').appendChild(img)
    })



new LazyLoad()

/**
 * @typedef {{
 *    "height": number,
 *    "width": number,
 *    "dir": string,
 *    "name": string,
 *    "key": string
 *  }} Ips
 */