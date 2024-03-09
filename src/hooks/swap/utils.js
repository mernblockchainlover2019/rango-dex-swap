import {
    TransactionStatus
} from 'rango-sdk-basic'

import { sleep } from 'lib/sleep';

export function prepareEvmTransaction(
    evmTx, 
    isApprove
  ) {
    const gasPrice = !!evmTx.gasPrice && !evmTx.gasPrice.startsWith('0x') ?
        '0x' + parseInt(evmTx.gasPrice).toString(16) : null;
    const manipulatedTx = {
      ...evmTx,
      gasPrice
    }
  
    let tx = {}
    if (!!manipulatedTx.from) tx = { ...tx, from: manipulatedTx.from }
    if (isApprove) {
      if (!!manipulatedTx.approveTo) tx = {...tx, to: manipulatedTx.approveTo}
      if (!!manipulatedTx.approveData) tx = {...tx, data: manipulatedTx.approveData}
    } else {
      if (!!manipulatedTx.txTo) tx = { ...tx, to: manipulatedTx.txTo }
      if (!!manipulatedTx.txData) tx = { ...tx, data: manipulatedTx.txData }
      if (!!manipulatedTx.value) tx = { ...tx, value: manipulatedTx.value }
      if (!!manipulatedTx.gasLimit) tx = { ...tx, gasLimit: manipulatedTx.gasLimit }
      if (!!manipulatedTx.gasPrice) tx = { ...tx, gasPrice: manipulatedTx.gasPrice }
    }
    return tx
  }
  
  export async function checkApprovalSync(
    requestId, 
    txId, 
    rangoClient
  ) {
    while (true) {
      const approvalResponse = await rangoClient.isApproved(requestId, txId)
      if (approvalResponse.isApproved) {
        return true
      }
      await sleep(3000)
    }
  }
  
  export const checkTransactionStatusSync = async (
    requestId,
    txId,
    rangoClient
  ) => {
    while (true) {
        try {
            const txStatus = await rangoClient.status({
                requestId,
                txId,
            })
            if (!!txStatus) {
                // show latest status of the transaction to the user
                console.log({ txStatus })
                if (
                !!txStatus.status &&
                [TransactionStatus.FAILED, TransactionStatus.SUCCESS].includes(
                    txStatus.status
                )
                ) {
                return txStatus
                }
            }
            await sleep(3000)
        } catch (err) {
            console.log(err)
        }
    }
}