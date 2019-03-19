const photos = import('./filteredHar.json')

const makeImg = base64 => {
    const container = document.createElement('div')
    container.classList.add('img')

    const img = document.createElement('img')
    img.src = `data:image/jpeg;base64,${base64}`

    container.append(img)

    return container
}

photos.then(photo => {
    photo.map(base64 => {
        const img = makeImg(base64)

        document.body.append(img)
    })
})