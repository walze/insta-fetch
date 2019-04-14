import Queue from 'promise-queue'

const maxConcurrent = Number(prompt('Concurrent')) || 2
const maxQueue = Infinity
export const queue = new Queue(maxConcurrent, maxQueue)