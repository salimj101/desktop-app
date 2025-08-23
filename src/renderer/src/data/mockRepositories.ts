import { Repository } from '../types'

export const mockRepositories: Repository[] = [
  {
    _id: '1',
    name: 'a2sv-project',
    description: 'Main development project for A2SV',
    path: 'D:\\Projects\\a2sv-project',
    projectId: 'proj-1',
    projectName: 'A2SV Main Project',
    lastSync: '2 hours ago',
    status: 'inactive'
  },
  {
    _id: '2',
    name: 'a2sv-starter--project-g69',
    description: 'Starter template project for new developers',
    path: 'E:\\a2sv-starter--project-g69',
    projectId: 'proj-2',
    projectName: 'A2SV Starter Template',
    lastSync: '1 day ago',
    status: 'active'
  },
  {
    _id: '3',
    name: 'E-commerce-API',
    description: 'E-commerce backend API implementation',
    path: 'D:\\Projects\\E-commerce-API',
    projectId: 'proj-3',
    projectName: 'E-commerce Backend',
    lastSync: '3 days ago',
    status: 'active'
  }
]

export const mockDashboardStats = {
  totalRepositories: 4,
  totalCommits: 39,
  totalBranches: 14,
  synced: 2,
  unsynced: 2
}
