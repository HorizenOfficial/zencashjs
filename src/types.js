// @flow

export type TXOBJ = {
  locktime: number,
  version: number,
  ins: {
    output: { hash: string, vout: number },
    script: string,
    sequence: string,
    prevScriptPubKey: string,
  }[],
  outs: { script: string, satoshis: number }[],
}

// HISTORY Structure
export type HISTORY = {
  txid: string,
  vout: number,
  scriptPubKey: string,
}

// RECIPIENTS Structure
export type RECIPIENTS = {
  satoshis: number,
  address: string,
  data: string
}
