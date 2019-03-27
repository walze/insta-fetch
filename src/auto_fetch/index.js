// img
// '.eLAPa.kPFhm .KL4Bh img'

// name
// '.FPmhX.notranslate.nJAzx'


const selector = {
    title: '.FPmhX.notranslate.nJAzx',
    img: 'article:first-child',
    next: '.HBoOv.coreSpriteRightPaginationArrow'
}

const $ = q => {
    const el = document.querySelector(q)
    if (!el) throw new Error('Element not found ' + q)

    return el
}

const filterJSON = json => {
    if (!json || !json.data || !json.data.shortcode_media) return null

    const { shortcode_media: data } = json.data
    const src = data.display_url
    const title = data.owner.username

    return { title, src }
}

const makeData = (data, nextSelector) => {
    if (!data) return

    const { title, src } = data
    const next = () => $(nextSelector).click()

    return { title, src, next }
}

/** @type { Array<{id: number, user: string, src: string}> } */
const data = []

const pipe = (a, ...b) => i => (a ? pipe(...b)(a(i)) : i)

const pushInto = arr => item => {
    if (item)
        arr.push(item)

    return item
}

const next = data => {
    if (data) data.next()

    return data
}

const checkIfSrcIncluded = stack => needle => {
    const has = stack.some(item => item.src === needle.src)

    return has
        ? false
        : needle
}

const step = json => pipe(
    () => json,
    checkIfSrcIncluded(data),
    pushInto(data),
)

let oldXHROpen = window.XMLHttpRequest.prototype.open
window.XMLHttpRequest.prototype.open = function () {
    console.log(this)
    this.addEventListener('load', function () {
        const json = makeData(
            filterJSON(JSON.parse(this.responseText)),
            selector.next
        )

        if (!json) return

        const fetchedData = step(json)()

        if (fetchedData) {
            console.log(fetchedData, data.length)
            setTimeout(fetchedData.next, 501 + (Math.random() * (500 + 1)))
        } else {
            console.warn('done?')
        }
    })

    return oldXHROpen.apply(this, arguments)
}
