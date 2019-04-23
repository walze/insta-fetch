import { downloadJson } from '../helpers'
import { ADDED_LINKS, emitter, LISTENING_LINKS } from '../events'

export const getLinks = () => [...document.body.querySelectorAll('[href]')]
    .map(a => a.href)
    .filter(link => /https:\/\/www\.instagram\.com\/p\//.test(link))


export const saveLinks = files => e => {
    const evtobj = window.event ? event : e
    if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
        files.map((file, i) => downloadJson(file, `links_${i}`))
    }
}

export const links = getLinks()

export const listenLinks = () => {
    document.body.addEventListener('DOMSubtreeModified', () => {

        let anyAdded = false
        let count = 0

        const newLinks = getLinks()
            .filter(link => !links.includes(link))
            .map(link => {
                count++
                anyAdded = true

                return link
            })

        if (newLinks.length < 1) return

        links.push(...newLinks)
        emitter.emit(ADDED_LINKS, newLinks, links)

        if (anyAdded)
            console.log(`added ${count} links, total:`, links.length)
    })
}

// document.body.innerHTML = ''
const wrapper = document.createElement('div')
document.body.append(wrapper)

emitter.on(LISTENING_LINKS, () => {
    emitter.emit(ADDED_LINKS, links, links)
    listenLinks()
})

/** 
 * @param { HTMLMetaElement[] } arr
 */
export const getMetaData = arr => {
    const metaData = arr.map(meta => {
        const { content } = meta
        const name = meta.getAttribute('property')

        return { name, content }
    })
        .filter(a => a.name && a.name.match(/og:.+/))
        .map(meta => {
            /** @type { 'title' | 'image' | 'description' | 'url' | 'type' } */
            let name = meta.name.replace('og:', '')

            return { [name]: meta.content }
        })
        .filter(a => !!a)
        .reduce((a, b) => {
            for (const key in b) if (b.hasOwnProperty(key)) {
                const element = b[key]

                return {
                    ...a,
                    [key]: element
                }
            }
        })

    metaData.user = metaData.description.match(/@([^\s)]+)/)[1]
    metaData.id = metaData.url.split(/\/(.+?)\//)[3]

    return metaData
}


export const makeIFrame = src => {
    const el = document.createElement('iframe')
    el.src = src
    el.style.display = 'none'

    /**@type { Promise<HTMLIFrameElement> } */
    const load = new Promise(rs => el.onload = () => rs(el))
    const add = () => {
        wrapper.append(el)
        return load
    }

    return { el, add, remove: () => el.remove() }
}

export const getIFrameData = async iframe => {
    const el = await iframe.add()

    const data = getMetaData([...el.contentWindow.document.querySelectorAll('meta')])
    console.info(`Got image from @${data.user}`)

    iframe.remove()

    return data
}


export const getLinkData = async html => {
    const div = document.createElement('div')
    div.innerHTML = html

    const data = getMetaData([...div.querySelectorAll('meta')])
    console.info(`Got image from @${data.user}`)

    return data
}