<template>
  <div class="pt-3">
    <div
      v-if="loading"
      v-loading="loading"
      class="app-page-spinner h-16 !relative !min-h-5"
    ></div>
    <div v-else>
      <!-- Empty State -->
      <app-empty-state-cta
        v-if="!hasIntegrations && !hasMembers"
        icon="ri-contacts-line"
        title="No community members yet"
        description="Please connect with one of our available data sources in order to start pulling data from a certain platform"
        cta-btn="Connect integrations"
        secondary-btn="Add member"
        @cta-click="onCtaClick"
        @secondary-click="onSecondaryBtnClick"
      ></app-empty-state-cta>

      <app-empty-state-cta
        v-else-if="hasIntegrations && !hasMembers"
        icon="ri-contacts-line"
        title="No community members yet"
        description="Please consider that the first members may take a couple of minutes to be displayed"
        :has-warning-icon="true"
      ></app-empty-state-cta>

      <app-empty-state-cta
        v-else-if="hasMembers && !count"
        icon="ri-contacts-line"
        title="No members found"
        description="We couldn't find any results that match your search criteria, please try a different query"
      ></app-empty-state-cta>

      <div v-else>
        <!-- Sorter -->
        <div class="mb-2">
          <app-pagination-sorter
            :page-size="Number(pagination.pageSize)"
            :total="count"
            :current-page="pagination.currentPage"
            :has-page-counter="false"
            module="member"
            position="top"
            @change-sorter="doChangePaginationPageSize"
          />
        </div>

        <!-- Members list -->
        <div class="app-list-table panel">
          <transition name="el-fade-in">
            <div
              v-show="isScrollbarVisible"
              class="absolute z-20 top-0 left-0 w-full"
              @mouseover="onTableMouseover"
              @mouseleave="onTableMouseLeft"
            >
              <el-scrollbar
                id="custom-scrollbar"
                ref="scrollbarRef"
                height="10px"
                always
                @scroll="onCustomScrollbarScroll"
                @pointerdown="onScrollMousedown"
              >
                <div
                  :style="{
                    width: tableWidth,
                    height: '10px'
                  }"
                ></div>
              </el-scrollbar>
            </div>
          </transition>
          <app-member-list-toolbar
            @mouseover="onTableMouseover"
            @mouseleave="onTableMouseLeft"
          ></app-member-list-toolbar>
          <div
            class="-mx-6 -mt-6"
            @mouseover="onTableMouseover"
            @mouseleave="onTableMouseLeft"
          >
            <el-table
              id="members-table"
              ref="table"
              v-loading="loading"
              :data="rows"
              :default-sort="defaultSort"
              row-key="id"
              border
              :row-class-name="rowClass"
              @sort-change="doChangeSort"
              @row-click="handleRowClick"
            >
              <el-table-column
                type="selection"
                width="75"
                fixed
              ></el-table-column>

              <el-table-column
                label="Member"
                prop="displayName"
                width="250"
                sortable
                fixed
              >
                <template #default="scope">
                  <div class="flex items-center text-black">
                    <app-avatar
                      :entity="scope.row"
                      size="sm"
                      class="mr-2"
                    />
                    <span class="font-semibold">{{
                      scope.row.displayName
                    }}</span>
                    <app-member-sentiment
                      :member="scope.row"
                      class="ml-2"
                    />
                    <app-member-badge :member="scope.row" />
                  </div>
                </template>
              </el-table-column>

              <el-table-column
                label="Organization & Title"
                width="220"
              >
                <template #default="scope">
                  <app-member-organizations
                    :member="scope.row"
                    :show-title="true"
                  />
                </template>
              </el-table-column>
              <el-table-column
                v-for="column of extraColumns"
                :key="column.name"
                :prop="column.name"
                :label="column.label"
                :width="column.width || 200"
                :sortable="column.sortable ? 'custom' : ''"
              >
                <template #default="scope">
                  {{
                    column.formatter
                      ? column.formatter(
                          scope.row[column.name]
                        )
                      : scope.row[column.name]
                  }}
                </template>
              </el-table-column>
              <el-table-column
                label="Engagement Level"
                prop="score"
                width="200"
                sortable="custom"
              >
                <template #default="scope">
                  <app-member-engagement-level
                    :member="scope.row"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="Last activity"
                prop="lastActive"
                width="250"
                sortable="custom"
              >
                <template #default="scope">
                  <app-member-last-activity
                    v-if="scope.row.lastActivity"
                    :member="scope.row"
                  />
                </template>
              </el-table-column>
              <el-table-column
                v-if="showReach"
                label="Reach"
                prop="reach.total"
                width="150"
                sortable="custom"
              >
                <template #default="scope">
                  <app-member-reach
                    :member="{
                      ...scope.row,
                      reach: scope.row.reach
                    }"
                  />
                </template>
              </el-table-column>

              <!-- Joined Date -->
              <el-table-column
                label="Joined Date"
                width="200"
                prop="joinedAt"
                sortable
                ><template #default="scope"
                  ><div
                    v-if="scope.row.joinedAt"
                    class="text-gray-900 text-sm"
                  >
                    {{
                      formatDateToTimeAgo(
                        scope.row.joinedAt
                      )
                    }}
                  </div>
                  <span v-else class="text-gray-900"
                    >-</span
                  ></template
                ></el-table-column
              >

              <el-table-column
                label="Identities"
                width="240"
              >
                <template #default="scope">
                  <app-member-channels
                    :member="scope.row"
                  ></app-member-channels>
                </template>
              </el-table-column>

              <el-table-column label="Email" width="240">
                <template #default="scope">
                  <div class="text-sm cursor-auto">
                    <el-tooltip
                      v-if="scope.row.email"
                      :disabled="!scope.row.email"
                      popper-class="custom-identity-tooltip"
                      placement="top"
                    >
                      <template #content
                        ><span
                          >Send email
                          <i
                            v-if="scope.row.email"
                            class="ri-external-link-line text-gray-400"
                          ></i></span
                      ></template>
                      <a
                        class="text-gray-500 hover:!text-brand-500"
                        :href="`mailto:${scope.row.email}`"
                        @click.stop="trackEmailClick"
                        >{{ scope.row.email }}</a
                      >
                    </el-tooltip>
                    <span v-else class="text-gray-500"
                      >-</span
                    >
                  </div>
                </template>
              </el-table-column>

              <el-table-column
                :width="maxTabWidth"
                :label="
                  translate('entities.member.fields.tag')
                "
              >
                <template #default="scope">
                  <app-tag-list :member="scope.row" />
                </template>
              </el-table-column>

              <el-table-column fixed="right">
                <template #default="scope">
                  <div class="table-actions">
                    <app-member-dropdown
                      :member="scope.row"
                    ></app-member-dropdown>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <div v-if="!!count" class="mt-8 px-6">
              <app-pagination
                :total="count"
                :page-size="Number(pagination.pageSize)"
                :current-page="pagination.currentPage || 1"
                module="member"
                @change-current-page="
                  doChangePaginationCurrentPage
                "
                @change-page-size="
                  doChangePaginationPageSize
                "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppMemberListTable'
}
</script>

