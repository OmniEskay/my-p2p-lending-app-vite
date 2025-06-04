# PeerLend - P2P Lending Platform

PeerLend is a modern, user-friendly Peer-to-Peer (P2P) Lending Web Application designed to facilitate direct borrowing and lending between individuals, bypassing traditional financial intermediaries. Built with React, Vite, Firebase, and Tailwind CSS, the platform offers secure authentication, an intuitive dashboard, dynamic loan browsing, personalized loan management, and user profile editing.

## Core Features

* **Secure User Authentication:**
    * Sign-up and login functionality using Firebase Authentication (Email/Password, Google Sign-In, Apple Sign-In).
    * User profiles are stored in Cloud Firestore.
* **User Profile Management:**
    * Users can edit their profile information (e.g., display name, primary role, credit score) after logging in.
* **Dashboard Overview:**
    * A comprehensive dashboard displaying platform statistics (e.g., total loan volume, active loans, average interest rates) with visual charts.
    * Personalized user activity summaries (e.g., total offers made, active loans borrowed/lent, total amounts invested/borrowed).
* **Lending Module (For Lenders):**
    * **Create Loan Offers:** Authenticated users (acting as lenders) can create new loan offers, specifying the amount, interest rate, term, and purpose.
    * **Manage Own Offers:** Lenders can view their created offers and cancel them if they are still available.
* **Borrowing Module (For Borrowers):**
    * **Browse Available Loan Offers:** Users can browse loan offers made by lenders, with filtering and pagination.
    * **Accept Loan Offers:** Authenticated users (acting as borrowers) can accept available loan offers, which then transitions the offer into an active loan.
    * **Create Loan Requests:** Authenticated users (acting as borrowers) can submit a request for a loan, detailing their needs (amount, desired rate, term, purpose, credit score). (Lenders would then need a UI to browse/fund these requests - this part of the lender flow for requests is conceptual for now).
* **My Loans Management:**
    * A dedicated section for users to track all their loans (whether as a lender or borrower).
    * Filters to view all, borrowed, lent, or repaid loans.
    * Detailed view of each loan, including principal, interest, term, payment progress, and remaining balance.
    * Borrowers can record payments made towards their active loans.
* **Responsive UI:** Fully responsive design using Tailwind CSS, optimized for a seamless experience on desktop, tablet, and mobile devices.
* **Real-time Updates:** Utilizes Firebase's real-time capabilities (via `onSnapshot`) to keep loan listings and statuses up-to-date.

## Tech Stack

* **Frontend:**
    * React (v18+)
    * Vite (as the build tool and dev server)
    * Tailwind CSS (for utility-first styling)
    * Chart.js (for data visualization on the dashboard)
* **Backend & Database:**
    * Firebase
        * Firebase Authentication (for user management - Email/Password, Google, Apple)
        * Cloud Firestore (as the NoSQL database for storing user profiles, loan offers, loan requests, active loans, etc.)
* **Language:** JavaScript (ES6+)

## Color Palette (Theme)

The application uses a custom color palette defined in `tailwind.config.js`:
* Dark Blue (`#213448`) - Mapped to `textDark`
* Medium Blue (`#547792`) - Mapped to `textLight` and `primary`
* Light Blue-Gray (`#94B4C1`) - Mapped to `palette-light-blue`
* Cream/Off-white (`#ECEFCA`) - Mapped to `palette-cream` (often used for backgrounds)

## File Structure Overview


