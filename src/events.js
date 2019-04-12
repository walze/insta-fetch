import { EventEmitter } from 'events'

export const emitter = new EventEmitter()


export const {
    ADDED_LINKS = 'added_links',
    LISTENING_LINKS = 'listening_links'
} = {}