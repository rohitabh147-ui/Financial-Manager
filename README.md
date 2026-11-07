# Financial-Manager
Your Personal Finance Manager with AI driven using Agentic AI layer with ML to create a personal tailored multi-pathway financial plan. More than a general advice, it will analyze risks, different strategies, and visualizes your monthly spendings to help achieve your goals.


# Problem Statement
Conventional financial tools offer budgeting and general advice. They don’t adjust to changes in real life. They don't help users to make a pathway to their goals. This project fills that gap. We're building an AI-powered personal finance manager. It’s powered by an Agentic AI layer. This layer has a picture of a user’s financials. It looks at income, expenses, debt and savings. It estimates risk. Generates a lot of different ways to get to some goals. But the system doesn't end there. It constantly monitors changes in the user’s situation. When income changes or expenses go up, the plan changes. It adjusts the roadmap in due course. The final result is an individualized financial plan. One that evolves with the user. It's not a one size fits all template. A life strategy. Results-oriented design.


# Dataset
- nifty500-nifty500_processed_data.csv
- gold_price_cleaned.csv
- indian_major_20_banks_fd_rates_10_years.csv

  
# Front-end :React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).


## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# Algorithms used for the Back-end are 
- Random Forest classifier
  - Library: scikit-learn, RandomForestClassifier with n_estimators=100.
  - Used for: estimating the probability that a goal is achievable, for the whole goal and for each path.
  - How it works: it builds 100 decision trees on random samples of the data and averages their votes. predict_proba gives the probability of class 1 (achievable).
- Security algorithms
  - bcrypt: hashes passwords with a salt (app/auth.py).
- Data handling
   - Pydantic validation: checks field types and ranges (for example, ge=0, gt=0) in schemas.py and profile_routes.py.
   - UUID: creates a unique ID for each plan.
   - MongoDB upsert: update_one with upsert=True creates a profile the first time and updates it afterwards.


# Limitations
 - Network & IP Whitelisting: MongoDB Atlas only accepts connections from authorized IP addresses on its Access List. If your network/Wi-Fi changes, your connection will fail until the new IP is added.
 - Environment Variable Persistence: PowerShell $env: variables only persist for that specific open terminal session and must be re-entered if you open a new window.
 - Cloud Connectivity Dependency: Because it relies entirely on MongoDB Atlas, the backend cannot perform database operations if there is no active internet connection.


# Databases used in the Back-end
MongoDB Atlas: A cloud-hosted NoSQL document database (Cluster0) configured via your MONGO_URI connection string to store application data (users, financial records, categories, etc.) as JSON-like documents collections.


# Roadmap for the Back-end
- Phase 1 : Foundation & Connectivity (Current)
  Establishing MongoDB Atlas connection, verifying credentials, setting up environment variables (MONGO_URI, JWT_SECRET), and running the FastAPI server locally (uvicorn app.main:app --reload).
- Phase 2 : Authentication & User Management
  Implementing secure user registration, login endpoints, password hashing, and token-based session verification.
- Phase 3 : Core Financial Logic & Endpoints
  Building CRUD operations for tracking income, expenses, budgets, and categories
- Phase 4 : Analytics & Integration
  Connecting the backend API endpoints to your frontend user interface.

  
# Installations implemented for the Back-end
- Core Python Packages (Installed via pip)
- fastapi: The web framework for building your API endpoints.
- pydantic: Used for data validation and schema definitions across your API endpoints

  
# Machine learning Algrothims used
- Python libraries : NumPy , Matplotlib , Pandas , Sckit-learn
- ML Algo - Linear Regression 

# Author
- Rohita Bhattacharya
- Sayan Dey Sarkar
- Sandip Naskar
- Nirnimesh Srivastava
- Priyanshu Prasad