<script setup>
import { i18n } from '@/i18n'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  defineProps,
  watch
} from 'vue'
import AppMemberListToolbar from '@/modules/member/components/list/member-list-toolbar.vue'
import AppMemberBadge from '../member-badge.vue'
import AppMemberOrganizations from '@/modules/member/components/member-organizations.vue'
import AppMemberDropdown from '../member-dropdown.vue'
import AppMemberChannels from '../member-channels.vue'
import AppMemberReach from '../member-reach.vue'
import AppTagList from '@/modules/tag/components/tag-list.vue'
import AppMemberEngagementLevel from '../member-engagement-level.vue'
import AppMemberLastActivity from '../member-last-activity.vue'
import AppMemberSentiment from '../member-sentiment.vue'
import { formatDateToTimeAgo } from '@/utils/date'

const store = useStore()
const router = useRouter()
const table = ref(null)
const scrollbarRef = ref()
const tableBodyRef = ref()
const tableHeaderRef = ref()
const isScrollbarVisible = ref(false)
const isTableHovered = ref(false)
const isCursorDown = ref(false)

const props = defineProps({
  hasIntegrations: {
    type: Boolean,
    default: () => false
  },
  hasMembers: {
    type: Boolean,
    default: () => false
  },
  isPageLoading: {
    type: Boolean,
    default: () => true
  }
})

const extraColumns = computed(
  () => store.getters['member/activeView']?.columns || []
)

const activeView = computed(
  () => store.getters['member/activeView']
)

const defaultSort = computed(() => {
  if (activeView.value?.sorter) {
    return activeView.value.sorter
  }

  return {
    field: 'lastActive',
    order: 'descending'
  }
})

const integrations = computed(
  () => store.getters['integration/activeList'] || {}
)

const showReach = computed(() => {
  return (
    integrations.value.twitter?.status === 'done' ||
    integrations.value.github?.status === 'done'
  )
})

