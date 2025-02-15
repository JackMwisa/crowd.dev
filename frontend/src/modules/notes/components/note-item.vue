<template>
  <article class="border-t border-gray-200 py-4">
    <div class="flex items-center justify-between pb-4">
      <div class="flex items-center">
        <app-avatar
          :entity="entity"
          size="xxs"
          class="h-6 w-6 mr-2"
        />
        <p class="text-2xs leading-5 text-gray-500">
          {{ props.note.createdBy.fullName }} ・
          {{ timeAgo(props.note.createdAt) }}
        </p>
      </div>
      <app-note-dropdown
        v-if="props.note.createdById === currentUser.id"
        :note="props.note"
        @edit="edit()"
        @reload="emit('reload')"
      />
    </div>
    <div
      v-if="!editing"
      class="c-content text-sm leading-5"
      v-html="$sanitize(props.note.body)"
    ></div>
    <app-note-editor
      v-else
      ref="editor"
      :hide-avatar="true"
      :hide-suggestion="true"
      :note="props.note"
      @updated="updated()"
      @cancel="editing = false"
    />
  </article>
</template>

<script>
export default {
  name: 'AppNoteItem'
}
</script>

<script setup>
import {
  defineProps,
  ref,
  defineEmits,
  defineExpose,
  nextTick,
  computed
} from 'vue'
import AppAvatar from '@/shared/avatar/avatar'
import AppNoteDropdown from '@/modules/notes/components/note-dropdown'
import AppNoteEditor from '@/modules/notes/components/note-editor'
import { mapGetters } from '@/shared/vuex/vuex.helpers'
import { formatDateToTimeAgo } from '@/utils/date'

const props = defineProps({
  note: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['reload'])

const { currentUser } = mapGetters('auth')

const timeAgo = formatDateToTimeAgo
const editor = ref(null)
const editing = ref(false)

const entity = computed(() => {
  return {
    avatar: props.note.createdBy.avatarUrl,
    displayName: props.note.createdBy.fullName
  }
})

const edit = () => {
  editing.value = true
  nextTick(() => {
    editor.value.focus()
  })
}

const updated = () => {
  editing.value = false
  emit('reload')
}

defineExpose({ editor })
</script>
