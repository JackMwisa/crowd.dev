import { BaseError } from './baseError'

export enum WebhookState {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  ERROR = 'ERROR',
}

export enum WebhookType {
  GITHUB = 'GITHUB',
  DISCORD = 'DISCORD',
}

export enum DiscordWebsocketEvent {
  MEMBER_ADDED = 'member_added',
  MEMBER_UPDATED = 'member_updated',
  MESSAGE_CREATED = 'message_created',
  MESSAGE_UPDATED = 'message_updated',
}

export interface DiscordWebsocketPayload {
  event: DiscordWebsocketEvent
  data: any
}

export interface GithubWebhookPayload {
  signature: string
  event: string
  data: any
}

export type IncomingWebhookPayload = GithubWebhookPayload

export interface IncomingWebhookData {
  id: string
  tenantId: string
  integrationId: string
  state: WebhookState
  type: WebhookType
  payload: IncomingWebhookPayload
  processedAt: string | null
  error: any | null
  createdAt: string
}

export interface DbIncomingWebhookInsertData {
  tenantId: string
  integrationId: string
  type: WebhookType
  payload: any
}

export class WebhookError extends BaseError {
  public webhookId: string

  constructor(webhookId: string, message: string, origError?: any) {
    super(message, origError)
    this.webhookId = webhookId
  }
}
