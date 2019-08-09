
const { default: axios } = require('axios')
const fs = require('fs')
const { promisify } = require('util')
const sizeOf = require('image-size')
const Queue = require('promise-queue')


const writeFile = promisify(fs.writeFile)
// const rename = promisify(fs.rename)

const queue = new Queue(3, Infinity)
// const wait = t => new Promise(rs => setTimeout(rs, t))

/** @type { Array<{url: string, link: string}> } */
const links = require('../links.json')
const dir = `${__dirname}/photos/`


if (!fs.existsSync(dir))
    fs.mkdirSync(dir)


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


    const metadata = {
        user,
        filename,
        width,
        height,
    }

    return [metadata, file1]
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
    .map(async (dataPromise, i) => {
        const obj = await dataPromise
        const { id, user, photo } = obj

        const [metadata, filename] = await writePhoto(id, user, photo)
            .catch(() => null)

        console.log(`wrote file ${filename} || ${Math.ceil(i / links.length * 100)}%`)

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

