<template>
  <div class="grid gap-x-12 grid-cols-3">
    <div v-if="showHeader">
      <h6>
        Identities <span class="text-brand-500">*</span>
      </h6>
      <p class="text-gray-500 text-2xs leading-normal mt-1">
        Connect with members' external data sources or
        profiles
      </p>
    </div>
    <div
      class="identities-form"
      :class="showHeader ? 'col-span-2' : 'col-span-3'"
    >
      <div
        v-for="[key, value] in Object.entries(
          identitiesForm
        )"
        :key="key"
        class="border-b border-gray-200 last:border-none"
      >
        <div v-if="findPlatform(key)">
          <el-form-item class="h-14 !flex items-center">
            <div :class="value.imgContainerClass">
              <img
                :src="findPlatform(key).image"
                :alt="findPlatform(key).name"
                class="w-4 h-4"
              />
            </div>
            <el-switch
              v-model="value.enabled"
              :inactive-text="findPlatform(key).name"
              :disabled="editingDisabled(key)"
              @change="
                (newValue) => onSwitchChange(newValue, key)
              "
            />
          </el-form-item>

          <el-form-item
            v-if="value.enabled"
            :prop="`username.${key}`"
            required
            class="mt-1 !mb-6"
          >
            <el-input
              v-model="model.username[key]"
              placeholder="johndoe"
              :disabled="editingDisabled(key)"
              @input="
                (newValue) =>
                  onInputChange(newValue, key, value)
              "
            >
              <template #prepend
                ><span>{{ value.urlPrefix }}</span>
                <span class="text-brand-500"
                  >*</span
                ></template
              >
            </el-input>
            <template #error>
              <div class="el-form-item__error">
                Identity profile is required
              </div>
            </template>
          </el-form-item>
        </div>
      </div>

      <div class="flex items-center justify-between mt-24">
        <div class="flex items-center flex-1">
          <app-platform platform="email" />
          <div class="font-medium text-sm ml-3">
            Email address
          </div>
        </div>
        <el-form-item
          prop="email"
          class="flex-1"
          :rules="[
            {
              type: 'email',
              message: 'Please input correct email address',
              trigger: ['blur', 'change']
            }
          ]"
        >
          <el-input
            v-model="computedModelEmail"
            placeholder="john.doe@gmail.com"
          />
        </el-form-item>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  defineEmits,
  defineProps,
  reactive,
  computed,
  watch
} from 'vue'
import { CrowdIntegrations } from '@/integrations/integrations-config'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => {}
  },
  record: {
    type: Object,
    default: () => {}
  },
  showHeader: {
    type: Boolean,
    default: true
  }
})

const model = computed({
  get() {
    return props.modelValue
  },
  set(newModel) {
    emit('update:modelValue', newModel)
  }
})

const computedModelEmail = computed({
  get() {
    return model.value.email
  },
  set(newEmail) {
    model.value.email = newEmail
  }
})

watch(
  model.value,
  (newValue) => {
    // Handle platform value each time username object is updated
    const platforms = Object.keys(newValue.username || {})

    if (platforms.length) {
      model.value.platform = platforms[0]
    } else if (newValue.email) {
      model.value.platform = 'email'
    } else {
      model.value.platform = null
    }
  },
  { deep: true }
)

const identitiesForm = reactive({
  devto: {
    enabled:
      props.modelValue.username?.devto !== undefined ||
      false,
    urlPrefix: 'dev.to/',
    imgContainerClass:
      'h-8 w-8 rounded flex items-center justify-center text-base bg-gray-100 border border-gray-200'
  },
  discord: {
    enabled:
      props.modelValue.username?.discord !== undefined ||
      false,
    urlPrefix: 'discord.com/',
    imgContainerClass:
      'h-8 w-8 rounded flex items-center justify-center text-base btn--discord cursor-auto hover:cursor-auto'
  },
  github: {
    enabled:
      props.modelValue.username?.github !== undefined ||
      false,
    urlPrefix: 'github.com/',
    imgContainerClass:
      'h-8 w-8 rounded flex items-center justify-center text-base bg-gray-100 border border-gray-200'
  },
  slack: {
    enabled:
      props.modelValue.username?.slack !== undefined ||
      false,
    urlPrefix: 'slack.com/',
    imgContainerClass:
      'h-8 w-8 rounded flex items-center justify-center text-base btn--slack cursor-auto hover:cursor-auto bg-white border border-gray-200'
  },
  twitter: {
    enabled:
      props.modelValue.username?.twitter !== undefined ||
      false,
    urlPrefix: 'twitter.com/',
    imgContainerClass:
      'h-8 w-8 rounded flex items-center justify-center text-base btn--twitter'
  },
  hackernews: {
    enabled:
      props.modelValue.username?.hackernews !== undefined ||
      false,
    urlPrefix: 'news.ycombinator.com/user?id=',
    imgContainerClass:
      'h-8 w-8 rounded flex items-center justify-center text-base btn--hackernews'
  }
})

function findPlatform(platform) {
  return CrowdIntegrations.getConfig(platform)
}

function editingDisabled(platform) {
  return props.record
    ? props.record.activeOn.includes(platform)
    : false
}

function onSwitchChange(value, key) {
  // Add platform to username object
  if (
    (model.value.username?.[key] === null ||
      model.value.username?.[key] === undefined) &&
    value
  ) {
    model.value.username[key] = ''
    return
  }

  // Remove platform from username object
  if (!value) {
    delete model.value.username[key]
    delete model.value.attributes?.url?.[key]
  }

  // Handle platfom and attributes when username profiles are removed
  if (!Object.keys(model.value.username || {}).length) {
    delete model.value.platform
    delete model.value.attributes?.url
  }
}

function onInputChange(newValue, key, value) {
  model.value.attributes = {
    ...props.modelValue.attributes,
    url: {
      ...props.modelValue.attributes?.url,
      [key]: `https://${value.urlPrefix}${newValue}`
    }
  }
}
</script>
