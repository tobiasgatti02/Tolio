"use client"

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEscrowContract } from '@/hooks/use-escrow-contract';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

export default function GanacheTestPage() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const {
    balance,
    allowance,
    hasAllowance,
    createDeal,
    approveUSDT,
    confirmPickup,
    markCompleted,
    cancelDeal,
    userDeals,
    transactionHash,
    isPending,
    isConfirming,
    isConfirmed,
    isDevMode
  } = useEscrowContract();

  // Form state
  const [formData, setFormData] = useState({
    owner: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Default to treasury address
    amount: '100',
    securityDeposit: '50',
    itemId: 'test-item-001',
    notes: 'Test rental deal'
  });

  const [dealId, setDealId] = useState('1');
  const [approvalAmount, setApprovalAmount] = useState('1000');

  const handleCreateDeal = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    await createDeal({
      owner: formData.owner,
      amount: parseFloat(formData.amount),
      securityDeposit: parseFloat(formData.securityDeposit),
      itemId: formData.itemId,
      notes: formData.notes
    });
  };

  const handleApproveUSDT = async () => {
    await approveUSDT(parseFloat(approvalAmount));
  };

  const handleConfirmPickup = async () => {
    await confirmPickup(parseInt(dealId));
  };

  const handleMarkCompleted = async () => {
    await markCompleted(parseInt(dealId));
  };

  const handleCancelDeal = async () => {
    await cancelDeal(parseInt(dealId));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Prestar Ganache Test Dashboard</h1>
        <p className="text-muted-foreground">Test blockchain escrow functionality with Ganache</p>
        {isDevMode && (
          <Badge variant="outline" className="mt-2">
            Development Mode
          </Badge>
        )}
      </div>

      {/* Wallet Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Connection</CardTitle>
          <CardDescription>Connect your MetaMask wallet to Ganache</CardDescription>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Connected Address:</p>
                <p className="font-mono text-sm bg-muted p-2 rounded">{address}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-sm font-medium">USDT Balance:</p>
                  <p className="text-lg font-bold">{balance} USDT</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Allowance:</p>
                  <p className="text-lg font-bold">{allowance} USDT</p>
                  <Badge variant={hasAllowance ? "default" : "secondary"}>
                    {hasAllowance ? "Approved" : "Not Approved"}
                  </Badge>
                </div>
              </div>
              <Button onClick={() => disconnect()}>Disconnect</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">Connect your wallet to start testing</p>
              {connectors.map((connector) => (
                <Button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  variant="outline"
                >
                  Connect {connector.name}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Status */}
      {(isPending || isConfirming || transactionHash) && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {isPending && (
                <Badge variant="secondary">Transaction Pending...</Badge>
              )}
              {isConfirming && (
                <Badge variant="secondary">Confirming Transaction...</Badge>
              )}
              {isConfirmed && (
                <Badge variant="default">Transaction Confirmed ✅</Badge>
              )}
              {transactionHash && (
                <div>
                  <p className="text-sm font-medium">Transaction Hash:</p>
                  <p className="font-mono text-sm bg-muted p-2 rounded break-all">{transactionHash}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* USDT Approval */}
      <Card>
        <CardHeader>
          <CardTitle>1. Approve USDT</CardTitle>
          <CardDescription>Approve USDT tokens for the escrow contract</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Amount to approve"
              value={approvalAmount}
              onChange={(e) => setApprovalAmount(e.target.value)}
              type="number"
              className="flex-1"
            />
            <Button onClick={handleApproveUSDT} disabled={!isConnected || isPending}>
              Approve USDT
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Create Deal */}
      <Card>
        <CardHeader>
          <CardTitle>2. Create Deal</CardTitle>
          <CardDescription>Create a new rental deal with escrow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Owner Address</label>
              <Input
                placeholder="0x..."
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Item ID</label>
              <Input
                placeholder="item-001"
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Amount (USDT)</label>
              <Input
                placeholder="100"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                type="number"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Security Deposit (USDT)</label>
              <Input
                placeholder="50"
                value={formData.securityDeposit}
                onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                type="number"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <Input
                placeholder="Test rental deal"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleCreateDeal} disabled={!isConnected || isPending} className="w-full mt-4">
            Create Deal
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Deal Actions */}
      <Card>
        <CardHeader>
          <CardTitle>3. Deal Management</CardTitle>
          <CardDescription>Manage existing deals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Deal ID</label>
              <Input
                placeholder="1"
                value={dealId}
                onChange={(e) => setDealId(e.target.value)}
                type="number"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={handleConfirmPickup} disabled={!isConnected || isPending} variant="outline">
                Confirm Pickup
              </Button>
              <Button onClick={handleMarkCompleted} disabled={!isConnected || isPending} variant="default">
                Mark Completed
              </Button>
              <Button onClick={handleCancelDeal} disabled={!isConnected || isPending} variant="destructive">
                Cancel Deal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Deals */}
      {userDeals && userDeals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Deals</CardTitle>
            <CardDescription>Deals associated with your address</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userDeals.map((dealId: bigint, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span>Deal #{dealId.toString()}</span>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium">Before starting:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Make sure Ganache is running: <code>npm run ganache:start</code></li>
                <li>Import test accounts into MetaMask using the private keys</li>
                <li>Switch MetaMask to Ganache network (localhost:7545, Chain ID: 1337)</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium">Test Flow:</p>
              <ol className="list-decimal list-inside ml-4 space-y-1">
                <li>Connect your wallet</li>
                <li>Approve USDT tokens for the escrow contract</li>
                <li>Create a deal (funds will be locked in escrow)</li>
                <li>Renter: Confirm pickup of the item</li>
                <li>Owner: Mark the order as completed (releases funds)</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}