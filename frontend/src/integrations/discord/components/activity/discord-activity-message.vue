<template>
  <app-i18n
    v-if="!channelOnly"
    :code="computedMessage"
    :args="computedArgs"
    :fallback="'entities.activity.fallback'"
    :class="{ truncate: short }"
  ></app-i18n>
  <span
    v-if="
      [
        'message',
        'file_share',
        'channel_joined',
        'channel_left',
        'reaction_added',
        'thread_started'
      ].includes(activity.type) &&
      !short &&
      !channelOnly
    "
    class="inline-block ml-1"
  >
    <span
      v-if="
        !short &&
        !channelOnly &&
        !['channel_joined', 'channel_left'].includes(
          activity.type
        )
      "
    >
      {{
        activity.attributes.forum ||
        activity.attributes.thread
          ? 'in thread'
          : 'in channel'
      }}
    </span>
    <template
      v-if="activity.channel || activity.attributes.channel"
    >
      <span class="text-brand-500 truncate max-w-2xs">
        #{{
          activity.channel || activity.attributes.channel
        }}</span
      >
      <template v-if="activity.attributes.parentChannel">
        <span> -&gt; </span>
        <span class="text-brand-500 truncate max-w-2xs">
          #{{ activity.attributes.parentChannel }}</span
        >
      </template>
    </template>
  </span>
</template>

<script>
import AppI18n from '@/shared/i18n/i18n'
import { computedArgs } from '@/modules/activity/activity.helpers'
export default {
  name: 'AppDiscordActivityMessage',
  components: { AppI18n },
  props: {
    activity: {
      type: Object,
      required: true
    },
    short: {
      type: Boolean,
      required: false,
      default: false
    },
    channelOnly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    computedMessage() {
      if (this.isParentInForum) {
        return `entities.activity.${this.activity.platform}.started_thread`
      }
      if (
        this.activity.type === 'message' &&
        this.activity.parentId
      ) {
        return this.activity.thread
          ? `entities.activity.${this.activity.platform}.replied_thread`
          : `entities.activity.${this.activity.platform}.replied`
      }
      return `entities.activity.${this.activity.platform}.${this.activity.type}`
    },
    computedArgs() {
      return computedArgs(this.activity)
    },
    isParentInForum() {
      return this.activity.type === 'thread_started'
    }
  }
}
</script>
