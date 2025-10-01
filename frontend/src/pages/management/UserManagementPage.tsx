import { useState } from 'react'
import PageLayout from '../../components/layout/PageLayout'
import Card, { CardHeader, CardBody } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import UserManagementTable from '../../components/management/UserManagementTable'
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  TrendingUp,
  Clock,
  Key,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  RotateCw,
  X,
  Eye,
  EyeOff,
  Crown,
  FileText,
  Download,
} from 'lucide-react'

// TypeScript interfaces
interface TeamMetrics {
  totalUsers: number
  activeUsers: number
  pendingInvites: number
  inactiveUsers: number
}

interface RoleDistribution {
  role: string
  count: number
  color: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: 'content' | 'analytics' | 'admin' | 'export'
}

interface Role {
  id: string
  name: string
  description: string
  userCount: number
  permissions: string[]
  color: string
  isCustom: boolean
}

interface Invitation {
  id: string
  email: string
  role: string
  invitedBy: string
  invitedAt: string
  expiresAt: string
  status: 'pending' | 'expired'
}

// Mock data
const TEAM_METRICS: TeamMetrics = {
  totalUsers: 15,
  activeUsers: 11,
  pendingInvites: 2,
  inactiveUsers: 2,
}

const ROLE_DISTRIBUTION: RoleDistribution[] = [
  { role: 'Admin', count: 1, color: 'from-brand-purple to-brand-pink' },
  { role: 'Manager', count: 4, color: 'from-brand-blue to-brand-cyan' },
  { role: 'User', count: 8, color: 'from-gray-500 to-gray-600' },
  { role: 'Pending', count: 2, color: 'from-brand-yellow to-brand-orange' },
]

const ALL_PERMISSIONS: Permission[] = [
  { id: 'view_recordings', name: 'View Recordings', description: 'Access call recordings and transcripts', category: 'content' },
  { id: 'edit_recordings', name: 'Edit Recordings', description: 'Edit recording metadata and notes', category: 'content' },
  { id: 'delete_recordings', name: 'Delete Recordings', description: 'Permanently delete recordings', category: 'content' },
  { id: 'share_recordings', name: 'Share Recordings', description: 'Share recordings with external users', category: 'content' },
  { id: 'view_analytics', name: 'View Analytics', description: 'Access dashboard and reports', category: 'analytics' },
  { id: 'export_analytics', name: 'Export Analytics', description: 'Download analytics reports', category: 'analytics' },
  { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'Access advanced analytics features', category: 'analytics' },
  { id: 'manage_users', name: 'Manage Users', description: 'Add, edit, and remove team members', category: 'admin' },
  { id: 'manage_roles', name: 'Manage Roles', description: 'Create and modify user roles', category: 'admin' },
  { id: 'manage_billing', name: 'Manage Billing', description: 'Access billing and subscription settings', category: 'admin' },
  { id: 'system_settings', name: 'System Settings', description: 'Configure system-wide settings', category: 'admin' },
  { id: 'export_data', name: 'Export Data', description: 'Export all data in various formats', category: 'export' },
  { id: 'api_access', name: 'API Access', description: 'Use FieldLink API endpoints', category: 'export' },
]

const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access with all permissions',
    userCount: 1,
    permissions: ALL_PERMISSIONS.map(p => p.id),
    color: 'from-brand-purple to-brand-pink',
    isCustom: false,
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Team management and analytics access',
    userCount: 4,
    permissions: ['view_recordings', 'edit_recordings', 'share_recordings', 'view_analytics', 'export_analytics', 'advanced_analytics', 'manage_users'],
    color: 'from-brand-blue to-brand-cyan',
    isCustom: false,
  },
  {
    id: 'user',
    name: 'User',
    description: 'Basic access to recordings and personal analytics',
    userCount: 8,
    permissions: ['view_recordings', 'view_analytics'],
    color: 'from-gray-500 to-gray-600',
    isCustom: false,
  },
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'Read-only access with advanced analytics',
    userCount: 2,
    permissions: ['view_recordings', 'view_analytics', 'export_analytics', 'advanced_analytics', 'export_data'],
    color: 'from-brand-cyan to-brand-teal',
    isCustom: true,
  },
]

