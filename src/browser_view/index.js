import * as photos from '../node/photos/**.png'

const makeImg = (base64, user = '') => {
    const container = document.createElement('div')
    container.classList.add('img')

    const img = document.createElement('img')
    img.src = base64
    img.dataset.user = user

    container.append(img)

    return container
}

for (const key in photos) {
    const url = photos[key]
    const rgx = /(.*)\s\(\d+\)/
    if (!key.match(rgx)) continue

    const user = key.match(rgx)[1]
    const img = makeImg(escape(url), user)

    img.addEventListener('click', () => alert('@' + user))

    document.body.append(img)
}
