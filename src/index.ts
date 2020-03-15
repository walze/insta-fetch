import { pipe } from 'ramda'
import axios from 'axios'

import { of } from 'rxjs'
import { flatMap, map, tap } from 'rxjs/operators'

// eslint-disable-next-line no-unused-vars
import { Request as InstagramRequest } from './Request'

export interface RequestVariables {
  id: string;
  first: number;
  after: string;
}

const first: RequestVariables = {
  id: '890269556',
  first: 42,
  after: 'QVFEZTd4aGtWMVJhb2k3SWZPaEVrblRVWmZRclBoSUpjS2RfUlcycFhRZDlFSV9tNENxZnFwM3dnUEhxdDRaSmZldmxuVTNoaWhfbFZZOFZPR1JTdHRKcQ=='
}

const qhash = '8c86fed24fa03a8a2eea2a70a80c7b6b'
const makeURL = (v: string) => `https://www.instagram.com/graphql/query/?query_hash=${qhash}&variables=${encodeURIComponent(v)}`

const API = pipe(
  (x: RequestVariables) => JSON.stringify(x),
  makeURL
)

of(API(first))
  .pipe(
    tap(console.warn),
    flatMap((x: string) => axios.get<InstagramRequest>(x)),
    map(x => x.data.data.user.edge_saved_media)
  )
  .subscribe(console.log)
