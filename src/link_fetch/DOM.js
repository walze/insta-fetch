// article .FyNDV
// photo .v1Nh3.kIKUG a

const downloadJson = (exportObj, exportName) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj))
    const downloadAnchorNode = document.createElement('a')

    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", exportName + ".json")

    document.body.appendChild(downloadAnchorNode)

    downloadAnchorNode.click()
    downloadAnchorNode.remove()
}

const getLinks = () => Array
    .from(document.querySelectorAll('.v1Nh3.kIKUG a'))
    .map(a => a.href)

const art = document.querySelector('.FyNDV')
const links = [...getLinks()]

art.addEventListener('DOMSubtreeModified', () => {
    getLinks().map(link => {
        if (!links.includes(link)) { links.push(link) }
    })
})