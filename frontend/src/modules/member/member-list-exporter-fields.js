import { MemberModel } from '@/modules/member/member-model'

const { fields } = MemberModel

export default [
  fields.id,
  fields.username,
  fields.email,
  fields.createdAt,
  fields.updatedAt
]
