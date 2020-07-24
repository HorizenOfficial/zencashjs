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
  vsc_ccout: { epoch_length: number,
    address: string,
    amount: number,
    wCertVk: string,
    customData: string,
    constant: string}[],
  vft_ccout: {
    address: string,
    amount: number,
    scid: string,
  }[]
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
  data: string,
}

// Sidechain creation structure
export type SC_CREATION = {
  epoch_length: number,
  address: string,
  amount: number,
  wCertVk: string,
  customData: string,
  constant: string,
}

// Sidechain forward transfer structure
export type SC_FORWARD_TRANSFER = {
  address: string,
  amount: number,
  scid: string,
}
