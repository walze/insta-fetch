
const { default: axios } = require('axios')
const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const sizeOf = require('image-size')
const Queue = require('promise-queue')
const queue = new Queue(3, Infinity)

const readdir = promisify(fs.readdir)
const writeFile = promisify(fs.writeFile)
// const rename = promisify(fs.rename)

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
        throw new Error(`Error parsing base64 ${photo}, ${err}`)
    }
}

/**
 * @param { Array<{url: string, link: string}> } links
 */
const generatePromises = (links) => links.map((link, i) => async () => {
    const { photo: url, user } = link
    const photo = await getPhoto(url, i)

    return { user, photo }
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

    // const file2 = `${filePath}/${filename}__${width}x${height}.${ext}`
    // await rename(file1, file2)

    console.log(`wrote file ${file1}`)

    return {
        id,
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

Promise.all(generatePromises(links)
    .map(add2Queue)
    .map(async (dataPromise, i) => {
        const { user, photo } = await dataPromise

        return writePhoto(i, user, photo)
            .catch(e => {
                throw new Error(e)
            })
    }))
    .then(data => writeFile('../links_data.json', JSON.stringify(data)))

