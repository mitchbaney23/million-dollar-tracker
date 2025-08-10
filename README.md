# Million Dollar Tracker

A private money-tracking web application that helps you track your journey to $1 million by analyzing bank statements and categorizing spending patterns.

## Features

- **Google Authentication**: Secure login using Firebase Auth
- **CSV Upload**: Upload bank statements with Date, Description, Amount columns
- **Smart Categorization**: Automatic categorization using keyword matching
- **Swipe Interface**: Tinder-style swiping to categorize uncategorized transactions
- **Data Visualization**: 
  - Progress bar toward $1M goal
  - Pie chart of spending by category
  - Line chart of monthly unnecessary spending vs target
- **Data Storage**: All data stored securely in Firebase Firestore
- **Responsive Design**: Clean Tailwind CSS interface

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth (Google)
- **Database**: Firebase Firestore
- **CSV Parsing**: Papa Parse
- **Swipe Interface**: react-tinder-card
- **Charts**: Recharts
- **Deployment**: Netlify

## Setup Instructions

### 1. Clone and Install

```bash
git clone [repository-url]
cd million-dollar-tracker
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Authentication and add Google as a sign-in provider
3. Create a Firestore database in production mode
4. Copy your Firebase config from Project Settings > General > Your apps

### 3. Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Development Server

```bash
npm run dev
```

## Deployment to Netlify

### Automated Deployment

1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Set environment variables in Netlify dashboard:
   - Go to Site Settings > Environment Variables
   - Add all the VITE_FIREBASE_* variables

### Manual Deployment

```bash
npm run build
# Upload the 'dist' folder to Netlify
```

## CSV Format

Your bank statement CSV should have these columns:
- **Date**: YYYY-MM-DD or MM/DD/YYYY format
- **Description**: Transaction description/merchant name
- **Amount**: Positive or negative numbers

Example:
```csv
Date,Description,Amount
2024-01-15,STARBUCKS COFFEE,-4.50
2024-01-15,SALARY DEPOSIT,3000.00
2024-01-16,GROCERY STORE,-45.23
```

## Usage

1. **Login**: Sign in with your Google account
2. **Upload Data**: Upload your bank statement CSV files
3. **Automatic Categorization**: Transactions are automatically categorized based on keywords
4. **Manual Categorization**: Swipe uncategorized transactions:
   - Swipe Left → "Unnecessary Spending"
   - Swipe Right → "Essential"
5. **View Analytics**: Check your progress and spending patterns on the dashboard

## Categories

- **Essentials**: Groceries, utilities, rent, insurance, medical, gas
- **Investments**: Stocks, bonds, retirement, savings
- **Unnecessary Spending**: Restaurants, entertainment, shopping, coffee

## Security & Privacy

- All data is stored in your personal Firebase project
- No data is shared with third parties
- Google authentication ensures secure access
- Each user's data is completely isolated

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Charts.tsx      # Data visualization
│   ├── CSVUpload.tsx   # File upload component
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Login.tsx       # Authentication
│   ├── Navigation.tsx  # Navigation bar
│   ├── ProtectedRoute.tsx
│   └── SwipeCategories.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/               # Utilities and services
│   ├── categorization.ts
│   ├── firebase.ts
│   └── firestore.ts
└── App.tsx            # Main app component
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and for personal use only.
