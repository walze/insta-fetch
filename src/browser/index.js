/** @type {<T>(arr: T[], len: number) => T[][]} */
const chunkArr = (arr, len) => {
    const chunks = []
    const n = arr.length

    let i = 0
    while (i < n) chunks.push(arr.slice(i, i += len))

    return chunks
}

const getMetaData = arr => arr
    .map(meta => {
        const { content } = meta
        const name = meta.getAttribute('property')

        return { name, content }
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


document.body.innerHTML = ''
const wrapper = document.createElement('div')
document.body.append(wrapper)

const makeIFrame = src => {
    const el = document.createElement('iframe')
    el.src = src

    /**@type { Promise<HTMLIFrameElement> } */
    const load = new Promise(rs => el.onload = () => rs(el))
    const add = () => {
        wrapper.append(el)
        return load
    }

    return { el, add, remove: () => el.remove() }
}

const getIFrameData = async iframe => {
    const el = await iframe.add()

    const [photo, user] = getMetaData([...el.contentWindow.document.querySelectorAll('meta')])
    console.info(`Got photo from @${user}`)

    const obj = { user, photo }
    iframe.remove()

    return obj
}

const getDataFromLinks = async arr => {
    const datas = arr.map(link => makeIFrame(link))
    const iframes = await Promise.all(datas)

    return iframes.map(getIFrameData)
}

const getLinkData = async html => {
    const div = document.createElement('div')
    div.innerHTML = html

    const [photo, user] = getMetaData([...div.querySelectorAll('meta')])
    console.info(`Got photo from @${user}`)

    const obj = { user, photo }

    return obj
}

/**
 * @param {string[]} arr 
 */
const fetchDataLinks = async arr => {
    const htmlPromises = arr.map(link => fetch(link).then(r => r.text()))
    const htmls = await Promise.all(htmlPromises)

    return htmls.map(getLinkData)
}

const generator = (links, chunkSize) => {
    const chunks = chunkArr(links, chunkSize)

    const run = async (index = 0) => {
        console.log('Running...', index)

        if (index >= chunks.length) {
            console.warn('End')
            return null
        }

        const objs = await fetchDataLinks(chunks[index])
        const data = await Promise.all(objs)

        const nextData = await run(++index)

        return nextData ? [...data, ...nextData] : data
    }

    return run
}

const run = generator(links, 3)()
