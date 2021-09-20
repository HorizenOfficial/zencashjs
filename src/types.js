// @flow

export type TXOBJ = {
  locktime?: number,
  version: number,
  ins: {
    output: { hash: string, vout: number },
    script: string,
    sequence: string,
    prevScriptPubKey: string,
  }[],
  outs: { script: string, satoshis: number, isFromBackwardTransfer?: boolean }[],
  scParams?: {
    scCcout: {
      epochLength: number,
      satoshis: number,
      address: string,
      customData: string,
      wCertVk: string,
      vFieldElementCertificateFieldConfig: number[],
      vBitVectorCertificateFieldConfig: number[][],
      forwardTransferScFee: number,
      mainchainBackwardTransferScFee: number,
      mbtrRequestDataLength: number
    }[],
    ftCcout: {
      scId: string,
      satoshis: number,
      address: string,
      mcReturnAddress: string
    }[],
    cswCcin: {
      value: number,
      scId: string,
      nullifer: string,
      scProof: string,
      actCertDataHash: string,
      ceasingCumScTxCommTree: string,
      redeemScript: string,
      pubKeyHash: string
    }[],
    mbtrOut: {
      scId: string,
      scFee: number,
      mcDestinationAddress: string,
      vScRequestData: string[]
    }[],
  },
  cert?: {
    scId: string,
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
