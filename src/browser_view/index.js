import * as photos from './photos/**.png'

const makeImg = base64 => {
    const container = document.createElement('div')
    container.classList.add('img')

    const img = document.createElement('img')
    img.src = base64

    container.append(img)

    document.body.append(container)
}

for (const key in photos) {
    if (photos.hasOwnProperty(key)) {
        const url = photos[key]
        makeImg(escape(url))
    }
}