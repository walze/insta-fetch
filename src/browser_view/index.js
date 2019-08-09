import '@babel/polyfill'
import LazyLoad from 'vanilla-lazyload'

import { shuffle, resolution2Ratio } from './../helpers'


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

        const [rx, ry] = resolution2Ratio(width, height)

        img.classList.add('lazy')
        img.dataset.src = path
        img.dataset.width = 320
        img.dataset.height = (ry * 320) / rx
        img.width = 320
        img.height = (ry * 320) / rx

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