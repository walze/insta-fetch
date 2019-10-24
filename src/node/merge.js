const { filter, map } = require('ramda')

const { promisify } = require('util')
const fs = require('fs')

const writeFile = promisify(fs.writeFile)
const readdir = promisify(fs.readdir)

const dir = `${__dirname}/photos/`
const dir_docs = `${__dirname}/../../docs/`

const out = `${__dirname}/filtered_photos/`
if (!fs.existsSync(out))
    fs.mkdirSync(out)

const filterPhotoExtension = filter(photo => photo.match(/\.(png|jpg|jpeg)$/g))
const readPhotos = path => readdir(path)
    .then(filterPhotoExtension)
    .then(map(s => [path + s, s]))

const get = async () => {
    const docs = await readPhotos(dir_docs)
    const photos = await readPhotos(dir)

    const merged = [...docs, ...photos]
    const filtered = new Map

    map(
        ([p, x]) => { filtered.set(x.split('.')[0], p) },
        merged
    )

    filtered.forEach((v, k) => {
        fs.copyFileSync(v, out + k + '.png')
    })
}



get()