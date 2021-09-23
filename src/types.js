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
  sc_params?: {
    vsc_ccout: {
      epoch_length: number,
      satoshis: number,
      address: string,
      customData: string,
      certVk: string,
      constantData: string,
      wCeasedVk: string,
      vFieldElementCertificateFieldConfig: number[],
      vBitVectorCertificateFieldConfig: number[][],
      forwardTransferScFee: number,
      mainchainBackwardTransferScFee: number,
      mbtrRequestDataLength: number
    }[],
    vft_ccout: {
      scid: string,
      satoshis: number,
      address: string,
      mcReturnAddress: string
    }[],
    vcsw_ccin: {
      value: number,
      scId: string,
      nullifer: string,
      scProof: string,
      actCertDataHash: string,
      ceasingCumScTxCommTree: string,
      redeemScript: string,
      pubKeyHash: string
    }[],
    vmbtr_out: {
      scid: string,
      scFee: number,
      mcDestinationAddress: string,
      vScRequestData: string[]
    }[],
  },
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
