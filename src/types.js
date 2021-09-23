// @flow

// Shape for sc_params and cert should stay consistent with Zendoo and bitcore-lib-zen
export type TXOBJ = {
  locktime?: number,
  version: number,
  ins: {
    output: { hash: string, vout: number },
    script: string,
    sequence: string,
    prevScriptPubKey: string,
  }[],
  outs: { script: string, satoshis: number, isFromBackwardTransfer?: boolean, pubKeyHash?: string }[],
  vsc_ccout?: {
    withdrawalEpochLength: number,
    value: number,
    address: string,
    customData: string,
    wCertVk: string,
    constant: string,
    wCeasedVk: string,
    vFieldElementCertificateFieldConfig: number[],
    vBitVectorCertificateFieldConfig: number[][],
    ftScFee: number,
    mbtrScFee: number,
    mbtrRequestDataLength: number
  }[],
  vft_ccout?: {
    scid: string,
    value: number,
    address: string
  }[],
  vcsw_ccin?: {
    value: number,
    scId: string,
    nullifer: string,
    scProof: string,
    actCertDataHash: string,
    ceasingCumScTxCommTree: string,
    redeemScript: {
      hex: string
    },
    scriptPubKey: {
      hex: string
    }
  }[],
  vmbtr_out?: {
    scid: string,
    scFee: number,
    mcDestinationAddress: {
      pubkeyhash: string
    },
    vScRequestData: string[]
  }[],
  cert?: {
    scid: string,
    epochNumber: number,
    quality: number,
    endEpochCumScTxCommTreeRoot: string,
    scProof: string,
    vFieldElementCertificateField: string[],
    vBitVectorCertificateField: string[],
    ftScFee: number,
    mbtrScFee: number,
  }
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
