
const { default: axios } = require('axios')
const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const sizeOf = require('image-size')
const Queue = require('promise-queue')


const readdir = promisify(fs.readdir)
const writeFile = promisify(fs.writeFile)
// const rename = promisify(fs.rename)

const queue = new Queue(3, Infinity)
// const wait = t => new Promise(rs => setTimeout(rs, t))

/** @type { Array<{url: string, link: string}> } */
const links = require('../links.json')
const dir = `${__dirname}/photos/`


if (!fs.existsSync(dir))
    fs.mkdirSync(dir)

readdir(dir).then(files => {
    for (const file of files) {
        fs.unlink(path.join(dir, file), err => {
            if (err) throw err
        })
    }
})


const getSize = path => sizeOf(path)

const getPhoto = async photo => {
    try {
        const rs = await axios.get(photo, { responseType: 'arraybuffer', timeout: 20000 })
        return Buffer.from(rs.data, 'binary').toString('base64')
    }
    catch (err) {
        const str = `Error parsing base64 ${photo}, ${err}`

        console.warn(str)
    }
}

/**
 * @param { Array<{}> } links
 */
const generatePromises = (links) => links.map((link, i) => async () => {
    const { image: url, user } = link
    const photo = await getPhoto(url, i)

    return { ...link, user, photo, index: i }
})

const writePhoto = async (id, user, photo) => {
    const filePath = `${__dirname}/photos`
    const filename = id
    const ext = 'png'
    const file1 = `${filePath}/${filename}.${ext}`

    await writeFile(
        file1,
        photo,
        { encoding: 'base64' }
    )

    const size = await getSize(file1)
    const { width, height } = size

    console.log(`wrote file ${file1}`)

    return {
        user,
        filename,
        width,
        height,
    }
}

/**
 * Type casting
 * @template T
 * @param { () => T } p
 * @returns { T }
 */
const add2Queue = p => queue.add(p)

const metadatas = generatePromises(links)
    .map(add2Queue)
    .map(async (dataPromise) => {
        const obj = await dataPromise
        const { id, user, photo } = obj

        const metadata = await writePhoto(id, user, photo)
            .catch(() => null)

        delete obj.photo

        return { ...obj, ...metadata }
    })


Promise
    .all(metadatas)
    .then(data => {
        const filtered = data.filter(a => !!a)

        writeFile(
            __dirname + '/../photos_metadata.json',
            JSON.stringify(filtered)
        )
    })

