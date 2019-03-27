
const { default: axios } = require('axios')
const { JSDOM } = require('jsdom')
const fs = require('fs')
const { promisify } = require('util')
const path = require('path')

const readdir = promisify(fs.readdir)

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

const headers = { 'Content-Type': 'text/html', 'X-Requested-With': 'XMLHttpRequest' }

const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getMetaData = async link => {
    console.log(`Getting metadata ${link}\n`)

    const rs = await axios
        .get(link, { headers, timeout: 20000 })
        .catch(() => console.log(`Error getting ${link}`))

    if (!rs) return

    const { data: html } = rs

    console.log(`Got metadata ${link}`)

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

    const data = await getMetaData(linkURL)

    if (!data) {
        console.log(`Private profile ${linkURL} \n\n`)
        return null
    }

    const [link, name] = data

    if (!name || !link) {
        console.log(`Private profile ${linkURL} \n\n`)
        return null
    }

    /** @type { string } */
    const base64 = await axios
        .get(link, { responseType: 'arraybuffer', headers, timeout: 20000 })
        .then(rs => Buffer.from(rs.data, 'binary').toString('base64'))
        .catch((err) => console.log('Error parsing base64', err))

    if (!base64) {
        return null
    }

    // const photos = await readdir(`${__dirname}/photos/`)
    // const rgx = new RegExp(escapeRegExp(name))
    // const count = photos.filter(a => rgx.test(a)).length
    // const filename = `${name}#${count}`
    // const filePath = __dirname + `/photos/${filename}.png`

    // writeFile(
    //     filePath,
    //     base64,
    //     { encoding: 'base64' }
    // )
    //     .then(() => console.log(`Written File ${filename}\n\n`))

    return { base64, name }
}

const wait = t => new Promise(rs => setTimeout(rs, t))

async function map() {
    const promises = []

    for (var i = 0; i < links.length; i++) {
        await wait(50);
        const photo = getPhoto(links[i], i)
        promises.push(photo)
    }

    return Promise.all(promises)
}

const filesPromise = map()

// const syncCall = () => promises.reduce((prev, cur) => prev.then(cur), promises[0]())
// const asyncCall = () => promises.map(promise => promise())

// files.then(console.log)

var async = require('async')

filesPromise.then(files => {
    console.log('Starting to write files')

    const filesFiltered = files.filter(f => !!f)

    async.each(filesFiltered, function ({ name, base64 }, callback) {

        const func = async () => {
            const photos = await readdir(`${__dirname}/photos/`)
            const rgx = new RegExp(escapeRegExp(name))
            const count = photos.filter(a => rgx.test(a)).length
            const filename = `${name}#${count}`
            const filePath = __dirname + `/photos/${filename}.png`

            fs.writeFile(
                filePath,
                base64,
                { encoding: 'base64' },
                callback
            )
        }

        func()

    }, function (err) {

        if (err) {
            // One of the iterations produced an error.
            // All processing will now stop.
            console.log('A file failed to process', err)
        }
        else {
            console.log(`\nWritten Files`)
            console.log('All files have been processed successfully')
        }
    })

})
