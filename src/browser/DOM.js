const downloadJson = (exportObj, exportName) => {
    const dataStr = "data:text/jsoncharset=utf-8," + encodeURIComponent(JSON.stringify(exportObj))
    const downloadAnchorNode = document.createElement('a')

    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", exportName + ".json")

    document.body.appendChild(downloadAnchorNode)

    downloadAnchorNode.click()
    downloadAnchorNode.remove()
}


const getLinks = () => [...document.body.querySelectorAll('[href]')]
    .map(a => a.href)
    .filter(link => /https:\/\/www\.instagram\.com\/p\//.test(link))

const links = getLinks()

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

    links.push(...newLinks)

    if (anyAdded)
        console.log(`added ${count} links, total:`, links.length)
})

const save = e => {
    const evtobj = window.event ? event : e
    if (evtobj.keyCode == 90 && evtobj.ctrlKey) downloadJson(links, 'links')
}

document.onkeydown = save