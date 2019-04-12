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