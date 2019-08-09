const { promisify } = require('util')
const sizeOf = require('image-size')
const fs = require('fs')

const writeFile = promisify(fs.writeFile)
const readdir = promisify(fs.readdir)

const dir = `${__dirname}/photos/`
const dir_filter = `${__dirname}/photos_filter/`

if (!fs.existsSync(dir))
    fs.mkdirSync(dir)

if (!fs.existsSync(dir_filter))
    fs.mkdirSync(dir_filter)


const getSize = path => sizeOf(path)


readdir(dir, function (err, _fs) {
    /** @type { string[] } */
    const files = _fs

    const fss = files
        .map(f => ({ dir: dir + f, name: f, key: f.split('.')[0] }))
        .filter(({ dir }) => dir.match(/\.(png|jpe?g)$/))
        .reduce((acc, curr) => {
            const exists = acc.some(({ key }) => key === curr.key)
            if (!exists) acc.push(curr)

            return acc
        }, [])
        .map(obj => ({ ...getSize(obj.dir), ...obj }))
        .map(obj => {
            fs.copyFile(obj.dir, `${dir_filter}${obj.name}`, err => err && console.log(err))

            return obj
        })



    writeFile(
        __dirname + '/../sizes.json',
        JSON.stringify(fss)
    )
})