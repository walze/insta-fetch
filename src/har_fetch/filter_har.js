const fs = require('fs')

const har = JSON.parse(fs.readFileSync(__dirname + '/../data.har', 'utf8'))

const data = har.log.entries
    .map(entry => entry.response.content)
    .filter(content => content.mimeType === "image/jpeg")
    .map(imgObj => imgObj.text)


fs.writeFileSync(__dirname + '/../har_photos_base64.json', JSON.stringify(data))

data.map((base64, i) => {
    fs.writeFileSync(__dirname + `/photos/photo_${i}.png`, base64, { encoding: 'base64' })
})
