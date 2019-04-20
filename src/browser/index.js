
import { getLinkData, saveLinks, getIFrameData, makeIFrame } from './DOM'
import { ADDED_LINKS, LISTENING_LINKS, emitter } from '../events'
import { queue } from './queue'


export const fetchIFrameData = link => () => getIFrameData(makeIFrame(link))
export const fetchLinkData = link => () => fetch(link)
    .then(r => r.text())
    .then(getLinkData)


const add2Queue = pg => {
    const q = queue.add(pg)

    return q
}

/**
 * @param { string[] } addedLinks 
 */
const queueLinks = photos => async (addedLinks) => {
    const pushPhotos = async photoPromise => {
        photos.push(await photoPromise)
        return photoPromise
    }

    return addedLinks
        .map(fetchLinkData)
        .map(add2Queue)
        .map(pushPhotos)
}


const photos = []
emitter.on(ADDED_LINKS, queueLinks(photos))
emitter.emit(LISTENING_LINKS)

console.log(queue)

console.log('\nCTRL + Z to download')
document.onkeydown = saveLinks([photos])
