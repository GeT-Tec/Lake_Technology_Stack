import React from 'react';
import { Button } from '@/components/ui/button';

export const WaitlistButton = () => {
  return (
    <Button onClick={() => console.log('Waitlist clicked')}>
      Join Waitlist
    </Button>
  );
};