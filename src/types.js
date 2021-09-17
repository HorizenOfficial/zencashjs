// @flow

export type TXOBJ = {
  nLockTime: number,
  version: number, 
  inputs: {
    prevTxId: string,
    sequenceNumber: string,
    outputIndex: number,
    script: string, // check
    prevScriptPubKey: string, // check
  }[],
  outputs: { 
    script: string,
    satoshis: number 
  }[],
  joinsplit?: {}[], // Does ZencashJS support shielded txn?
  sc_params?: {
    vsc_ccout: {
      epoch_length: number,
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
    vft_ccout: {
      scid: string,
      satoshis: number,
      address: string
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
      scFee: string,
      mcDestinationAddress: string,
      vScRequestData: string[]
    }[],
  },
}

export type CERTIFICATE_OBJ = {
  hash: string,
  version: number,
  inputs: {
    prevTxId: string,
    sequenceNumber: string,
    outputIndex: number 
  }[],
  sidechainId: string,
  epochNumber: number,
  quality: number,
  endEpochCumScTxCommTreeRoot: number,
  scProof: string,
  vFieldElementCertificateField: string[],
  vBitVectorCertificateField: string[],
  ftScFee: number,
  mbtrScFee: number,
  outputs: { 
    script: string,
    satoshis: number,
    isFromBackwardTransfer: boolean,
    pubKeyHash: string
  }[],
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
