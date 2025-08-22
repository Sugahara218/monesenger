import { SerialData } from '@/hooks/useSearch'
import React from 'react'
import { TimelineItem } from './TimelineItem';

type TimelineProprs ={
    messages:SerialData["messages"];
}

export function Timeline ({messages}:TimelineProprs){
  return (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">想い出のタイムライン</h3>
        <div className="timeline">
        {messages.map((message) => (
            <TimelineItem key={message.id} message={message} />
        ))}
        </div>
    </div>
  );
}
