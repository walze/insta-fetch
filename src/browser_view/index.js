import '@babel/polyfill'
import LazyLoad from 'vanilla-lazyload'

import { mapFindObj, shuffle, resolution2Ratio, sortAsc, toggleHide } from './../helpers'
import * as photos from '../node/photos/**.png'
import imgsData from '../photos_metadata.json'

const $main = document.querySelector('.imgs')
const $shuffle = document.querySelector('.shuffle')
const $select = document.querySelector('.select')
const $options = document.querySelector('.btn.options')
const $save = document.querySelector('.btn.save')
const $optionsForm = document.querySelector('.form.options')
let orderState

const options = {
    get photosPerRow() {
        const mobile = $optionsForm.querySelector('input[name=photos_row_mobile]').value
        const desktop = $optionsForm.querySelector('input[name=photos_row_desktop]').value

        return {
            mobile: Number(mobile),
            desktop: Number(desktop),
        }
    }
}

const updateImgStyles = (width, height, img) => {
    const [Rx, Ry] = resolution2Ratio(width, height)

    const photoX = (window.innerWidth / options.photosPerRow.desktop)

    const x = photoX < 320 ? (320 / options.photosPerRow.mobile) : photoX
    const y = (Ry * x) / Rx

    img.style.width = `${x}px`
    img.style.height = `${y}px`
    img.style.margin = 0
    img.style.marginBottom = '1rem'
}

const makeImg = (base64, imgData) => {
    const { id, width, height, user, index, url } = imgData

    const img = new Image()
    img.classList.add('lazy')

    updateImgStyles(width, height, img)

    img.dataset.id = id
    img.dataset.url = url
    img.dataset.index = index
    img.dataset.width = width
    img.dataset.height = height
    img.dataset.src = base64
    img.dataset.user = user
    img.alt = user

    return img
}

const renderImgs = (imgs, order) => {
    $main.innerHTML = ''

    let orderedImgs = imgs

    if (order === 'asc')
        orderedImgs = [...imgs].sort((a, b) => sortAsc(Number(a.dataset.index), Number(b.dataset.index)))
    else if (order === 'desc')
        orderedImgs = [...imgs].sort((a, b) => sortAsc(Number(a.dataset.index), Number(b.dataset.index))).reverse()
    else if (order === 'name-asc')
        orderedImgs = [...imgs].sort((a, b) => sortAsc(a.dataset.user, b.dataset.user))
    else if (order === 'name-desc')
        orderedImgs = [...imgs].sort((a, b) => sortAsc(a.dataset.user, b.dataset.user)).reverse()

    const updatedImgs = orderedImgs
        .map(img => {
            const { dataset } = img
            const { width, height } = dataset

            updateImgStyles(width, height, img)

            return img
        })

    $main.append(...updatedImgs)
}


/** @type {HTMLImageElement[]} */
const imgs = imgsData
    .map(imgData => {
        if (!imgData) return

        const { user, filename } = imgData

        const [url] = mapFindObj(photos, (_, key) => key === filename)
        if (!url) return

        const img = makeImg(escape(url), imgData)

        img.addEventListener('click', () => {
            const url = p => `https://instagram.com/${p}`
            if (confirm(`@${user}, open profile?`))
                window.open(url(user))
        })

        return img
    })
    .filter(a => !!a)


// first render
renderImgs(shuffle(imgs), orderState)



// event listeners
$shuffle.addEventListener('click', () => {
    renderImgs(shuffle(imgs))
    $select.value = null
})
$select.addEventListener('change', e => {
    const { value: order } = e.target
    orderState = order

    renderImgs(imgs, order)
})
$options.addEventListener('click', () => {
    const hadClass = toggleHide($optionsForm)

    if (!hadClass) {
        renderImgs(imgs, orderState)
    }
})
$save.addEventListener('click', () => $options.click())

const ll = new LazyLoad({ elements_selector: 'img' })



// logs
console.log(ll)
console.log(imgs)
console.log(imgsData)
console.log('Photos', photos)