const MOCK_INVITATIONS: Invitation[] = [
  {
    id: '1',
    email: 'isabella.garcia@fieldlink.com',
    role: 'Manager',
    invitedBy: 'Sarah Johnson',
    invitedAt: '2024-09-28',
    expiresAt: '2024-10-05',
    status: 'pending',
  },
  {
    id: '2',
    email: 'ava.hall@fieldlink.com',
    role: 'User',
    invitedBy: 'Sarah Johnson',
    invitedAt: '2024-09-29',
    expiresAt: '2024-10-06',
    status: 'pending',
  },
]

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'invitations'>('users')
  const [quickFilter, setQuickFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES)
  const [invitations, setInvitations] = useState<Invitation[]>(MOCK_INVITATIONS)
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  // Create Role Modal
  const CreateRoleModal = () => {
    const [roleName, setRoleName] = useState(editingRole?.name || '')
    const [roleDescription, setRoleDescription] = useState(editingRole?.description || '')
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
      new Set(editingRole?.permissions || [])
    )

    if (!showCreateRoleModal) return null

    const togglePermission = (permissionId: string) => {
      const newPermissions = new Set(selectedPermissions)
      if (newPermissions.has(permissionId)) {
        newPermissions.delete(permissionId)
      } else {
        newPermissions.add(permissionId)
      }
      setSelectedPermissions(newPermissions)
    }

    const permissionsByCategory = {
      content: ALL_PERMISSIONS.filter(p => p.category === 'content'),
      analytics: ALL_PERMISSIONS.filter(p => p.category === 'analytics'),
      admin: ALL_PERMISSIONS.filter(p => p.category === 'admin'),
      export: ALL_PERMISSIONS.filter(p => p.category === 'export'),
    }

    const categoryIcons = {
      content: FileText,
      analytics: TrendingUp,
      admin: Settings,
      export: Download,
    }

    const categoryColors = {
      content: 'from-brand-blue to-brand-cyan',
      analytics: 'from-brand-purple to-brand-pink',
      admin: 'from-brand-orange to-brand-yellow',
      export: 'from-brand-teal to-brand-cyan',
    }

    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => {
            setShowCreateRoleModal(false)
            setEditingRole(null)
          }}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto" variant="elevated">
            <CardHeader
              title={editingRole ? 'Edit Role' : 'Create Custom Role'}
              subtitle={editingRole ? 'Modify role permissions and settings' : 'Define a custom role with specific permissions'}
            />
            <CardBody>
              <form className="space-y-6">
                {/* Role Name */}
                <Input
                  label="Role Name"
                  placeholder="e.g., Team Lead, Sales Rep"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  required
                />

                {/* Role Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    placeholder="Describe what this role can do..."
                    rows={3}
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                  />
                </div>

                {/* Permissions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Permissions ({selectedPermissions.size} selected)
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPermissions(new Set(ALL_PERMISSIONS.map(p => p.id)))}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Select All
                      </button>
                      <span className="text-gray-400">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedPermissions(new Set())}
                        className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {(Object.entries(permissionsByCategory) as [keyof typeof permissionsByCategory, Permission[]][]).map(([category, permissions]) => {
                      const Icon = categoryIcons[category]
                      const color = categoryColors[category]
                      const categorySelected = permissions.filter(p => selectedPermissions.has(p.id)).length

                      return (
                        <div key={category} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
                              <Icon size={16} className="text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 capitalize">{category}</h4>
                              <p className="text-xs text-gray-600">{categorySelected} of {permissions.length} selected</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {permissions.map((permission) => (
                              <label
                                key={permission.id}
                                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.has(permission.id)}
                                  onChange={() => togglePermission(permission.id)}
                                  className="w-4 h-4 mt-0.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                                  <p className="text-xs text-gray-600 mt-0.5">{permission.description}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      setShowCreateRoleModal(false)
                      setEditingRole(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" fullWidth>
                    <CheckCircle size={20} />
                    {editingRole ? 'Save Changes' : 'Create Role'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </>
    )
  }

  // Invite User Modal
  const InviteUserModal = () => {
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('User')

    if (!showInviteModal) return null

    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowInviteModal(false)}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md" variant="elevated">
            <CardHeader
              title="Invite Team Member"
              subtitle="Send an invitation to join your team"
            />
            <CardBody>
              <form className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={18} />}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 font-medium">Invitation Details</p>
                      <p className="text-xs text-blue-700 mt-1">
                        The invitation will expire in 7 days. The recipient will receive an email with instructions to set up their account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setShowInviteModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" fullWidth>
                    <Mail size={20} />
                    Send Invitation
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </>
    )
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple bg-clip-text text-transparent">
              Team Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your team members, roles, and permissions</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowInviteModal(true)}>
              <Mail size={20} />
              Invite User
            </Button>
            <Button variant="primary" onClick={() => setShowInviteModal(true)}>
              <UserPlus size={20} />
              Add User
            </Button>
          </div>
        </div>

        {/* Team Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-brand-cyan to-brand-blue bg-clip-text text-transparent">
                  {TEAM_METRICS.totalUsers}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center">
                <Users size={24} className="text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-success-600">
              <TrendingUp size={16} />
              <span className="font-medium">+12% from last month</span>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Users</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-success-500 to-success-600 bg-clip-text text-transparent">
                  {TEAM_METRICS.activeUsers}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center">
                <CheckCircle size={24} className="text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span>{Math.round((TEAM_METRICS.activeUsers / TEAM_METRICS.totalUsers) * 100)}% activity rate</span>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Invites</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-brand-yellow to-brand-orange bg-clip-text text-transparent">
                  {TEAM_METRICS.pendingInvites}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-yellow to-brand-orange flex items-center justify-center">
                <Clock size={24} className="text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-orange-600">
              <AlertCircle size={16} />
              <span className="font-medium">Awaiting acceptance</span>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Roles Defined</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">
                  {roles.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span>{roles.filter(r => r.isCustom).length} custom roles</span>
            </div>
          </Card>
        </div>

        {/* Role Distribution */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="Team Composition" subtitle="Distribution of users across roles" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {ROLE_DISTRIBUTION.map((item) => (
              <div key={item.role} className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                  <span className="text-2xl font-bold text-white">{item.count}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{item.role}</p>
                <p className="text-xs text-gray-600 mt-0.5">{Math.round((item.count / TEAM_METRICS.totalUsers) * 100)}% of team</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            {[
              { id: 'users', label: 'Users', icon: Users },
              { id: 'roles', label: 'Roles & Permissions', icon: Shield },
              { id: 'invitations', label: 'Invitations', icon: Mail },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Quick Filters */}
            <Card variant="elevated" padding="lg">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Filter size={16} />
                    Quick Filters:
                  </span>
                  {(['all', 'active', 'inactive'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setQuickFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        quickFilter === filter
                          ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter === 'all' ? 'All Users' : filter === 'active' ? 'Active Only' : 'Inactive Only'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">By Role:</span>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                  >
                    <option value="all">All Roles</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* User Management Table */}
            <UserManagementTable />
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Role Management</h3>
                  <p className="text-sm text-gray-600 mt-1">Define roles and their associated permissions</p>
                </div>
                <Button variant="primary" onClick={() => setShowCreateRoleModal(true)}>
                  <Plus size={20} />
                  Create Role
                </Button>
              </div>

              <div className="space-y-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0`}>
                          {role.isCustom ? <Crown size={24} className="text-white" /> : <Shield size={24} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{role.name}</h4>
                            {role.isCustom && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                Custom
                              </span>
                            )}
                            <span className="text-sm text-gray-600">
                              {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{role.description}</p>

                          {/* Permissions Preview */}
                          <div>
                            <p className="text-xs font-semibold text-gray-700 mb-2">
                              Permissions ({role.permissions.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {role.permissions.slice(0, 6).map((permId) => {
                                const perm = ALL_PERMISSIONS.find(p => p.id === permId)
                                return perm ? (
                                  <span
                                    key={permId}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
                                  >
                                    {perm.name}
                                  </span>
                                ) : null
                              })}
                              {role.permissions.length > 6 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                                  +{role.permissions.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingRole(role)
                            setShowCreateRoleModal(true)
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit role"
                        >
                          <Edit size={18} className="text-gray-600" />
                        </button>
                        {role.isCustom && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete the ${role.name} role?`)) {
                                setRoles(roles.filter(r => r.id !== role.id))
                              }
                            }}
                            className="p-2 hover:bg-error-50 rounded-lg transition-colors"
                            title="Delete role"
                          >
                            <Trash2 size={18} className="text-error-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Permission Categories Info */}
            <Card variant="elevated" padding="lg">
              <CardHeader
                title="Permission Categories"
                subtitle="Understanding permission types"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                  <FileText size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Content</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Manage recordings, transcripts, and related content
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                  <TrendingUp size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-purple-900">Analytics</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Access dashboards, reports, and performance metrics
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl">
                  <Settings size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-900">Administration</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Manage users, roles, and system configuration
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-xl">
                  <Download size={20} className="text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-teal-900">Export & API</h4>
                    <p className="text-sm text-teal-700 mt-1">
                      Export data and integrate with external systems
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <div className="space-y-6">
            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Pending Invitations</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage team invitations and track their status</p>
                </div>
                <Button variant="primary" onClick={() => setShowInviteModal(true)}>
                  <Mail size={20} />
                  Send Invitation
                </Button>
              </div>

              {invitations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center">
                    <Mail size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Invitations</h3>
                  <p className="text-gray-600 mb-6">
                    All team members have accepted their invitations or none have been sent yet.
                  </p>
                  <Button variant="primary" onClick={() => setShowInviteModal(true)}>
                    <Mail size={20} />
                    Send First Invitation
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-yellow to-brand-orange flex items-center justify-center">
                            <Mail size={20} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-semibold text-gray-900">{invitation.email}</p>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                invitation.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {invitation.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Shield size={14} />
                                Role: {invitation.role}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users size={14} />
                                Invited by: {invitation.invitedBy}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                Sent: {invitation.invitedAt}
                              </span>
                              <span className="flex items-center gap-1 text-orange-600">
                                <AlertCircle size={14} />
                                Expires: {invitation.expiresAt}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              alert('Resending invitation to ' + invitation.email)
                            }}
                          >
                            <RotateCw size={16} />
                            Resend
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Cancel invitation for ${invitation.email}?`)) {
                                setInvitations(invitations.filter(inv => inv.id !== invitation.id))
                              }
                            }}
                          >
                            <X size={16} />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Invitation Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card variant="elevated" padding="lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-yellow to-brand-orange flex items-center justify-center">
                    <Clock size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{invitations.filter(i => i.status === 'pending').length}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center">
                    <CheckCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-600">Accepted Today</p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-error-500 to-error-600 flex items-center justify-center">
                    <XCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{invitations.filter(i => i.status === 'expired').length}</p>
                    <p className="text-sm text-gray-600">Expired</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Invitation Help */}
            <Card variant="elevated" padding="lg">
              <div className="flex gap-4">
                <AlertCircle size={24} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">About Invitations</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-success-600 flex-shrink-0 mt-0.5" />
                      <span>Invitations expire after 7 days for security</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-success-600 flex-shrink-0 mt-0.5" />
                      <span>You can resend expired invitations to generate a new link</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-success-600 flex-shrink-0 mt-0.5" />
                      <span>Recipients will receive an email with setup instructions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-success-600 flex-shrink-0 mt-0.5" />
                      <span>Cancel invitations anytime before they're accepted</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Modals */}
        <CreateRoleModal />
        <InviteUserModal />
      </div>
    </PageLayout>
  )
}
