
const axios = require('axios')
const { JSDOM } = require('jsdom')
const fs = require('fs')
const { promisify } = require('util')

const readdir = promisify(fs.readdir)
const writeFile = promisify(fs.writeFile)

/** @type {string[]} */
const links = require('./links.json')

const headers = {
    'Content-Type': 'text/html',
    'X-Requested-With': 'XMLHttpRequest'
};

const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getMetaData = async link => {
    const { data: html } = await axios.get(link, { headers })

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

const getPhoto = linkURL => async () => {
    const photos = await readdir(`${__dirname}/photos/`)
    const [link, name] = await getMetaData(linkURL)


    const rgx = new RegExp(escapeRegExp(name))
    const count = photos.filter(a => rgx.test(a)).length

    const base64 = await axios
        .get(link, { responseType: 'arraybuffer' })
        .then(response => Buffer.from(response.data, 'binary').toString('base64'))

    const filename = `${name}_${count}`

    writeFile(
        __dirname + `/photos/${filename}.png`,
        base64,
        { encoding: 'base64' }
    )

    return filename
}

const funcs = links.map(getPhoto)

funcs.reduce((prev, cur) => prev.then(cur), funcs[0]())