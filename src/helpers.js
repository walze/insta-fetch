/** @type {<T>(arr: T[], len: number) => T[][]} */
export const chunkArr = (arr, len) => {
    const chunks = []
    const n = arr.length

    let i = 0
    while (i < n) chunks.push(arr.slice(i, i += len))

    return chunks
}

export const downloadJson = (exportObj, exportName) => {
    const dataStr = 'data:text/jsoncharset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj))
    const downloadAnchorNode = document.createElement('a')

    downloadAnchorNode.setAttribute('href', dataStr)
    downloadAnchorNode.setAttribute('download', exportName + '.json')

    document.body.appendChild(downloadAnchorNode)

    downloadAnchorNode.click()
    downloadAnchorNode.remove()
}

/**
 * @template T, S
 * @param { T } obj
 * @param { (item: keyof T, property: string) => S } cb
 * @returns { S[] }
 */
export function mapObj(obj, cb) {
    const arr = []

    for (const key in obj) if (obj.hasOwnProperty(key)) {
        const item = obj[key]

        arr.push(cb(item, key))
    }

    return arr
}

/**
 * @template T
 * @param { T } obj
 * @param { (item: keyof T, property: string) => boolean } cb
 * @returns { [keyof T, string] }
 */
export function mapFindObj(obj, cb) {
    for (const key in obj) if (obj.hasOwnProperty(key)) {
        const item = obj[key]

        const bool = cb(item, key)

        if (bool) return [item, key]
    }

    return null
}

/**
 * Randomly shuffle an array
 * https://stackoverflow.com/a/2450976/1293256
 * @param  {Array} array The array to shuffle
 * @return { Array }      The first item in the shuffled array
 */
export var shuffle = function (arr) {
    const array = [...arr]

    var currentIndex = array.length
    var temporaryValue, randomIndex

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1

        // And swap it with the current element.
        temporaryValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = temporaryValue
    }

    return array

}

/**
 * @param { number } w 
 * @param { number } h 
 * @returns { number[] } [width, height, total]
 */
export const resolution2Ratio = (w, h) => {
    const gcd = (w, h) => (h == 0) ? w : gcd(h, w % h)
    const r = gcd(w, h)

    return [w / r, h / r, r]
}

export const sortAsc = (a, b) => {
    if (a > b) {
        return 1
    }
    if (a < b) {
        return -1
    }
    return 0
}

export const sortDesc = (a, b) => {
    if (a < b) {
        return 1
    }
    if (a > b) {
        return -1
    }
    return 0
}
