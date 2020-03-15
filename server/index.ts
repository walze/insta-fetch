export interface RequestVariables {
  id: string;
  first: number;
  after: string;
}

const first = {
  "id": "890269556",
  "first": 12,
  "after": "QVFEZTd4aGtWMVJhb2k3SWZPaEVrblRVWmZRclBoSUpjS2RfUlcycFhRZDlFSV9tNENxZnFwM3dnUEhxdDRaSmZldmxuVTNoaWhfbFZZOFZPR1JTdHRKcQ=="
}

const qhash = '8c86fed24fa03a8a2eea2a70a80c7b6b'
const API = (v: string) => `https://www.instagram.com/graphql/query/?query_hash=${qhash}&variables=${encodeURIComponent(v)}`

