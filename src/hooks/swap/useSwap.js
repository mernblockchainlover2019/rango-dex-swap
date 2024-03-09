import { ethers } from 'ethers'
import { RangoClient } from 'rango-sdk-basic'

import useWallet from "hooks/wallet/useWallet";

import { config } from 'config/app'

import { prepareEvmTransaction, checkApprovalSync, checkTransactionStatusSync } from './utils'

export const useSwap = () => {
    const { signer, account } = useWallet();

    const quoteAsync = async (amount) => {
        const rangoClient = new RangoClient(config.apiKey)
        
        const swapRequest = {
            from: config.from,
            to: config.to,
            amount: ethers.utils.parseEther(amount),
        }
        
        const quote = await rangoClient.quote(swapRequest)
        
        if (!!quote.error || quote.resultType !== 'OK') {
            const msg = 
                `Error Quote, message: ${quote.error}, status: ${quote.resultType}`
            console.log(msg)
            return { outputAmount: 0, outputUSD: 0 }
        }
        return { outputAmount: quote.route.outputAmount, outputUSD: quote.route.outputAmountUsd }
    }

    const swapAsync = async (amount) => {
        if (!signer || !account) return;

        const rangoClient = new RangoClient(config.apiKey)
        
        const swapRequest = {
            from: config.from,
            to: config.to,
            amount: ethers.utils.parseEther(amount),
            fromAddress: account,
            toAddress: account,
            slippage: config.slippage,
            disableEstimate: config.disableEstimate, 
            referrerAddress: config.referrerAddress,  // your dApp wallet address for referral
            referrerFee: config.referrerFee,      // your dApp desired referral fee percent 
        }
        
        const swap = await rangoClient.swap(swapRequest)
        
        if (!!swap.error || swap.resultType !== 'OK') {
            const msg = 
                `Error swapping, message: ${swap.error}, status: ${swap.resultType}`
            console.log(msg)
        }
        
        const evmTransaction = swap.tx

        console.log(evmTransaction)
        
        // needs approving the tx
        if (swap.approveTo && swap.approveData) {
            const approveTx = prepareEvmTransaction(evmTransaction, true)
            const approveTxHash = (await signer.sendTransaction(approveTx)).hash
            await checkApprovalSync(swap.requestId, approveTxHash, rangoClient)
        }
        
        // main transaction
        const mainTx = prepareEvmTransaction(evmTransaction, false)
        const mainTxHash = (await signer.sendTransaction(mainTx)).hash
        const txStatus = await checkTransactionStatusSync(
            swap.requestId,
            mainTxHash,
            rangoClient
        )
    }

    return { quoteAsync, swapAsync }
}
