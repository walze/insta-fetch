/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */

import { pipe } from 'ramda'
import axios from 'axios'

import { of, BehaviorSubject } from 'rxjs'
import { flatMap, map, tap, toArray, scan, delay } from 'rxjs/operators'

import { Request as InstagramRequest, Edge, PageInfo } from './Request'

export interface RequestVariables {
  id: string;
  first: number;
  after: string;
}

const firstChunk = 'QVFBd2Y3QkppOHFGYWlnZy1HbGNvNVUzU1JESVdSTl9SZ3FZMmM5WUQtSEVLZjViVUg2TFEzRjV2aW1zdXBkMld1QWt1WXd2bnd6T0N4N1JmVXBrOElKQw=='

const buildVariables: (after: string) => RequestVariables = (after) => ({
  id: '890269556',
  first: 42,
  after
})

const triple = <a, b, c>(a: a, b: b, c: c) => [a, b, c] as [a, b, c]

const qhash = '8c86fed24fa03a8a2eea2a70a80c7b6b'
const makeURL = (v: string) => `https://www.instagram.com/graphql/query/?query_hash=${qhash}&variables=${encodeURIComponent(v)}`

const getEdgeData = ({ node: { is_video, shortcode, display_url } }: Edge) => ({
  is_video,
  shortcode,
  display_url
})

const API = pipe(
  buildVariables,
  (x: RequestVariables) => JSON.stringify(x),
  makeURL,
  u => of(u)
)

type Edge$ = ReturnType<typeof getEdgeData>
const edges$ = new BehaviorSubject<Edge$[]>([] as unknown as Edge$[])

edges$
  .pipe(
    scan((acc, one) => [...acc, ...one], [] as Edge$[])
  )
  .subscribe(
    console.warn
  )

const get = (chunk: string, page = 1) => API(chunk)
  .pipe(
    tap(_ => { if (edges$.closed) { throw new Error('done') } }),
    flatMap((x: string) => axios.get<InstagramRequest>(x)),
    map(x => x.data.data.user.edge_saved_media),
    map(x => triple(x.page_info, x.edges.map(getEdgeData), x.count)),
    tap(([, edges, count]) =>
      console.log(`Downloading ${count} photos, ${page * edges.length} out of ${count}... | ${((page * edges.length) / count) * 100}%`)
    ),
    delay(500)
  )
  .subscribe(([info, edges]) => {
    if (info.has_next_page) { get(info.end_cursor, page + 1) }

    edges$.next(edges)
  })

get(firstChunk)
