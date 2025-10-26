# Dashboard Agent - Setup Guide

## Overview
The Dashboard Agent has been completely redesigned with a NotebookLM-inspired interface featuring:
- **Left Sidebar**: Source files being used
- **Center Panel**: Chat interface with fixed input at bottom
- **Right Sidebar**: Chat history
- **Enhanced Preview**: Fixed HTML preview with download functionality

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies (if not already done)
npm install

# Start the backend server
npm run start:dev
```

The backend should now be running on **http://localhost:3000**

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The frontend should now be running on **http://localhost:5173**

### 3. Create Environment File (Optional)

If you need to change the backend URL, create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000
```

**Note**: The default is already set to `http://localhost:3000`, so this step is optional unless you're running the backend on a different port.

## Key Features

### ✨ New Layout
- **3-column layout** inspired by NotebookLM
- **Fixed chat input** at the bottom (no more scrolling down to type)
- **Responsive design** that collapses sidebars on mobile

### 📄 Source Files Sidebar (Left)
- Shows all relevant documents being used
- Updates automatically as you chat
- Empty state when no files are selected yet

### 💬 Chat History Sidebar (Right)
- View all your previous conversations
- Click to switch between chats
- Shows timestamp and preview of last message
- Auto-refreshes every 10 seconds

### 🎨 Enhanced Preview
- **Better iframe handling** with proper sandbox attributes
- **Download button** to save generated dashboards
- **Refresh button** to reload preview
- **Open in new tab** button for full-screen viewing
- Error recovery with helpful messages

### 🐛 Bug Fixes
- ✅ Fixed "Failed to fetch" errors with proper CORS configuration
- ✅ Better error messages when backend is not running
- ✅ Fixed HTML preview not showing content
- ✅ Chat input now stays at bottom (doesn't scroll away)
- ✅ Auto-resizing textarea for chat input

## Troubleshooting

### "Cannot connect to the backend server" Error

**Problem**: The frontend cannot reach the backend.

**Solutions**:
1. Make sure the backend is running on port 3000:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Check if the backend is accessible:
   ```bash
   curl http://localhost:3000/chat
   ```

3. If you changed the backend port, update the frontend API URL:
   - Edit `frontend/src/api/chat.ts`
   - Or create a `.env` file with `VITE_API_URL=http://localhost:YOUR_PORT`

### Preview Not Showing

**Problem**: HTML dashboard preview is blank.

**Solutions**:
1. Click the **🔄 Refresh** button in the preview
2. Use the **🔗 Open in new tab** button to view in full browser
3. Use the **📥 Download** button to save the HTML file locally
4. Check browser console for any iframe errors

### Chat History Not Loading

**Problem**: Right sidebar shows no chats.

**Solutions**:
1. Ensure backend is running
2. Create a new chat first (click "✨ New chat")
3. Check browser console for API errors

## Architecture Changes

### Backend Changes
- **CORS enabled** for frontend requests
- Supports origins: `http://localhost:5173`, `http://localhost:3000`
- Console logging for startup confirmation

### Frontend Changes
- **New Components**:
  - `SourcesSidebar.tsx` - Shows relevant files
  - `ChatsSidebar.tsx` - Shows chat history with selection
  
- **Updated Components**:
  - `App.tsx` - Completely restructured with 3-column grid
  - `HtmlPreview.tsx` - Added download, better error handling
  - `ChatComposer.tsx` - Auto-resizing textarea with emoji icons
  
- **Enhanced Hooks**:
  - `useChatSession.ts` - Added `loadChat()` for switching chats
  - Better error handling with network detection
  
- **CSS Overhaul**:
  - Modern NotebookLM-style design
  - CSS Grid layout for 3 columns
  - Fixed header and footer positioning
  - Responsive breakpoints

## API Endpoints

The frontend uses these backend endpoints:

- `POST /chat` - Create new chat session
- `POST /chat/ask` - Send message to chat
- `GET /chat/:id/history` - Get chat history and messages
- `GET /chat` - Get all chats (for sidebar)
- `GET /html/:filename` - Serve generated HTML files

## Development Notes

### Default Configuration
- **Backend**: Port 3000
- **Frontend**: Port 5173 (Vite default)
- **API Base URL**: `http://localhost:3000` (hardcoded fallback)

### Hot Reload
Both backend and frontend support hot reload:
- Backend: Uses `npm run start:dev` with Nest.js watch mode
- Frontend: Vite's HMR for instant updates

### Building for Production

```bash
# Frontend
cd frontend
npm run build
# Output: frontend/dist/

# Backend
cd backend
npm run build
# Output: backend/dist/
```

## Browser Support

Tested and working on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

**Note**: Safari may have stricter iframe sandbox policies. Use "Open in new tab" if preview doesn't work.

## Need Help?

If you encounter any issues:

1. **Check the console** (F12) for detailed error messages
2. **Verify backend is running** and accessible
3. **Clear browser cache** and refresh
4. **Check CORS configuration** in `backend/src/main.ts`
5. **Verify file paths** for generated HTML files

## What's Next?

Potential enhancements:
- [ ] Delete chat functionality
- [ ] Export chat history
- [ ] Dark mode toggle
- [ ] File upload for custom documents
- [ ] Real-time collaboration
- [ ] Dashboard templates library

