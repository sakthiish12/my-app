"use client";

import SubscriptionManager from './SubscriptionManager';

export default function DashboardSubscriptionSection({ subscription }: { subscription: any }) {
  return <SubscriptionManager subscription={subscription} />;
} 