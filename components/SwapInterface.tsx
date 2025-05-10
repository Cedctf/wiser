'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
    TOKENS, 
    fetchQuote, 
    useSwap,
    convertFromTokenDecimals,
    type OrderResponse 
} from '@/utils/swap';
import { type ExecuteResponse } from '@/utils/transaction';

export default function SwapInterface() {
    const { publicKey } = useWallet();
    const { executeSwap } = useSwap();
    const [inputAmount, setInputAmount] = useState('');
    const [outputAmount, setOutputAmount] = useState('');
    const [inputToken, setInputToken] = useState(TOKENS.SOL);
    const [outputToken, setOutputToken] = useState(TOKENS.USDC);
    const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [swapStatus, setSwapStatus] = useState<ExecuteResponse | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);

    const handleFetchQuote = async () => {
        if (!publicKey || !inputAmount) return;
        
        setLoading(true);
        setError('');
        try {
            const quote = await fetchQuote(
                inputToken,
                outputToken,
                inputAmount,
                publicKey
            );
            
            setOrderResponse(quote);
            const formattedOutput = convertFromTokenDecimals(quote.outAmount, outputToken);
            setOutputAmount(formattedOutput);
        } catch (error) {
            console.error('Error fetching quote:', error);
            setError('Failed to fetch quote. Please try again.');
        }
        setLoading(false);
    };

    const handleSwap = async () => {
        if (!publicKey || !orderResponse) return;
        
        setIsExecuting(true);
        setError('');
        try {
            const response = await executeSwap(orderResponse, publicKey);
            setSwapStatus(response);
            
            if (response.status === "Failed") {
                setError(`Swap failed: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error performing swap:', error);
            setError('Failed to execute swap. Please try again.');
        }
        setIsExecuting(false);
    };

    return (
        <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
            <h1>Ultra Swap (Jupiter) Demo</h1>
            <div style={{ marginBottom: 20 }}>
                <WalletMultiButton />
            </div>

            {publicKey && (
                <div style={{ 
                    padding: 20, 
                    border: '1px solid #ccc', 
                    borderRadius: 8,
                    backgroundColor: '#f9f9f9'
                }}>
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5 }}>From:</label>
                        <input
                            type="number"
                            value={inputAmount}
                            onChange={(e) => setInputAmount(e.target.value)}
                            style={{ width: '100%', padding: 8 }}
                            placeholder="Amount"
                        />
                        <select 
                            value={inputToken}
                            onChange={(e) => setInputToken(e.target.value)}
                            style={{ width: '100%', marginTop: 5, padding: 8 }}
                        >
                            <option value={TOKENS.SOL}>SOL</option>
                            <option value={TOKENS.USDC}>USDC</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: 'block', marginBottom: 5 }}>To:</label>
                        <input
                            type="number"
                            value={outputAmount}
                            readOnly
                            style={{ width: '100%', padding: 8, backgroundColor: '#eee' }}
                            placeholder="Output amount"
                        />
                        <select 
                            value={outputToken}
                            onChange={(e) => setOutputToken(e.target.value)}
                            style={{ width: '100%', marginTop: 5, padding: 8 }}
                        >
                            <option value={TOKENS.USDC}>USDC</option>
                            <option value={TOKENS.SOL}>SOL</option>
                        </select>
                    </div>

                    {error && (
                        <div style={{ 
                            color: 'red', 
                            marginBottom: 10,
                            padding: 8,
                            backgroundColor: '#ffebee',
                            borderRadius: 4
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleFetchQuote}
                        disabled={loading || !inputAmount}
                        style={{
                            width: '100%',
                            padding: 10,
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            marginBottom: 10,
                            opacity: loading || !inputAmount ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Loading...' : 'Get Quote'}
                    </button>

                    {orderResponse && (
                        <>
                            <div style={{ 
                                marginBottom: 10,
                                padding: 10,
                                backgroundColor: '#e3f2fd',
                                borderRadius: 4
                            }}>
                                <div>Price Impact: {orderResponse.priceImpactPct}%</div>
                                <div>Slippage: {orderResponse.slippageBps / 100}%</div>
                                {orderResponse.swapType === 'rfq' && (
                                    <div>RFQ Provider: {orderResponse.maker}</div>
                                )}
                            </div>

                            <button
                                onClick={handleSwap}
                                style={{
                                    width: '100%',
                                    padding: 10,
                                    backgroundColor: '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer'
                                }}
                            >
                                Swap
                            </button>
                        </>
                    )}

                    {swapStatus && (
                        <div style={{ 
                            marginTop: 10,
                            padding: 10,
                            backgroundColor: swapStatus.status === "Success" ? '#e8f5e9' : '#ffebee',
                            borderRadius: 4
                        }}>
                            <div>Status: {swapStatus.status}</div>
                            {swapStatus.signature && (
                                <div>
                                    Transaction: 
                                    <a 
                                        href={`https://solscan.io/tx/${swapStatus.signature}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ marginLeft: 5, color: '#2196F3' }}
                                    >
                                        View on Solscan
                                    </a>
                                </div>
                            )}
                            {swapStatus.inputAmountResult && swapStatus.outputAmountResult && (
                                <div>
                                    <div>Input: {swapStatus.inputAmountResult}</div>
                                    <div>Output: {swapStatus.outputAmountResult}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 