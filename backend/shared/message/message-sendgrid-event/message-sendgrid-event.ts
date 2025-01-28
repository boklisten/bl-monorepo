export interface SendgridEvent {
  email: string; // email of the recipient
  timestamp: number; // unix timestamp when message was sent
  event:
    | "processed"
    | "dropped"
    | "delivered"
    | "deferred"
    | "bounce"
    | "open"
    | "click"
    | "spam"
    | "report"
    | "unsubscribe"
    | "group unsubscribe"
    | "group resubscribe";
  "smtp-id": string; // unique id attached to the message by the originating system
  useragent: string; // useragent responsible for the event
  sg_event_id: string; // unique id for event
  sg_message_id: string; // unique internal sendgrid id
  reason?: string; // reason if there was an error
  status?: string; // status code string
  response?: string; // full text of the HTTP response error if any
  tls?: boolean; // if it was used TLS encryption or not
  url?: string; // url of where the event originated
  attempt?: number; // the number of times sendgrid has attempted to deliver this message
  category: unknown; // a custom tag for organizing our emails
  type?: string; // indicates wheter the bounce event was a hard bounce (type=bounce) or block (type=block)
}
