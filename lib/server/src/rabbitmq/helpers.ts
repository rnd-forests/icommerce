import { v4 as uuidv4 } from 'uuid';
import { Message } from 'amqplib';
import { CloudEvent, Version } from 'cloudevents';

export const constructEvent = <T>(
  eventType: string,
  source: string,
  data: T,
  metadata: { [key: string]: unknown } = {},
): CloudEvent<T> =>
  new CloudEvent<T>({
    id: uuidv4(),
    type: eventType,
    source,
    specversion: '1.0' as Version,
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    data,
    metadata,
  });

export const stringifyMessage = (message: Message | null) => {
  if (!message) return '<empty>';
  const content = JSON.parse(message.content.toString()) as { [key: string]: any };
  return JSON.stringify({ ...message, content });
};
