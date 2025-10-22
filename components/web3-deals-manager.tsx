'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useEscrowContract, Deal } from '@/hooks/use-escrow-contract';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Shield, 
  FileX, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow, addSeconds } from 'date-fns';

interface DealCardProps {
  deal: Deal;
  userRole: 'renter' | 'owner';
  onAction: (action: string, dealId: string) => void;
}

function DealCard({ deal, userRole, onAction }: DealCardProps) {
  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { label: 'Created', color: 'bg-blue-500', icon: Clock };
      case 1:
        return { label: 'Active', color: 'bg-green-500', icon: CheckCircle };
      case 2:
        return { label: 'Completed', color: 'bg-gray-500', icon: CheckCircle };
      case 3:
        return { label: 'Cancelled', color: 'bg-red-500', icon: FileX };
      case 4:
        return { label: 'Disputed', color: 'bg-orange-500', icon: AlertTriangle };
      default:
        return { label: 'Unknown', color: 'bg-gray-400', icon: AlertCircle };
    }
  };

  const statusInfo = getStatusInfo(deal.status);
  const StatusIcon = statusInfo.icon;
  
  const endTime = deal.startTime > 0 ? addSeconds(new Date(deal.startTime * 1000), deal.duration) : null;
  const isExpired = endTime && endTime < new Date();
  
  const getAvailableActions = () => {
    const actions: Array<{ label: string; action: string; variant?: 'default' | 'destructive' | 'outline' }> = [];
    
    if (deal.status === 0) { // Created
      if (userRole === 'owner') {
        actions.push({ label: 'Activate Deal', action: 'activate' });
      }
      if (userRole === 'renter') {
        actions.push({ label: 'Cancel Deal', action: 'cancel', variant: 'destructive' });
      }
    } else if (deal.status === 1) { // Active
      if (userRole === 'renter' && !deal.disputeOpen) {
        actions.push({ label: 'Confirm Return', action: 'confirmReturn' });
        actions.push({ label: 'Open Dispute', action: 'openDispute', variant: 'destructive' });
      }
      if (userRole === 'owner' && !deal.fundsReleased && !deal.disputeOpen) {
        actions.push({ label: 'Release Funds', action: 'releaseFunds' });
      }
    }
    
    return actions;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Deal #{deal.id}</CardTitle>
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            <Badge className={`${statusInfo.color} text-white`}>
              {statusInfo.label}
            </Badge>
            {deal.disputeOpen && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Dispute Open
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          {userRole === 'renter' ? 'You are renting' : 'You are lending'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Deal Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Amount:</span>
            <p className="text-muted-foreground">{parseFloat(deal.amount).toFixed(2)} USDT</p>
          </div>
          <div>
            <span className="font-medium">Duration:</span>
            <p className="text-muted-foreground">{Math.ceil(deal.duration / (24 * 60 * 60))} days</p>
          </div>
          <div>
            <span className="font-medium">Start Time:</span>
            <p className="text-muted-foreground">
              {deal.startTime > 0 
                ? new Date(deal.startTime * 1000).toLocaleDateString()
                : 'Not started'
              }
            </p>
          </div>
          <div>
            <span className="font-medium">End Time:</span>
            <p className="text-muted-foreground">
              {endTime 
                ? endTime.toLocaleDateString()
                : 'TBD'
              }
            </p>
          </div>
        </div>

        {/* Time Remaining */}
        {deal.status === 1 && endTime && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">
                {isExpired 
                  ? 'Deal expired'
                  : `${formatDistanceToNow(endTime)} remaining`
                }
              </span>
            </div>
          </div>
        )}

        {/* Addresses */}
        <div className="space-y-2">
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Renter:</span>
              <span className="font-mono">{deal.renter.slice(0, 6)}...{deal.renter.slice(-4)}</span>
            </div>
            <div className="flex justify-between">
              <span>Owner:</span>
              <span className="font-mono">{deal.owner.slice(0, 6)}...{deal.owner.slice(-4)}</span>
            </div>
            <div className="flex justify-between">
              <span>Token:</span>
              <span className="font-mono">{deal.token.slice(0, 6)}...{deal.token.slice(-4)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {getAvailableActions().length > 0 && (
          <>
            <Separator />
            <div className="flex gap-2 flex-wrap">
              {getAvailableActions().map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  size="sm"
                  onClick={() => onAction(action.action, deal.id)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </>
        )}

        {/* Warnings */}
        {deal.status === 1 && isExpired && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This deal has expired. The owner should release funds or a dispute may be opened.
            </AlertDescription>
          </Alert>
        )}

        {deal.fundsReleased && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Funds have been released from escrow.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export function Web3DealsManager() {
  const { address, isConnected } = useAccount();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    renterDeals,
    ownerDeals,
    activateDeal,
    confirmReturn,
    releaseFunds,
    cancelDeal,
    openDispute,
    getDeal,
    isPending,
    refetchRenterDeals,
    refetchOwnerDeals
  } = useEscrowContract();

  // Fetch deal details
  useEffect(() => {
    const fetchDeals = async () => {
      if (!isConnected || !address || (!renterDeals && !ownerDeals)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const allDealIds = [
          ...(renterDeals || []),
          ...(ownerDeals || [])
        ];

        // Remove duplicates
        const uniqueDealIds = [...new Set(allDealIds.map(id => id.toString()))];

        const dealPromises = uniqueDealIds.map(async (dealId) => {
          const deal = await getDeal(dealId);
          return deal;
        });

        const fetchedDeals = await Promise.all(dealPromises);
        const validDeals = fetchedDeals.filter((deal): deal is Deal => deal !== null);
        
        setDeals(validDeals);
        setError(null);
      } catch (err) {
        console.error('Error fetching deals:', err);
        setError('Failed to fetch deals');
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [isConnected, address, renterDeals, ownerDeals, getDeal]);

  const handleAction = async (action: string, dealId: string) => {
    try {
      setError(null);
      
      switch (action) {
        case 'activate':
          await activateDeal(dealId);
          break;
        case 'confirmReturn':
          await confirmReturn(dealId);
          break;
        case 'releaseFunds':
          await releaseFunds(dealId);
          break;
        case 'cancel':
          await cancelDeal(dealId);
          break;
        case 'openDispute':
          await openDispute(dealId);
          break;
        default:
          throw new Error('Invalid action');
      }

      // Refetch deals after action
      setTimeout(() => {
        refetchRenterDeals();
        refetchOwnerDeals();
      }, 2000);
    } catch (err) {
      console.error('Error performing action:', err);
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const getUserRole = (deal: Deal): 'renter' | 'owner' => {
    if (!address) return 'renter';
    return deal.renter.toLowerCase() === address.toLowerCase() ? 'renter' : 'owner';
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Not Connected</CardTitle>
          <CardDescription>
            Connect your wallet to view your escrow deals
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Deals...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Clock className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Escrow Deals</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchRenterDeals();
            refetchOwnerDeals();
          }}
          disabled={isPending}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {deals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600">No active deals found</p>
            <p className="text-muted-foreground">
              Your escrow deals will appear here once you create them
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              userRole={getUserRole(deal)}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}