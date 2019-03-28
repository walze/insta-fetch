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



const wrapper = document.createElement('div')
document.body.append(wrapper)

const makeIFrame = src => {
    const el = document.createElement('iframe')
    el.src = src

    /**@type { Promise<HTMLIFrameElement> } */
    const load = new Promise(rs => el.addEventListener('load', () => rs(el)))
    const add = () => {
        wrapper.append(el)
        return load
    }

    return { el, add, remove: () => el.remove() }
}

const generator = (links, chunkSize) => {
    const chunks = chunkArr(links, chunkSize)

    const run = async (index = 0) => {
        console.log('Running...', index)

        if (index >= chunks.length) {
            console.warn('End')
            return null
        }

        const datas = chunks[index].map(link => makeIFrame(link))
        const iframes = await Promise.all(datas)

        const objs = iframes.map(async iframe => {
            const el = await iframe.add()

            const [photo, user] = getMetaData([...el.contentWindow.document.querySelectorAll('meta')])
            console.info(`Got photo from @${user}`)

            const obj = { user, photo }
            iframe.remove()

            return obj
        })

        const data = await Promise.all(objs)
        const nextData = await run(++index)

        return nextData ? [...data, ...nextData] : data
    }

    return run
}

const run = generator(links, 2)()
