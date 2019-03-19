
const axios = require('axios')
const { JSDOM } = require('jsdom')
const fs = require('fs')
const { promisify } = require('util')
const path = require('path')

const readdir = promisify(fs.readdir)
const writeFile = promisify(fs.writeFile)

const dir = `${__dirname}/photos/`
readdir(dir)
    .then(files => {
        for (const file of files) {
            fs.unlink(path.join(dir, file), err => {
                if (err) throw err;
            });
        }
    })

/** @type {string[]} */
const links = require('./links.json')

const headers = {
    'Content-Type': 'text/html',
    'X-Requested-With': 'XMLHttpRequest'
};

const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getMetaData = async link => {
    console.log(`Getting metadata ${link}\n`)

    const rs = await axios
        .get(link, { headers })
        .catch(() => console.log('Error getting link'))

    if (!rs) return console.log('Error getting html')

    const { data: html } = rs

    console.log(`Got metadata ${link}\n`)

    const { window } = new JSDOM(html)
    const { document } = window

    const arr = Array
        .from(document.querySelectorAll('meta'))
        .map(meta => {
            const { content } = meta

            return {
                name: meta.getAttribute('property'),
                content
            }
        })
        .filter(a => a.name && a.name.match(/og:.+/))
        .map(meta => {
            let name = meta.name.replace('og:', '')
            const match = meta.content.match(/@([^\s)]+)/)
            if (name === 'description') {
                meta.content = match[1]
            }

            if (name === 'image' || name === 'description')
                return meta.content
        })
        .filter(a => !!a)

    return arr
}

const getPhoto = async (linkURL, i) => {
    console.log(`Getting photo #${i}`)

    // const photos = await readdir(`${__dirname}/photos/`)
    const [link, name] = await getMetaData(linkURL)

    if (!name || !link) {
        console.log('Private profile\n\n')
        return null
    }

    const rgx = new RegExp(escapeRegExp(name))
    // const count = photos.filter(a => rgx.test(a)).length

    /** @type {string} */
    const base64 = await axios
        .get(link, { responseType: 'arraybuffer' })
        .then(response => Buffer.from(response.data, 'binary').toString('base64'))
        .catch(() => console.log('Error parsing base64'))


    // const filename = `${name}#${count}`
    // const filePath = __dirname + `/photos/${filename}.png`

    // writeFile(
    //     filePath,
    //     base64,
    //     { encoding: 'base64' }
    // )
    //     .then(() => console.log(`Written File ${filename}\n\n`))

    return base64
}

const files = Promise.all(links.map(getPhoto))

// const syncCall = () => promises.reduce((prev, cur) => prev.then(cur), promises[0]())
// const asyncCall = () => promises.map(promise => promise())

files.then(console.log)