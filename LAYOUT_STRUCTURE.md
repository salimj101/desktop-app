# Layout Structure - Separate Sidebar and Navbar

## Overview
The application now uses a cleaner architecture with separate Sidebar and Navbar components under the `layouts` folder, while keeping the original DashboardPage and RepositoriesPage intact.

## New Structure

### 🏗️ **Layout Components (in `layouts/` folder)**
- **`Sidebar.tsx`** - Left navigation sidebar with collapsible functionality
- **`Navbar.tsx`** - Top header with theme toggle and logout
- **`MainLayout.tsx`** - Orchestrates the layout components

### 📁 **File Organization**
```
src/renderer/src/
├── layouts/
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── Navbar.tsx           # Top header bar
│   └── MainLayout.tsx       # Layout orchestrator
├── components/
│   └── MainContent.tsx      # Page router
├── features/
│   ├── dashboard/
│   │   └── DashboardPage.tsx # Dashboard page (restored)
│   └── repositories/
│       └── RepositoriesPage.tsx # Repositories page (restored)
├── data/
│   ├── mockRepositories.ts      # Mock repository data
│   └── mockRepositoryStatus.ts  # Mock repository status data
└── types/
    └── index.ts                 # All TypeScript interfaces
```

## Component Responsibilities

### **Sidebar Component (`layouts/Sidebar.tsx`)**
- Navigation state management
- Collapsible functionality (16px when collapsed, 256px when expanded)
- Active page highlighting with blue background
- Navigation items: Dashboard, Projects, Repositories, Repo Health, Commits, Todo, Kanban, Public Boards
- Theme-aware styling (dark/light mode)

### **Navbar Component (`layouts/Navbar.tsx`)**
- Theme toggle functionality (Moon icon)
- Logout button handling
- Header branding (GitTracker title)
- Theme-aware styling (dark/light mode)

### **MainLayout Component (`layouts/MainLayout.tsx`)**
- Component orchestration
- Navigation context provider
- Layout structure management
- Flexbox layout with sidebar and main content area

### **MainContent Component (`components/MainContent.tsx`)**
- Page routing based on navigation context
- Renders appropriate page components
- No layout concerns - only content routing

### **Page Components (restored)**
- **DashboardPage**: Full dashboard with stats, search, and repository list
- **RepositoriesPage**: Repository management with search and actions
- Both use mock data from the organized data structure

## Theme Integration

### **Dark Mode Support**
- All components respect the `useTheme` hook
- CSS variables for consistent theming
- Smooth transitions between themes
- Proper contrast and readability

### **Color Scheme**
- **Light Mode**: White backgrounds, gray borders, dark text
- **Dark Mode**: Gray-800 backgrounds, gray-700 borders, light text
- **Accent Colors**: Blue for primary actions, red for logout
- **Status Colors**: Green for active/synced, orange for warnings, red for errors

## Navigation System

### **Navigation Context**
- Global state management for current page
- Sidebar highlights active navigation item
- Easy page switching without prop drilling

### **Page Types**
```typescript
type PageType = 'dashboard' | 'repositories' | 'projects' | 'repoHealth' | 'commits' | 'todo' | 'kanban' | 'publicBoards'
```

## Benefits

### ✅ **Cleaner Architecture**
- **Separation of Concerns**: Each component has one clear purpose
- **Better Maintainability**: Easy to modify individual layout components
- **Reusable Components**: Sidebar and Navbar can be used independently
- **Organized Structure**: Clear file organization

### ✅ **Preserved Functionality**
- **DashboardPage**: All original dashboard features maintained
- **RepositoriesPage**: All original repository features maintained
- **Mock Data**: Organized data structure with proper types
- **Theme Support**: Full dark/light mode integration

### ✅ **Enhanced UI Control**
- **Independent Styling**: Sidebar and Navbar styled separately
- **Flexible Layout**: Easy to modify individual components
- **Responsive Design**: Better control over mobile/desktop layouts
- **Smooth Transitions**: Collapsible sidebar with animations

## Usage

### **Adding New Pages**
1. Create page component in `features/[page-name]/`
2. Add navigation item to `Sidebar.tsx` navigationItems array
3. Add case to `MainContent.tsx` switch statement
4. Import and use existing types from `types/index.ts`

### **Modifying Layout**
1. **Sidebar Changes**: Edit `layouts/Sidebar.tsx`
2. **Header Changes**: Edit `layouts/Navbar.tsx`
3. **Layout Changes**: Edit `layouts/MainLayout.tsx`
4. **Page Changes**: Edit specific page component

### **Updating Data**
1. **Types**: Modify `types/index.ts`
2. **Mock Data**: Update files in `data/` folder
3. **Real Data**: Replace mock data with API calls

## Notes

- **DashboardPage and RepositoriesPage are fully restored** with all original functionality
- **Mock data is organized** in the `data/` folder for easy management
- **Types are centralized** in `types/index.ts` for consistency
- **Theme integration** is maintained across all components
- **Navigation system** provides smooth page switching
- **Layout components** are independent and easily maintainable

## Next Steps

### **Immediate Improvements**
- [ ] Connect mock data to real IPC methods
- [ ] Add loading states to components
- [ ] Implement error handling
- [ ] Add more page types (Projects, Repo Health, etc.)

### **Future Enhancements**
- [ ] Add animations between page transitions
- [ ] Implement breadcrumb navigation
- [ ] Add keyboard shortcuts
- [ ] Create mobile-responsive layouts





