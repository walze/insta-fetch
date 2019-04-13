
const { default: axios } = require('axios')
const fs = require('fs')
const { promisify } = require('util')
const path = require('path')

const readdir = promisify(fs.readdir)
const writeFile = promisify(fs.writeFile)

/** @type {string[]} */
const links = require('../links.json')
const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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


const getPhoto = async (photo, i) => {
    try {
        const rs = await axios.get(photo, { responseType: 'arraybuffer', timeout: 20000 })
        console.log(`Got photo #${i}`)

        return Buffer.from(rs.data, 'binary').toString('base64')
    }
    catch (err) {
        throw new Error(`Error parsing base64 ${photo}, ${err}`)
    }
}

const map = async (links) => {
    const promises = []

    for (var i = 0; i < links.length; i++) {
        // await wait(1000/30)
        const { photo: url, user } = links[i]
        const photo = await getPhoto(url, i)
        if (!photo) throw new Error('no photo')

        promises.push({ photo, user })
    }

    return Promise.all(promises)
}



map(links)
    .then(async files => {
        console.log(`Starting to write ${files.length} files`)

        for (let i = 0; i < files.length; i++) {
            const { user, photo } = files[i]

            const func = async () => {
                const photos = await readdir(`${__dirname}/photos/`)
                const rgx = new RegExp(escapeRegExp(user))
                const count = photos.filter(a => rgx.test(a)).length
                const filename = `${user} (${count})`
                const filePath = __dirname + `/photos/${filename}.png`

                return writeFile(
                    filePath,
                    photo,
                    { encoding: 'base64' }
                )
                    .then(() => filename)
            }

            await func()
                .then(f => console.log(`wrote file ${f}`))
                .catch(console.error)
        }


    })

