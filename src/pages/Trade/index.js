import React, { useState, useEffect, useMemo } from 'react'

import { Input } from 'components/Input'
import { Divider } from 'components/Divider'
import { InfoRow } from 'components/InfoRow'
import { Button } from 'components/Button'

import { ethers } from 'ethers'

import { useSwap } from 'hooks/swap/useSwap'

import { formatAddress } from 'lib/objects'

import { useConnectModal } from '@rainbow-me/rainbowkit';
import useWallet from 'hooks/wallet/useWallet'

import { config } from 'config/app'

import './Trade.css'

export const Trade = () => {
    const { openConnectModal } = useConnectModal()
    const { account, chainId, signer } = useWallet()

    const { quoteAsync, swapAsync } = useSwap();

    const [fromAmount, setFromAmount] = useState('0.0');
    const [toAmount, setToAmount] = useState(0);
    const [toUSD, setToUSD] = useState(0);

    const onConfirm = async () => {
        if (!account || !signer) return;

        await swapAsync(fromAmount);
    }

    // const onApprove = async () => {
    //     if (!account || !signer) return;

    // }

    useEffect(() => {
        const updateToAmount = async () => {
            const quote = await quoteAsync(fromAmount);
            const parsedAmount = ethers.utils.formatEther(quote.outputAmount);
            setToAmount(parsedAmount.toString());
            setToUSD(quote.outputUSD.toFixed(2));
        }
        updateToAmount()
    }, [fromAmount])

    const onConnect = () => {
        openConnectModal();
    }
    return (
        <div className='trade-container'>
            <div className='trade-box'>
                <div className='title'>
                    Rango DEX Swap
                </div>
                <Divider />
                <InfoRow label={'Wallet Address'} value={formatAddress(account)}></InfoRow>
                <Divider />
                <Input value={fromAmount} setValue={setFromAmount} priceText={'From'} priceValue={`BSC`} balanceText={''} balanceValue={""} coinText={'BNB'}></Input>
                <Input value={toAmount} setValue={()=>{}} priceText={'To'} priceValue={`Avalanche`} balanceText={'USD'} balanceValue={`$${toUSD}`} coinText={'AVAX'} readOnly={true}></Input>
                <Divider />
                <InfoRow label={'Slippage'} value={`${config.slippage}%`}></InfoRow>
                <Divider />
                {/* <InfoRow label={'Entry Price'} value={`${toToken ? formatUsd(toToken.prices.minPrice) : ""}`}></InfoRow>
                <InfoRow label={'Accept. Price'} value={`${increaseAmounts? formatUsd(increaseAmounts.acceptablePrice, {fallbackToZero: true}) : ""}`}></InfoRow> */}
                {/* <Divider /> */}
                
                {/* <Button onClick={onApprove} hidden={!active || !account}>Approve</Button> */}
                <Button onClick={account? onConfirm : onConnect}>{account? 'Swap': 'Connect Wallet'}</Button>
            </div>
        </div>
    )
}