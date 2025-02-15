<template>
  <div>
    <el-dropdown
      v-if="!isReadOnly"
      trigger="click"
      placement="bottom-end"
      @command="handleCommand"
    >
      <button
        class="el-dropdown-link btn p-1.5 rounder-md hover:bg-gray-200 text-gray-600"
        type="button"
        @click.stop
      >
        <i class="text-xl ri-more-fill"></i>
      </button>
      <template #dropdown>
        <el-dropdown-item
          :command="{
            action: 'memberEdit',
            member
          }"
          class="h-10"
          ><i class="ri-pencil-line text-base mr-2" /><span
            class="text-xs text-gray-900"
            >Edit member</span
          ></el-dropdown-item
        >
        <el-tooltip
          v-if="!member.lastEnriched"
          placement="top"
          content="Member enrichment requires an associated GitHub profile or Email"
          :disabled="!isEnrichmentDisabled"
          popper-class="max-w-[260px]"
        >
          <span>
            <el-dropdown-item
              :command="{
                action: 'memberEnrich',
                member
              }"
              class="h-10 mb-1"
              :disabled="isEnrichmentDisabled"
            >
              <app-svg
                name="enrichment"
                class="max-w-[16px] h-4"
                color="#9CA3AF"
              />
              <span
                class="ml-2 text-xs text-gray-900"
                :class="{
                  'text-gray-400': isEnrichmentDisabled
                }"
                >Enrich member</span
              >
            </el-dropdown-item>
          </span>
        </el-tooltip>
        <el-dropdown-item
          class="h-10"
          :command="{
            action: 'memberMerge',
            member: member
          }"
          ><i class="ri-group-line text-base mr-2" /><span
            class="text-xs text-gray-900"
            >Merge member</span
          ></el-dropdown-item
        >
        <el-dropdown-item
          v-if="!member.attributes.isTeamMember?.default"
          class="h-10"
          :command="{
            action: 'memberMarkAsTeamMember',
            member: member
          }"
          ><i
            class="ri-bookmark-line text-base mr-2"
          /><span class="text-xs text-gray-900"
            >Mark as team member</span
          ></el-dropdown-item
        >
        <el-dropdown-item
          v-if="!member.attributes.isBot?.default"
          class="h-10"
          :command="{
            action: 'memberMarkAsBot',
            member: member
          }"
          ><i class="ri-robot-line text-base mr-2" /><span
            class="text-xs text-gray-900"
            >Mark as bot</span
          ></el-dropdown-item
        >
        <el-divider class="border-gray-200" />
        <el-dropdown-item
          class="h-10"
          :command="{
            action: 'memberDelete',
            member: member
          }"
          ><i
            class="ri-delete-bin-line text-base mr-2 text-red-500"
          /><span class="text-xs text-red-500"
            >Delete member</span
          >
        </el-dropdown-item>
      </template>
    </el-dropdown>
    <app-dialog
      v-model="isMergeDialogOpen"
      title="Merge member"
      size="2extra-large"
      :has-action-btn="true"
    >
      <template #actionBtn>
        <div class="flex gap-4">
          <el-button
            v-if="memberToMerge"
            class="btn btn-md btn-brand--transparent"
            @click="handleChangeMemberClick"
          >
            <i class="ri-refresh-line"></i>
            <span>Change member</span>
          </el-button>
          <el-button
            class="btn btn--md btn--primary"
            :loading="isMergeLoading"
            :disabled="!memberToMerge || isMergeLoading"
            @click="handleMergeClick"
            >Merge members</el-button
          >
        </div></template
      >
      <template #content>
        <div class="p-6 flex relative">
          <div class="grow">
            <app-member-suggestions-details
              :pair="pair"
              @make-primary="handleMakePrimaryClick"
            />
          </div>
          <app-member-selection-dropdown
            v-if="memberToMerge === null"
            :id="primaryMember.id"
            v-model="memberToMerge"
            class="bg-white absolute w-2/5 right-0 inset-y-0 z-10 flex justify-center"
            style="margin-right: 5px"
          />
        </div>
      </template>
    </app-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { MemberService } from '@/modules/member/member-service'
import Message from '@/shared/message/message'
import { MemberPermissions } from '@/modules/member/member-permissions'
import ConfirmDialog from '@/shared/dialog/confirm-dialog.js'
import AppMemberSelectionDropdown from './member-selection-dropdown.vue'
import AppMemberSuggestionsDetails from './suggestions/member-merge-suggestions-details.vue'
import AppSvg from '@/shared/svg/svg.vue'

