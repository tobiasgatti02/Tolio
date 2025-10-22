import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ethers, Contract, JsonRpcProvider } from 'ethers';

const prisma = new PrismaClient();

// Event signatures
const EVENT_SIGNATURES = {
  DealCreated: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
  DealActivated: '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
  DealCompleted: '0x5548c837ab068cf56a2c2479df0882a4922fd203edb7517321831d95078c5f62',
  DealCancelled: '0xcd35267e7654194727477d6c78b541a553483cff7f92a055d17868d3afe129ad',
  DisputeOpened: '0x9b1bfa7fa9ee420a16e124f794c35ac9f90472acc99140eb2f6447c714cad8eb'
};

interface DealEvent {
  dealId: string;
  itemId: string;
  renter: string;
  owner: string;
  amount: string;
  token: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
  eventType: string;
}

export async function POST(request: NextRequest) {
  try {
    const { events } = await request.json();
    
    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid events data' }, { status: 400 });
    }

    const processedEvents = await Promise.all(
      events.map(async (event: any) => {
        try {
          return await processBlockchainEvent(event);
        } catch (error) {
          console.error('Error processing event:', error);
          return null;
        }
      })
    );

    const validEvents = processedEvents.filter(event => event !== null);

    return NextResponse.json({
      success: true,
      processed: validEvents.length,
      events: validEvents
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function processBlockchainEvent(event: any): Promise<DealEvent | null> {
  try {
    const { topics, data, transactionHash, blockNumber, address } = event;
    
    if (!topics || topics.length === 0) {
      return null;
    }

    const eventSignature = topics[0];
    let eventType: string;
    
    // Determine event type
    switch (eventSignature) {
      case EVENT_SIGNATURES.DealCreated:
        eventType = 'DealCreated';
        break;
      case EVENT_SIGNATURES.DealActivated:
        eventType = 'DealActivated';
        break;
      case EVENT_SIGNATURES.DealCompleted:
        eventType = 'DealCompleted';
        break;
      case EVENT_SIGNATURES.DealCancelled:
        eventType = 'DealCancelled';
        break;
      case EVENT_SIGNATURES.DisputeOpened:
        eventType = 'DisputeOpened';
        break;
      default:
        console.log('Unknown event signature:', eventSignature);
        return null;
    }

    // Decode event data (this is simplified - in practice you'd use proper ABI decoding)
    const dealId = ethers.toBigInt(topics[1]).toString();
    
    // For this example, we'll parse the basic data
    // In a real implementation, you'd use the full ABI to decode all parameters
    const parsedEvent: DealEvent = {
      dealId,
      itemId: topics[2] ? ethers.toUtf8String(topics[2]) : '',
      renter: topics[3] ? ethers.getAddress('0x' + topics[3].slice(26)) : '',
      owner: '', // Would be decoded from data
      amount: '', // Would be decoded from data
      token: '', // Would be decoded from data
      timestamp: Date.now(),
      transactionHash,
      blockNumber,
      eventType
    };

    // Store event in database
    await storeEventInDatabase(parsedEvent);
    
    // Handle event-specific logic
    await handleEventLogic(parsedEvent);

    return parsedEvent;
  } catch (error) {
    console.error('Error processing blockchain event:', error);
    return null;
  }
}

async function storeEventInDatabase(event: DealEvent) {
  try {
    // Check if we already processed this event
    const existingEvent = await prisma.blockchainEvent.findUnique({
      where: {
        transactionHash_dealId: {
          transactionHash: event.transactionHash,
          dealId: event.dealId
        }
      }
    });

    if (existingEvent) {
      console.log('Event already processed:', event.transactionHash);
      return;
    }

    // Store the event
    await prisma.blockchainEvent.create({
      data: {
        dealId: event.dealId,
        itemId: event.itemId,
        eventType: event.eventType,
        renterAddress: event.renter,
        ownerAddress: event.owner,
        amount: event.amount,
        tokenAddress: event.token,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: new Date(event.timestamp),
        processed: true
      }
    });

    console.log(`Stored ${event.eventType} event for deal ${event.dealId}`);
  } catch (error) {
    console.error('Error storing event in database:', error);
    throw error;
  }
}

async function handleEventLogic(event: DealEvent) {
  try {
    switch (event.eventType) {
      case 'DealCreated':
        await handleDealCreated(event);
        break;
      case 'DealActivated':
        await handleDealActivated(event);
        break;
      case 'DealCompleted':
        await handleDealCompleted(event);
        break;
      case 'DealCancelled':
        await handleDealCancelled(event);
        break;
      case 'DisputeOpened':
        await handleDisputeOpened(event);
        break;
    }
  } catch (error) {
    console.error(`Error handling ${event.eventType}:`, error);
  }
}

async function handleDealCreated(event: DealEvent) {
  // Create a booking record or update item availability
  console.log(`Deal created: ${event.dealId} for item ${event.itemId}`);
  
  // Update item availability if needed
  if (event.itemId) {
    await prisma.item.update({
      where: { id: event.itemId },
      data: { isAvailable: false }
    });
  }
}

async function handleDealActivated(event: DealEvent) {
  console.log(`Deal activated: ${event.dealId}`);
  
  // Update booking status or send notifications
  // This would trigger notifications to both parties
}

async function handleDealCompleted(event: DealEvent) {
  console.log(`Deal completed: ${event.dealId}`);
  
  // Update item availability back to true
  if (event.itemId) {
    await prisma.item.update({
      where: { id: event.itemId },
      data: { isAvailable: true }
    });
  }
  
  // Trigger review reminders or other post-completion logic
}

async function handleDealCancelled(event: DealEvent) {
  console.log(`Deal cancelled: ${event.dealId}`);
  
  // Update item availability back to true
  if (event.itemId) {
    await prisma.item.update({
      where: { id: event.itemId },
      data: { isAvailable: true }
    });
  }
}

async function handleDisputeOpened(event: DealEvent) {
  console.log(`Dispute opened for deal: ${event.dealId}`);
  
  // Send notifications to admin/moderators
  // Create dispute record in database
}

// GET endpoint for querying events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('dealId');
    const itemId = searchParams.get('itemId');
    const eventType = searchParams.get('eventType');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    
    if (dealId) where.dealId = dealId;
    if (itemId) where.itemId = itemId;
    if (eventType) where.eventType = eventType;

    const events = await prisma.blockchainEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    return NextResponse.json({
      success: true,
      events,
      count: events.length
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch events' 
    }, { status: 500 });
  }
}