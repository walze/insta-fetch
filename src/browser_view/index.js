import '@babel/polyfill'
import LazyLoad from 'vanilla-lazyload'

import { mapFindObj, shuffle, resolution2Ratio, sortAsc, sortDesc } from './../helpers'
import * as photos from '../node/photos/**.png'
import photosData from '../links_data.json'


console.log(photosData)
console.log('Photos', photos)


const $main = document.querySelector('.imgs')
const $shuffle = document.querySelector('.shuffle')
const $select = document.querySelector('.select')


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

const renderImgs = imgs => {
    $main.innerHTML = ''

    imgs.map(i => $main.append(i))
}


const imgs = photosData.map(data => {
    const { user, width, height, filename } = data

    const [url] = mapFindObj(photos, (_, key) => key === filename)
    if (!url) return

    const img = makeImg(escape(url), user, { width, height })

    img.addEventListener('click', () => {
        const url = p => `https://instagram.com/${p}`
        if (confirm(`@${user}, open profile?`))
            window.open(url(user))
    })

    return img
})
console.log(imgs)


renderImgs(shuffle(imgs))


$shuffle.addEventListener('click', () => {
    renderImgs(shuffle(imgs))
    $select.value = null
})
$select.addEventListener('change', e => {
    const { value: order } = e.target

    if (order === 'asc') renderImgs(imgs)
    else if (order === 'desc') renderImgs([...imgs].reverse())
    else if (order === 'name-asc') renderImgs([...imgs].sort((a, b) => sortAsc(a.dataset.user, b.dataset.user)))
    else if (order === 'name-desc') renderImgs([...imgs].sort((a, b) => sortDesc(a.dataset.user, b.dataset.user)))
})


const ll = new LazyLoad({
    elements_selector: 'img',
})

console.log(ll)