export default {
  name: 'AppMemberDropdown',
  components: {
    AppMemberSelectionDropdown,
    AppMemberSuggestionsDetails,
    AppSvg
  },
  props: {
    member: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      primaryMember: null,
      memberToMerge: null,
      isMergeDialogOpen: false,
      isMergeLoading: false,
      pair: []
    }
  },
  computed: {
    ...mapGetters({
      currentTenant: 'auth/currentTenant',
      currentUser: 'auth/currentUser'
    }),
    isReadOnly() {
      return (
        new MemberPermissions(
          this.currentTenant,
          this.currentUser
        ).edit === false
      )
    },
    isEnrichmentDisabled() {
      return (
        !this.member.username?.github && !this.member.email
      )
    }
  },
  watch: {
    memberToMerge(newMember, oldMember) {
      // Reset member to merge
      if (!newMember) {
        this.pair = [
          this.primaryMember,
          { username: {}, attributes: {} }
        ]
        // Switch primary member with member to merge
      } else if (newMember?.id === this.primaryMember.id) {
        this.primaryMember = oldMember
        this.pair.reverse()
        // Add new member to member to merge
      } else if (newMember) {
        this.pair = [this.primaryMember, newMember]
      }
    }
  },
  methods: {
    ...mapActions({
      doFetch: 'member/doFetch',
      doFind: 'member/doFind',
      doDestroy: 'member/doDestroy',
      doEnrich: 'member/doEnrich'
    }),
    async doDestroyWithConfirm(id) {
      try {
        await ConfirmDialog({
          type: 'danger',
          title: 'Delete member',
          message:
            "Are you sure you want to proceed? You can't undo this action",
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          icon: 'ri-delete-bin-line'
        })

        return this.doDestroy(id)
      } catch (error) {
        // no
      }
    },
    async handleCommand(command) {
      if (command.action === 'memberDelete') {
        return this.doDestroyWithConfirm(command.member.id)
      } else if (command.action === 'memberEdit') {
        this.$router.push({
          name: 'memberEdit',
          params: {
            id: command.member.id
          }
        })
      } else if (
        command.action === 'memberMarkAsTeamMember'
      ) {
        await MemberService.update(command.member.id, {
          attributes: {
            ...command.member.attributes,
            isTeamMember: {
              default: true
            }
          }
        })
        await this.doFetch({
          filter: {},
          keepPagination: false
        })
        Message.success('Member updated successfully')
        if (this.$route.name === 'member') {
          this.doFetch({
            filter: {},
            keepPagination: true
          })
        } else {
          this.doFind(command.member.id)
        }
      } else if (command.action === 'memberMarkAsBot') {
        await MemberService.update(command.member.id, {
          attributes: {
            ...command.member.attributes,
            isBot: {
              default: true
            }
          }
        })
        await this.doFetch({
          filter: {},
          keepPagination: false
        })
        Message.success('Member updated successfully')
        if (this.$route.name === 'member') {
          this.doFetch({
            filter: {},
            keepPagination: true
          })
        } else {
          this.doFind(command.member.id)
        }
      } else if (command.action === 'memberMerge') {
        this.primaryMember = this.member
        this.pair = [
          this.primaryMember,
          { username: {}, attributes: {} }
        ]
        this.isMergeDialogOpen = true
      } else if (command.action === 'memberEnrich') {
        this.doEnrich(command.member.id)
      } else {
        return this.$router.push({
          name: command.action,
          params: { id: command.member.id }
        })
      }
    },
    handleChangeMemberClick() {
      this.memberToMerge = null
    },
    handleMakePrimaryClick() {
      this.memberToMerge = this.primaryMember
    },
    async handleMergeClick() {
      try {
        this.isMergeLoading = true

        await this.$store.dispatch('member/doMerge', {
          memberToKeep: this.primaryMember,
          memberToMerge: this.memberToMerge
        })

        this.isMergeDialogOpen = false
        this.memberToMerge = null

        // If in member view, fetch member newly merged member
        if (this.$route.name === 'memberView') {
          this.doFind(this.primaryMember.id)
        }
      } catch (error) {
        console.log(error)
        Message.error('There was an error merging members')
      }
      this.isMergeLoading = false
    }
  }
}
</script>

<style lang="scss">
.el-dropdown__popper .el-dropdown__list {
  @apply p-2;
}

// Override divider margin
.el-divider--horizontal {
  @apply my-2;
}
</style>
