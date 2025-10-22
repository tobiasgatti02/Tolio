'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useEscrowContract } from '@/hooks/use-escrow-contract';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Wallet, Shield, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Web3PaymentFormProps {
  itemId: string;
  itemTitle: string;
  ownerName: string;
  ownerAddress: string; // Add owner address
  pricePerDay: number;
  durationDays: number;
  onSuccess?: (dealId: string) => void;
  onCancel?: () => void;
}

export function Web3PaymentForm({
  itemId,
  itemTitle,
  ownerName,
  ownerAddress,
  pricePerDay,
  durationDays,
  onSuccess,
  onCancel
}: Web3PaymentFormProps) {
  const { isConnected } = useAccount();
  const [step, setStep] = useState<'connect' | 'approve' | 'create' | 'confirming' | 'success' | 'error'>('connect');
  const [error, setError] = useState<string | null>(null);
  const [dealId, setDealId] = useState<string | null>(null);

  const {
    balance,
    allowance,
    hasAllowance,
    isPending,
    isConfirming,
    isConfirmed,
    error: contractError,
    createDeal,
    approveUSDT,
    transactionHash,
    refetchBalance,
    refetchAllowance
  } = useEscrowContract();

  const totalAmount = pricePerDay * durationDays;
  const deposit = totalAmount * 0.1; // 10% deposit
  const totalPayment = totalAmount + deposit;
  const durationSeconds = durationDays * 24 * 60 * 60;

  // Debug logging
  console.log('🔍 Web3PaymentForm Debug Info:', {
    itemId,
    itemTitle,
    ownerAddress,
    totalAmount,
    deposit,
    totalPayment,
    isConnected,
    balance,
    allowance,
    hasAllowance,
    step
  });

  // Update step based on connection and allowance - TESTING MODE
  useEffect(() => {
    if (!isConnected) {
      setStep('connect');
    } else {
      // 🚧 TESTING MODE: Skip USDT verification
      console.log('🧪 TESTING MODE: Skipping USDT balance/allowance checks');
      setStep('create');
    }
  }, [isConnected, hasAllowance, allowance, totalPayment]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && transactionHash) {
      if (step === 'approve') {
        refetchAllowance();
        setStep('create');
      } else if (step === 'create') {
        setStep('success');
        if (onSuccess) {
          onSuccess(transactionHash);
        }
      }
    }
  }, [isConfirmed, transactionHash, step, refetchAllowance, onSuccess]);

  // Handle errors
  useEffect(() => {
    if (contractError) {
      setError(contractError.message);
      setStep('error');
    }
  }, [contractError]);

  // Handle transaction states
  useEffect(() => {
    if (isPending || isConfirming) {
      setStep('confirming');
    }
  }, [isPending, isConfirming]);

  const handleApprove = async () => {
    try {
      setError(null);
      await approveUSDT(totalPayment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve USDT');
      setStep('error');
    }
  };

  const handleCreateDeal = async () => {
    console.log('🚀 handleCreateDeal called');
    console.log('📄 Deal parameters:', {
      owner: ownerAddress,
      amount: totalAmount,
      securityDeposit: deposit,
      itemId,
      notes: `Rental: ${itemTitle} for ${durationDays} days`
    });
    
    try {
      setError(null);
      console.log('⏳ Calling createDeal...');
      await createDeal({
        owner: ownerAddress,
        amount: totalAmount,
        securityDeposit: deposit,
        itemId,
        notes: `Rental: ${itemTitle} for ${durationDays} days`
      });
      console.log('✅ createDeal completed successfully');
    } catch (err) {
      console.error('❌ Error in handleCreateDeal:', err);
      setError(err instanceof Error ? err.message : 'Failed to create deal');
      setStep('error');
    }
  };

  const getStepIcon = (currentStep: string) => {
    switch (currentStep) {
      case 'connect':
        return <Wallet className="h-5 w-5" />;
      case 'approve':
        return <Shield className="h-5 w-5" />;
      case 'create':
        return <DollarSign className="h-5 w-5" />;
      case 'confirming':
        return <Clock className="h-5 w-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'connect':
        return 'Connect Your Wallet';
      case 'approve':
        return 'Approve USDT';
      case 'create':
        return 'Create Escrow Deal';
      case 'confirming':
        return 'Confirming Transaction...';
      case 'success':
        return 'Deal Created Successfully!';
      case 'error':
        return 'Transaction Failed';
      default:
        return 'Unknown State';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          {getStepIcon(step)}
        </div>
        <CardTitle className="text-lg">{getStepTitle()}</CardTitle>
        <CardDescription>
          Rent "{itemTitle}" from {ownerName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Rental ({durationDays} days)</span>
            <span>${totalAmount.toFixed(2)} USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Security Deposit (10%)</span>
            <span>${deposit.toFixed(2)} USDT</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total Payment</span>
            <span>${totalPayment.toFixed(2)} USDT</span>
          </div>
        </div>

        {/* Wallet Connection */}
        {step === 'connect' && (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to proceed with the crypto payment
            </p>
            <ConnectButton />
          </div>
        )}

        {/* Balance Check - TESTING MODE */}
        {isConnected && (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium">Your USDT Balance</span>
            <Badge variant="default">
              50,000.00 USDT (Testing)
            </Badge>
          </div>
        )}

        {/* Testing Mode Notice */}
        {isConnected && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              🧪 <strong>TESTING MODE:</strong> Using simulated USDT balance for local development. Real balance verification disabled.
            </AlertDescription>
          </Alert>
        )}

        {/* Approval Step */}
        {step === 'approve' && parseFloat(balance) >= totalPayment && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Approve the escrow contract to spend your USDT tokens
            </p>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                Current allowance: {allowance} USDT
              </p>
            </div>
            <Button
              onClick={handleApprove}
              disabled={isPending || isConfirming}
              className="w-full"
            >
              {isPending || isConfirming ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Approve ${totalPayment.toFixed(2)} USDT
                </>
              )}
            </Button>
          </div>
        )}

        {/* Create Deal Step */}
        {step === 'create' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Create the escrow deal on the blockchain
            </p>
            <div className="bg-green-50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Duration</span>
                <span>{durationDays} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Escrow Amount</span>
                <span>${totalPayment.toFixed(2)} USDT</span>
              </div>
            </div>
            <Button
              onClick={() => {
                console.log('🖱️ Create Deal button clicked');
                handleCreateDeal();
              }}
              disabled={isPending || isConfirming}
              className="w-full"
            >
              {isPending || isConfirming ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Creating Deal...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Create Escrow Deal
                </>
              )}
            </Button>
          </div>
        )}

        {/* Confirming State */}
        {step === 'confirming' && (
          <div className="text-center space-y-3">
            <div className="animate-pulse">
              <Clock className="h-8 w-8 mx-auto animate-spin text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              Please wait while your transaction is being confirmed on the blockchain...
            </p>
            {transactionHash && (
              <p className="text-xs text-muted-foreground break-all">
                Transaction: {transactionHash}
              </p>
            )}
          </div>
        )}

        {/* Success State */}
        {step === 'success' && (
          <div className="text-center space-y-3">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <div>
              <p className="font-semibold text-green-700">Deal Created Successfully!</p>
              <p className="text-sm text-muted-foreground">
                Your payment is now held in escrow until the rental is complete.
              </p>
            </div>
            {transactionHash && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-muted-foreground break-all">
                  Transaction: {transactionHash}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {step === 'error' && error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="space-x-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        {step === 'error' && (
          <Button
            onClick={() => {
              setError(null);
              setStep(isConnected ? (hasAllowance ? 'create' : 'approve') : 'connect');
            }}
            className="flex-1"
          >
            Try Again
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}