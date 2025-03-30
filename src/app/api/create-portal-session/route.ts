import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the customer ID from your database
    // This is a simplified example - you should store and retrieve the Stripe customer ID
    // associated with the user in your database
    const customers = await stripe.customers.list({
      email: userId,
      limit: 1,
    });
    
    const customer = customers.data[0];
    
    if (!customer) {
      return NextResponse.json(
        { error: 'No associated Stripe customer found' },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Error creating portal session:', err);
    return NextResponse.json(
      { error: 'Error creating portal session' },
      { status: 500 }
    );
  }
} 