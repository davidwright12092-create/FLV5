import { useState, useMemo } from 'react'
import Card, { CardHeader, CardBody } from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import {
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Check,
  X,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  Download,
  UserCheck,
  UserX,
  Key,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// TypeScript interfaces
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'Admin' | 'Manager' | 'User'
  status: 'Active' | 'Inactive' | 'Pending'
  department: string
  avatar?: string
  lastActive: string
  performanceMetrics: {
    totalCalls: number
    avgScore: number
  }
  joinedDate: string
}

export interface UserFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'Admin' | 'Manager' | 'User'
  department: string
  status: 'Active' | 'Inactive' | 'Pending'
  permissions: {
    viewRecordings: boolean
    editRecordings: boolean
    deleteRecordings: boolean
    viewAnalytics: boolean
    manageUsers: boolean
    exportData: boolean
  }
}

// Mock data
const MOCK_USERS: User[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@fieldlink.com',
    phone: '+1 (555) 123-4567',
    role: 'Admin',
    status: 'Active',
    department: 'Sales Management',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastActive: '2 minutes ago',
    performanceMetrics: { totalCalls: 342, avgScore: 94 },
    joinedDate: '2023-01-15',
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@fieldlink.com',
    phone: '+1 (555) 234-5678',
    role: 'Manager',
    status: 'Active',
    department: 'Field Operations',
    avatar: 'https://i.pravatar.cc/150?img=12',
    lastActive: '1 hour ago',
    performanceMetrics: { totalCalls: 289, avgScore: 91 },
    joinedDate: '2023-02-20',
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@fieldlink.com',
    phone: '+1 (555) 345-6789',
    role: 'User',
    status: 'Active',
    department: 'Customer Success',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastActive: '3 hours ago',
    performanceMetrics: { totalCalls: 412, avgScore: 96 },
    joinedDate: '2023-03-10',
  },
  {
    id: '4',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@fieldlink.com',
    phone: '+1 (555) 456-7890',
    role: 'User',
    status: 'Active',
    department: 'Sales',
    avatar: 'https://i.pravatar.cc/150?img=13',
    lastActive: '5 hours ago',
    performanceMetrics: { totalCalls: 267, avgScore: 88 },
    joinedDate: '2023-04-05',
  },
  {
    id: '5',
    firstName: 'Olivia',
    lastName: 'Martinez',
    email: 'olivia.martinez@fieldlink.com',
    phone: '+1 (555) 567-8901',
    role: 'Manager',
    status: 'Active',
    department: 'Training',
    avatar: 'https://i.pravatar.cc/150?img=9',
    lastActive: '1 day ago',
    performanceMetrics: { totalCalls: 198, avgScore: 92 },
    joinedDate: '2023-05-12',
  },
  {
    id: '6',
    firstName: 'David',
    lastName: 'Thompson',
    email: 'david.thompson@fieldlink.com',
    phone: '+1 (555) 678-9012',
    role: 'User',
    status: 'Inactive',
    department: 'Sales',
    avatar: 'https://i.pravatar.cc/150?img=14',
    lastActive: '2 weeks ago',
    performanceMetrics: { totalCalls: 145, avgScore: 85 },
    joinedDate: '2023-06-18',
  },
  {
    id: '7',
    firstName: 'Sophia',
    lastName: 'Lee',
    email: 'sophia.lee@fieldlink.com',
    phone: '+1 (555) 789-0123',
    role: 'User',
    status: 'Active',
    department: 'Customer Success',
    avatar: 'https://i.pravatar.cc/150?img=10',
    lastActive: '30 minutes ago',
    performanceMetrics: { totalCalls: 376, avgScore: 93 },
    joinedDate: '2023-07-22',
  },
  {
    id: '8',
    firstName: 'Robert',
    lastName: 'Anderson',
    email: 'robert.anderson@fieldlink.com',
    phone: '+1 (555) 890-1234',
    role: 'User',
    status: 'Active',
    department: 'Field Operations',
    avatar: 'https://i.pravatar.cc/150?img=15',
    lastActive: '4 hours ago',
    performanceMetrics: { totalCalls: 224, avgScore: 89 },
    joinedDate: '2023-08-14',
  },
  {
    id: '9',
    firstName: 'Isabella',
    lastName: 'Garcia',
    email: 'isabella.garcia@fieldlink.com',
    phone: '+1 (555) 901-2345',
    role: 'Manager',
    status: 'Pending',
    department: 'Sales Management',
    avatar: 'https://i.pravatar.cc/150?img=16',
    lastActive: 'Never',
    performanceMetrics: { totalCalls: 0, avgScore: 0 },
    joinedDate: '2024-09-28',
  },
  {
    id: '10',
    firstName: 'William',
    lastName: 'Taylor',
    email: 'william.taylor@fieldlink.com',
    phone: '+1 (555) 012-3456',
    role: 'User',
    status: 'Active',
    department: 'Sales',
    avatar: 'https://i.pravatar.cc/150?img=17',
    lastActive: '2 days ago',
    performanceMetrics: { totalCalls: 312, avgScore: 90 },
    joinedDate: '2023-09-30',
  },
  {
    id: '11',
    firstName: 'Emma',
    lastName: 'Harris',
    email: 'emma.harris@fieldlink.com',
    phone: '+1 (555) 123-4568',
    role: 'User',
    status: 'Active',
    department: 'Customer Success',
    avatar: 'https://i.pravatar.cc/150?img=20',
    lastActive: '6 hours ago',
    performanceMetrics: { totalCalls: 298, avgScore: 87 },
    joinedDate: '2023-10-08',
  },
  {
    id: '12',
    firstName: 'Alexander',
    lastName: 'Clark',
    email: 'alexander.clark@fieldlink.com',
    phone: '+1 (555) 234-5679',
    role: 'User',
    status: 'Inactive',
    department: 'Field Operations',
    avatar: 'https://i.pravatar.cc/150?img=18',
    lastActive: '1 month ago',
    performanceMetrics: { totalCalls: 89, avgScore: 82 },
    joinedDate: '2023-11-15',
  },
  {
    id: '13',
    firstName: 'Mia',
    lastName: 'Lewis',
    email: 'mia.lewis@fieldlink.com',
    phone: '+1 (555) 345-6780',
    role: 'User',
    status: 'Active',
    department: 'Sales',
    avatar: 'https://i.pravatar.cc/150?img=21',
    lastActive: '1 hour ago',
    performanceMetrics: { totalCalls: 445, avgScore: 95 },
    joinedDate: '2024-01-10',
  },
  {
    id: '14',
    firstName: 'Ethan',
    lastName: 'Walker',
    email: 'ethan.walker@fieldlink.com',
    phone: '+1 (555) 456-7891',
    role: 'Manager',
    status: 'Active',
    department: 'Training',
    avatar: 'https://i.pravatar.cc/150?img=19',
    lastActive: '8 hours ago',
    performanceMetrics: { totalCalls: 176, avgScore: 91 },
    joinedDate: '2024-02-14',
  },
  {
    id: '15',
    firstName: 'Ava',
    lastName: 'Hall',
    email: 'ava.hall@fieldlink.com',
    phone: '+1 (555) 567-8902',
    role: 'User',
    status: 'Pending',
    department: 'Customer Success',
    avatar: 'https://i.pravatar.cc/150?img=23',
    lastActive: 'Never',
    performanceMetrics: { totalCalls: 0, avgScore: 0 },
    joinedDate: '2024-09-29',
  },
]

