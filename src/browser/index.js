import Queue from 'promise-queue'

import { getLinkData, saveLinks } from './DOM'
import { ADDED_LINKS, LISTENING_LINKS, emitter } from '../events'

const maxConcurrent = 1
const maxQueue = Infinity
const queue = new Queue(maxConcurrent, maxQueue)


const fetchLinkData = link => fetch(link)
    .then(r => r.text())
    .then(getLinkData)


const add2Queue = p => {
    const q = queue.add(() => p)
    const pending = queue.getPendingLength()
    const length = queue.getQueueLength()

    console.log('Queue Pending', pending)
    console.log('Queue Length', length)

    return q
}

/**
 * @param { string[] } addedLinks 
 */
const queueLinks = photos => async (addedLinks) => {
    console.log('found new links', addedLinks)

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

console.log('photos ref', photos)

console.log('\nCTRL + Z to download')
document.onkeydown = saveLinks(photos)