const rows = computed(() => store.getters['member/rows'])
const count = computed(() => store.state.member.count)
const tableWidth = computed(() => {
  return store.state.member.list.table?.bodyWidth
})
const loading = computed(
  () =>
    store.state.member.list.loading || props.isPageLoading
)

const maxTabWidth = computed(() => {
  let maxTabWidth = 0
  for (const row of rows.value) {
    if (row.tags) {
      const tabWidth = row.tags
        .map((tag) => tag.name.length * 20)
        .reduce((a, b) => a + b, 0)

      if (tabWidth > maxTabWidth) {
        maxTabWidth = tabWidth
      }
    }
  }

  return Math.min(maxTabWidth + 100, 500)
})

const selectedRows = computed(
  () => store.getters['member/selectedRows']
)
const pagination = computed(
  () => store.getters['member/pagination']
)

document.onmouseup = () => {
  // As soon as mouse is released, set scrollbar visibility
  // according to wether the mouse is hovering the table or not
  isScrollbarVisible.value = isTableHovered.value
  isCursorDown.value = false
}

onMounted(async () => {
  if (store.state.integration.count === 0) {
    await store.dispatch('integration/doFetch')
  }
})

// Remove listeners on unmount
onUnmounted(() => {
  tableBodyRef.value?.removeEventListener(
    'scroll',
    onTableBodyScroll
  )
  tableHeaderRef.value?.removeEventListener(
    'scroll',
    onTableHeaderScroll
  )
})

function doChangeSort(sorter) {
  store.dispatch('member/doChangeSort', sorter)
}

function doChangePaginationCurrentPage(currentPage) {
  store.dispatch(
    'member/doChangePaginationCurrentPage',
    currentPage
  )
}

function doChangePaginationPageSize(pageSize) {
  store.dispatch(
    'member/doChangePaginationPageSize',
    pageSize
  )
}

watch(table, (newValue) => {
  if (newValue) {
    store.dispatch('member/doMountTable', table.value)
  }

  // Add scroll events to table, it's not possible to access it from 'el-table'
  // as the overflowed element is within it
  const tableBodyEl = document.querySelector(
    '#members-table .el-scrollbar__wrap'
  )
  const tableHeaderEl = document.querySelector(
    '#members-table .el-table__header-wrapper'
  )

  if (tableBodyEl) {
    tableBodyRef.value = tableBodyEl
    tableBodyRef.value.addEventListener(
      'scroll',
      onTableBodyScroll
    )
  }

  if (tableHeaderEl) {
    tableHeaderEl.style.overflow = 'auto'
    tableHeaderRef.value = tableHeaderEl
    tableHeaderRef.value.addEventListener(
      'scroll',
      onTableHeaderScroll
    )
  }
})

function translate(key) {
  return i18n(key)
}

function rowClass({ row }) {
  const isSelected =
    selectedRows.value.find((r) => r.id === row.id) !==
    undefined

  return isSelected ? 'is-selected' : ''
}

function handleRowClick(row) {
  router.push({
    name: 'memberView',
    params: { id: row.id }
  })
}

function onCtaClick() {
  router.push({
    path: '/integrations'
  })
}

function onSecondaryBtnClick() {
  router.push({
    name: 'memberCreate'
  })
}

// On custom scrollbar scroll, set the table scroll with the same value
const onCustomScrollbarScroll = ({ scrollLeft }) => {
  table.value.setScrollLeft(scrollLeft)
}

// On table body scroll, set the custom scrollbar scroll with the same value
const onTableBodyScroll = () => {
  scrollbarRef.value.setScrollLeft(
    tableBodyRef.value.scrollLeft
  )
}

// On table header scroll, set the custom scrollbar scroll with the same value
const onTableHeaderScroll = () => {
  scrollbarRef.value.setScrollLeft(
    tableHeaderRef.value.scrollLeft
  )
  table.value.setScrollLeft(tableHeaderRef.value.scrollLeft)
}

const onScrollMousedown = () => {
  isCursorDown.value = true
}

const onTableMouseover = () => {
  isTableHovered.value = true
  isScrollbarVisible.value = true
}

const onTableMouseLeft = () => {
  isTableHovered.value = false
  isScrollbarVisible.value = isCursorDown.value
}

const trackEmailClick = () => {
  window.analytics.track('Click Member Contact', {
    channel: 'Email'
  })
}
</script>

<style lang="scss">
// Hide table header scrollbar
#members-table .el-table__header-wrapper {
  // IE, Edge and Firefox
  -ms-overflow-style: none;
  scrollbar-width: none;

  // Chrome, Safari and Opera
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
