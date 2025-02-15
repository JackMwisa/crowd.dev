<template>
  <app-page-wrapper size="full-width">
    <div class="member-list-page">
      <div class="mb-10">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <h4>Organizations</h4>
            <span
              v-if="currentTenant.isTrialPlan"
              class="badge badge--sm badge--light-yellow ml-4"
              >Growth (trial)</span
            >
          </div>
          <div class="flex items-center">
            <router-link
              v-if="hasPermissionToCreate"
              :to="{
                name: 'organizationCreate'
              }"
            >
              <el-button class="btn btn--primary btn--md">
                Add organization
              </el-button>
            </router-link>
          </div>
        </div>
        <div class="text-xs text-gray-500">
          Overview of all organizations that relate to your
          community
        </div>
      </div>

      <app-organization-list-tabs></app-organization-list-tabs>
      <app-organization-list-filter></app-organization-list-filter>
      <app-organization-list-table
        :has-organizations="hasOrganizations"
        :is-page-loading="isPageLoading"
      ></app-organization-list-table>
    </div>
  </app-page-wrapper>
</template>

<script setup>
import AppPageWrapper from '@/shared/layout/page-wrapper.vue'
import AppOrganizationListTabs from '@/modules/organization/components/list/organization-list-tabs.vue'
import AppOrganizationListFilter from '@/modules/organization/components/list/organization-list-filter.vue'
import AppOrganizationListTable from '@/modules/organization/components/list/organization-list-table.vue'
import { OrganizationPermissions } from '../organization-permissions'
import { computed, ref, onMounted } from 'vue'
import {
  mapGetters,
  mapActions
} from '@/shared/vuex/vuex.helpers'
import { OrganizationService } from '../organization-service'

const { currentUser, currentTenant } = mapGetters('auth')
const { doFetch } = mapActions('organization')

const hasPermissionToCreate = computed(
  () =>
    new OrganizationPermissions(
      currentTenant.value,
      currentUser.value
    ).create
)
const hasOrganizations = ref(false)
const isPageLoading = ref(false)

onMounted(async () => {
  isPageLoading.value = true

  await doFetch({
    keepPagination: true
  })

  const organizationsList = await doGetOrganizationsCount()

  hasOrganizations.value = !!organizationsList?.length
  isPageLoading.value = false
})

const doGetOrganizationsCount = async () => {
  try {
    const response = await OrganizationService.list(
      {},
      '',
      1,
      0
    )

    return response.rows
  } catch (e) {
    return null
  }
}
</script>