peerlend-app/├── public/                 # Static assets (e.g., favicon)├── src/│   ├── assets/             # Assets processed by Vite (e.g., SVGs imported in components)│   ├── components/         # Reusable UI components│   │   ├── Auth/           # Auth-specific layout components│   │   ├── Common/         # General UI elements (Button, InputField, Modal, Navbar, Spinner)│   │   └── Loans/          # Loan-specific cards (OfferCard, LoanDetailCard)│   ├── contexts/           # React Context (AuthContext.jsx for user authentication state)│   ├── pages/              # Page-level components (LoginPage, DashboardPage, LendPage, BorrowPage, MyLoansPage, EditProfilePage, CreateLoanRequestPage)│   ├── services/           # Firebase interaction logic (firestoreService.js)│   ├── config/             # Configuration (firebaseConfig.js, constants.js)│   ├── utils/              # Utility functions (formatDate.js)│   ├── App.jsx             # Main application component (routing logic, layout)│   └── main.jsx            # Vite entry point (renders App)│   └── index.css           # Main CSS file with Tailwind directives├── .env.local              # Local environment variables (for Firebase keys - DO NOT COMMIT)├── .gitignore├── index.html              # Main HTML file for Vite├── package.json├── postcss.config.js       # PostCSS configuration for Tailwind├── README.md               # This file├── tailwind.config.js      # Tailwind CSS configuration└── vite.config.js          # Vite configuration
## Setup and Installation

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd peerlend-app
    ```

2.  **Install Dependencies:**
    Make sure you have Node.js (v16 or later recommended) and npm (or Yarn/pnpm) installed.

    The primary dependencies are listed in `package.json`. Running `npm install` (or `yarn install`) will install all of them.

    **Key Dependencies:**
    * `react`, `react-dom`: For building the user interface.
    * `firebase`: Firebase SDK for authentication and Firestore database.
    * `chart.js`, `react-chartjs-2`: For displaying charts on the dashboard.

    **Key Dev Dependencies (for the build process and styling):**
    * `vite`, `@vitejs/plugin-react`: For the development server and build tooling.
    * `tailwindcss`, `postcss`, `autoprefixer`: For Tailwind CSS.
    * `@tailwindcss/postcss`: (If needed, for specific PostCSS integration with Tailwind).
    * `eslint` and related plugins: For code linting.

    **To install all dependencies from `package.json`:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

    **If you were setting up Tailwind CSS from scratch in a new Vite project, you would typically install these dev dependencies:**
    ```bash
    npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss
    # Then initialize Tailwind:
    npx tailwindcss init -p
    ```
    (However, since `tailwind.config.js` and `postcss.config.js` are already provided in this project, simply running `npm install` should suffice after cloning.)

3.  **Set Up Firebase Project:**
    * Go to the [Firebase Console](https://console.firebase.google.com/).
    * Create a new Firebase project or select an existing one.
    * **Add a Web App:** Register a new web application.
    * **Enable Authentication:**
        * Navigate to "Authentication" (Build) -> "Sign-in method".
        * Enable "Email/Password", "Google", and "Apple" providers.
        * For Google, ensure you provide a project support email.
        * For Apple, follow Firebase documentation for Apple Developer setup (requires an Apple Developer account, App ID, Services ID, private key).
    * **Enable Firestore Database:**
        * Navigate to "Firestore Database" (Build) -> "Create database".
        * Start in **Production mode**.
        * Choose a Firestore location.

4.  **Configure Environment Variables for Firebase:**
    * In your Firebase project settings (General tab, under "Your apps"), find your web app's Firebase SDK configuration (`firebaseConfig` object).
    * Create a file named `.env.local` in the root of your `peerlend-app` project.
    * Add your Firebase configuration details to `.env.local`, prefixing each key with `VITE_`:
        ```env
        VITE_FIREBASE_API_KEY="YOUR_API_KEY"
        VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
        VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
        VITE_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
        VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
        VITE_FIREBASE_APP_ID="YOUR_APP_ID"
        # VITE_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID" # Optional for Analytics
        ```
    * Replace `"YOUR_..."` with your actual credentials. This file is typically in `.gitignore`.

5.  **Set Up Firestore Security Rules:**
    * Go to "Firestore Database" -> "Rules" tab.
    * Use the rules provided (e.g., `firestore_rules_peerlend_app_v4.txt` or the latest version discussed). These rules are designed to protect your data while allowing the application's features to function. **Review and test them thoroughly.**

6.  **Create Firestore Indexes:**
    * As you test the application, Firestore might indicate that certain queries require composite indexes.
    * The browser console will usually provide an error message with a direct link to create the missing index in the Firebase console.
    * Common indexes needed:
        * `loanOffers`: (`lenderId` ASC, `createdAt` DESC)
        * `loanOffers`: (`status` ASC, `createdAt` ASC)
        * `loanRequests`: (`borrowerId` ASC, `createdAt` DESC) - if implementing `getMyLoanRequests`
        * `loanRequests`: (`status` ASC, `createdAt` ASC) - if implementing `getOpenLoanRequests`
    * Create these indexes in Firebase Console -> Firestore Database -> Indexes.

## Available Scripts

* **`npm run dev`** (or `yarn dev`): Starts the development server.
* **`npm run build`** (or `yarn build`): Builds the app for production.
* **`npm run preview`** (or `yarn preview`): Serves the production build locally.
* **`npm run lint`** (or `yarn lint`): Lints project files.

## Key Application Components

* **`AuthContext.jsx`**: Manages global authentication state and provides auth functions (including social logins).
* **`firestoreService.js`**: Centralizes all Cloud Firestore interactions.
* **Page Components (`src/pages/`)**: Handle the views for different application sections like `DashboardPage`, `LendPage`, `BorrowPage`, `MyLoansPage`, `EditProfilePage`, `CreateLoanRequestPage`.
* **Common UI Components (`src/components/Common/`)**: Reusable elements like `Button`, `InputField`, `Modal`, `Navbar`.
* **Loan-Specific UI (`src/components/Loans/`)**: `OfferCard` for displaying loan offers, `LoanDetailCard` for active loan details.