export default function UserManagementTable() {
  const [users] = useState<User[]>(MOCK_USERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize)
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredUsers.slice(startIndex, startIndex + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  // Statistics
  const activeUsers = users.filter((u) => u.status === 'Active').length
  const totalUsers = users.length

  // Selection handlers
  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUsers(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(paginatedUsers.map((u) => u.id)))
    }
  }

  // Role badge styling
  const getRoleBadge = (role: User['role']) => {
    const styles = {
      Admin: 'bg-gradient-to-r from-brand-purple to-brand-pink text-white',
      Manager: 'bg-gradient-to-r from-brand-blue to-brand-cyan text-white',
      User: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
    }
    return styles[role]
  }

  // Status badge styling
  const getStatusBadge = (status: User['status']) => {
    const styles = {
      Active: 'bg-success-100 text-success-700',
      Inactive: 'bg-gray-100 text-gray-700',
      Pending: 'bg-brand-yellow/20 text-brand-orange',
    }
    return styles[status]
  }

  // Avatar with initials fallback
  const UserAvatar = ({ user }: { user: User }) => {
    const initials = `${user.firstName[0]}${user.lastName[0]}`
    return (
      <div className="relative">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center text-white font-semibold">
            {initials}
          </div>
        )}
        {user.status === 'Active' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success-500 border-2 border-white rounded-full"></div>
        )}
      </div>
    )
  }

  // User actions dropdown
  const UserActionsDropdown = ({ user }: { user: User }) => {
    const isOpen = activeDropdown === user.id

    return (
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(isOpen ? null : user.id)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical size={18} className="text-gray-600" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setActiveDropdown(null)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20">
              <button
                onClick={() => {
                  setEditingUser(user)
                  setShowAddUserModal(true)
                  setActiveDropdown(null)
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
              >
                <Edit size={16} className="text-gray-600" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => setActiveDropdown(null)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
              >
                <Shield size={16} className="text-gray-600" />
                <span>Change Role</span>
              </button>
              <button
                onClick={() => setActiveDropdown(null)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
              >
                <Key size={16} className="text-gray-600" />
                <span>Reset Password</span>
              </button>
              <button
                onClick={() => setActiveDropdown(null)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
              >
                <Eye size={16} className="text-gray-600" />
                <span>View Performance</span>
              </button>
              <div className="border-t border-gray-200 my-1" />
              <button
                onClick={() => setActiveDropdown(null)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
              >
                {user.status === 'Active' ? (
                  <>
                    <UserX size={16} className="text-orange-600" />
                    <span className="text-orange-600">Deactivate</span>
                  </>
                ) : (
                  <>
                    <UserCheck size={16} className="text-success-600" />
                    <span className="text-success-600">Activate</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(user.id)
                  setActiveDropdown(null)
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-error-600"
              >
                <Trash2 size={16} />
                <span>Delete User</span>
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  // Add/Edit User Modal
  const AddUserModal = () => {
    const [formData, setFormData] = useState<UserFormData>({
      firstName: editingUser?.firstName || '',
      lastName: editingUser?.lastName || '',
      email: editingUser?.email || '',
      phone: editingUser?.phone || '',
      role: editingUser?.role || 'User',
      department: editingUser?.department || '',
      status: editingUser?.status || 'Active',
      permissions: {
        viewRecordings: true,
        editRecordings: false,
        deleteRecordings: false,
        viewAnalytics: true,
        manageUsers: false,
        exportData: false,
      },
    })

    if (!showAddUserModal) return null

    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => {
            setShowAddUserModal(false)
            setEditingUser(null)
          }}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" variant="elevated">
            <CardHeader
              title={editingUser ? 'Edit User' : 'Add New User'}
              subtitle={editingUser ? 'Update user information and permissions' : 'Create a new team member account'}
            />
            <CardBody>
              <form className="space-y-6">
                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>

                {/* Contact fields */}
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="email@fieldlink.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  leftIcon={<Mail size={18} />}
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  leftIcon={<Phone size={18} />}
                />

                {/* Role and Department */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                      className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                    >
                      <option value="User">User</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <Input
                    label="Department/Team"
                    placeholder="e.g., Sales"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                {/* Status Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex gap-3">
                    {(['Active', 'Inactive', 'Pending'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormData({ ...formData, status })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.status === status
                            ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {Object.entries({
                      viewRecordings: 'View Recordings',
                      editRecordings: 'Edit Recordings',
                      deleteRecordings: 'Delete Recordings',
                      viewAnalytics: 'View Analytics',
                      manageUsers: 'Manage Users',
                      exportData: 'Export Data',
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions[key as keyof typeof formData.permissions]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: {
                                ...formData.permissions,
                                [key]: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      setShowAddUserModal(false)
                      setEditingUser(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" fullWidth>
                    {editingUser ? 'Save Changes' : 'Add User'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </>
    )
  }

  // Delete Confirmation Modal
  const DeleteConfirmModal = () => {
    if (!showDeleteConfirm) return null

    const user = users.find((u) => u.id === showDeleteConfirm)
    if (!user) return null

    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowDeleteConfirm(null)}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md" variant="elevated">
            <CardHeader title="Delete User" />
            <CardBody>
              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold">
                    {user.firstName} {user.lastName}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => {
                    // Handle delete
                    setShowDeleteConfirm(null)
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </>
    )
  }

  // Empty state
  if (filteredUsers.length === 0 && searchQuery === '' && roleFilter === 'all' && statusFilter === 'all') {
    return (
      <div className="space-y-6">
        <Card variant="elevated" padding="lg">
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center">
              <UserPlus size={36} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Team Members Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by adding your first team member. Manage roles, permissions, and monitor performance all in one place.
            </p>
            <Button variant="primary" onClick={() => setShowAddUserModal(true)}>
              <UserPlus size={20} />
              Add First User
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stats and actions */}
      <Card variant="elevated" padding="lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-brand-cyan to-brand-blue bg-clip-text text-transparent">
                {totalUsers}
              </p>
            </div>
            <div className="border-l border-gray-200 pl-6">
              <p className="text-sm text-gray-600 mb-1">Active Users</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-success-500 to-success-600 bg-clip-text text-transparent">
                {activeUsers}
              </p>
            </div>
            <div className="border-l border-gray-200 pl-6">
              <p className="text-sm text-gray-600 mb-1">Active Rate</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">
                {Math.round((activeUsers / totalUsers) * 100)}%
              </p>
            </div>
          </div>

          {/* Add User Button */}
          <Button variant="primary" onClick={() => setShowAddUserModal(true)}>
            <UserPlus size={20} />
            Add New User
          </Button>
        </div>
      </Card>

      {/* Search and Filters */}
      <Card variant="elevated" padding="lg">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>

          {/* Role Filter */}
          <div className="w-full lg:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="User">User</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-brand-cyan/10 to-brand-blue/10 rounded-xl border border-brand-cyan/20">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm font-medium text-gray-700">
                {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline">
                  <UserCheck size={16} />
                  Activate
                </Button>
                <Button size="sm" variant="outline">
                  <UserX size={16} />
                  Deactivate
                </Button>
                <Button size="sm" variant="outline">
                  <Shield size={16} />
                  Change Role
                </Button>
                <Button size="sm" variant="outline">
                  <Download size={16} />
                  Export
                </Button>
              </div>
              <button
                onClick={() => setSelectedUsers(new Set())}
                className="ml-auto text-sm text-gray-600 hover:text-gray-900"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card variant="elevated" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{user.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900 flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          {user.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          {user.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                        <Shield size={12} />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(user.status)}`}>
                        {user.status === 'Active' && <Check size={12} />}
                        {user.status === 'Inactive' && <X size={12} />}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} className="text-gray-400" />
                        {user.lastActive}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900 font-medium">
                            {user.performanceMetrics.totalCalls} calls
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp size={14} className="text-success-500" />
                          <span className="text-sm font-semibold text-success-600">
                            {user.performanceMetrics.avgScore}% avg
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(user)
                            setShowAddUserModal(true)
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit size={18} className="text-gray-600" />
                        </button>
                        <UserActionsDropdown user={user} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {paginatedUsers.map((user) => (
          <Card key={user.id} variant="elevated" padding="lg">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <UserAvatar user={user} />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{user.department}</p>
                  </div>
                </div>
                <UserActionsDropdown user={user} />
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                  <Shield size={12} />
                  {user.role}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(user.status)}`}>
                  {user.status === 'Active' && <Check size={12} />}
                  {user.status === 'Inactive' && <X size={12} />}
                  {user.status}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail size={14} className="text-gray-400" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone size={14} className="text-gray-400" />
                  {user.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={14} className="text-gray-400" />
                  Last active: {user.lastActive}
                </div>
              </div>

              {/* Performance */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Total Calls</p>
                    <p className="text-lg font-bold text-gray-900">{user.performanceMetrics.totalCalls}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Avg Score</p>
                    <p className="text-lg font-bold text-success-600">{user.performanceMetrics.avgScore}%</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingUser(user)
                    setShowAddUserModal(true)
                  }}
                >
                  <Edit size={16} />
                  Edit
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <Card variant="elevated" padding="lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Empty state for filtered results */}
      {filteredUsers.length === 0 && (searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
        <Card variant="elevated" padding="lg">
          <div className="text-center py-12">
            <Filter size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setRoleFilter('all')
                setStatusFilter('all')
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Modals */}
      <AddUserModal />
      <DeleteConfirmModal />
    </div>
  )
}
