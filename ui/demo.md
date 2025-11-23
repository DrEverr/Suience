# Suience Demo Script

This document provides a step-by-step guide to demo the Suience web application.

## 🚀 Starting the Demo

1. **Launch the Application**

   ```bash
   cd suience/ui
   npm run dev
   ```

   Open page in your browser

2. **Mobile Testing**
   - Open Chrome DevTools (F12)
   - Click the mobile device icon (Ctrl+Shift+M)
   - Select iPhone or Android device simulation

## 📱 Demo Flow

### 1. Welcome Screen

- **Landing Page**: Shows the Suience logo with wave pattern 🌊🔬
- **Tagline**: "Science Flows on Sui"
- **Features Overview**:
  - 🔬 Publish Research
  - 📊 Peer Review  
  - 💾 Store Data
  - 💰 Earn Rewards

### 2. Connect Wallet

- Click "Connect Wallet" button in header
- Show wallet integration (uses Mysten dApp Kit)

### 3. Enter Dashboard

- Click "Enter My Suience" button
- **Dashboard Features**:
  - Publications count
  - Reviews completed
  - SUI rewards earned
  - Active collaborations

### 4. Browse Research Feed

- Click hamburger menu (☰) in top-left corner, then "📰 Research Feed" or
"Browse Research Feed"
- **Feed Features**:
  - Search bar (ready for future functionality)
  - Category filters
  - Call-to-action to upload first research

### 5. Upload New Research

- Click hamburger menu (☰) in top-left corner, then "➕ Upload Research" or
"Upload New Research"
- **Multi-step Process**:
  - **Step 1**: Select research type (Paper, Dataset, etc.)
  - **Step 2**: Fill in details (title, abstract, field, authors)
  - **Step 3**: Upload files (manuscript PDF, data files)
  - **Step 4**: Set permissions (license, collaborators, access control)
- Show progress indicators and validation

### 6. Profile Management

- Click hamburger menu (☰) in top-left corner, then "👤 My Profile"
- If no profile exists, show registration form
- **Registration Demo**:
  - Fill in researcher details
  - Institution and field
  - ORCID integration
  - Bio and background
  - Terms and benefits overview

- **Profile Display**:
  - Default avatar (👤)
  - Institution and location
  - Research statistics (publications, citations)
  - Publications
  - Collaborations
  - Profile details

## 🎯 Key Demo Points

### Mobile-First Design

- **Responsive Layout**: Show how it adapts to different screen sizes
- **Touch-Friendly**: Large buttons and touch targets
- **Hamburger Menu**: Hidden by default, slides from left with smooth animations
- **Smooth Animations**: Gradient buttons, menu transitions, and backdrop blur

### Web3 Integration

- **Wallet Connection**: Demonstrate Sui wallet integration
- **Blockchain Status**: See TODO comments for missing Web3 implementation
- **Data Storage**: Walrus integration for encrypted storage
- **Access Control**: Seal whitelist policy

### User Experience

- **Intuitive Navigation**: Hamburger menu with clear labels and active states
- **Progressive Disclosure**: Multi-step forms with validation
- **Feedback**: Loading states and success messages
- **Accessibility**: High contrast, readable fonts, proper focus management

## 🔧 Technical Demo Points

### Component Architecture

```cmd
App.tsx (Main router)
├── Dashboard.tsx (Research overview)
├── ResearchFeed.tsx (Browse publications)
├── UploadResearch.tsx (Publish workflow)
├── Profile.tsx (User management)
└── RegisterForm.tsx (Onboarding)
```

### State Management

- React hooks for local state
- Type-safe navigation between views
- Form validation and error handling

### Styling

- Radix UI component library
- Custom CSS with Suience branding
- Mobile-responsive design patterns
- Dark theme with Sui colors

## 🌟 Demo Scenarios

### Scenario 1: New Researcher

1. Land on welcome page
2. Connect wallet
3. Click "View My Profile" → No profile exists
4. Fill out registration form
5. Create profile and explore dashboard

### Scenario 2: Experienced User

1. Connect wallet with existing profile
2. Check dashboard stats
3. Browse research feed
4. Upload new research paper
5. Review collaboration opportunities

## 🚧 Current Limitations

### Features Not Implemented

- Real peer review workflow
- Actual citation tracking
- Live collaboration features
- Push notifications
- Offline functionality

---

Science Flows on Sui 🌊🔬
