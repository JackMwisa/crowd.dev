<template>
  <div class="inline-select-input">
    <el-dropdown
      :placement="popperPlacement"
      :popper-class="popperClass"
      trigger="click"
      @visible-change="handleDropdownVisibleChange"
    >
      <div class="flex items-center">
        <span class="inline-select-input-prefix mr-1">{{
          prefix
        }}</span>
        <span class="inline-select-input-value">{{
          modelLabel
        }}</span>
        <i
          class="ri-arrow-down-s-line"
          :style="
            dropdownExpanded
              ? 'transform: rotate(180deg)'
              : ''
          "
        ></i>
      </div>
      <template #dropdown>
        <el-dropdown-item
          v-for="option of computedOptions"
          :key="`option-${option.value}`"
          :class="option.selected ? 'is-selected' : ''"
          @click="handleOptionClick(option)"
        >
          {{ option.label }}
        </el-dropdown-item>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  name: 'AppInlineSelectInput'
}
</script>
<script setup>
import {
  defineProps,
  defineEmits,
  ref,
  computed
} from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: null
  },
  options: {
    type: Array,
    default: () => {}
  },
  prefix: {
    type: String,
    default: null
  },
  popperClass: {
    type: String,
    default: null
  },
  popperPlacement: {
    type: String,
    default: 'top-start'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const computedOptions = computed(() => {
  return props.options.map((o) => {
    return {
      ...o,
      selected: o.value === model.value
    }
  })
})
const model = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
    emit('change', value)
  }
})
const modelLabel = computed(() => {
  return props.options.find((o) => o.value === model.value)
    ?.label
})

const dropdownExpanded = ref(false)
const handleDropdownVisibleChange = (value) => {
  dropdownExpanded.value = value
}
const handleOptionClick = (option) => {
  model.value = option.value
}
</script>

<style lang="scss">
.inline-select-input {
  @apply leading-none;
  i {
    transition: transform 0.2s ease;
  }
  &-prefix {
    @apply text-gray-500;
  }
  &-value {
    @apply text-black;
  }
}
</style>
