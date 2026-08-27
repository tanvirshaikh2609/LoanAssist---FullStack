# 🏦 LoanAssist - AI-Powered Loan & Credit Card Eligibility Platform

LoanAssist is an intelligent financial recommendation platform featuring a Django REST Framework backend with machine learning prediction pipelines and a modern, responsive React (Vite + Tailwind CSS) frontend.

---

## 📁 Repository Structure

```
loanassist/
├── backend/                  # Django REST Framework API & ML Models
│   ├── cards/                # Credit card evaluation & recommendation app
│   ├── core/                 # Django core project settings, urls, wsgi, asgi
│   ├── datasets/             # Training datasets (.xlsx)
│   ├── financial_engine/     # Financial calculation & eligibility logic
│   ├── loans/                # Loan evaluation & recommendation app
│   ├── ml_models/            # Scikit-learn trained models (.joblib) & pipelines
│   ├── recommendation_engine/# Custom rule & ML ranking engine
│   ├── users/                # User authentication & profile management
│   ├── .env.example          # Template for backend environment variables
│   ├── .gitignore            # Backend gitignore
│   ├── manage.py             # Django management CLI
│   ├── Procfile              # Web process command for cloud PaaS (Render/Railway/Heroku)
│   ├── requirements.txt      # Python dependencies
│   └── runtime.txt           # Python version specification
│
├── frontend/                 # React + Vite + Tailwind CSS Application
│   ├── public/               # Static assets & icons
│   ├── src/                  # React source code (components, pages, store, etc.)
│   ├── .env.example          # Template for frontend environment variables
│   ├── .gitignore            # Frontend gitignore
│   ├── package.json          # Node dependencies and scripts
│   └── vite.config.js        # Vite configuration
│
├── .env.example              # Master environment configuration template
├── .gitignore                # Root gitignore protecting secrets & build artifacts
└── README.md                 # Project documentation & deployment guide
```

---

## 🔒 Security & Environment Variables

All secrets, database credentials, and environment configuration are decoupled from the code and managed through `.env` files. **Never commit `.env` files to git.**

### Backend Environment Variables (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `SECRET_KEY` | Django cryptographic signing key | Strong random string (Required in production) |
| `DEBUG` | Toggle debug mode (`True` for local, `False` in prod) | `True` |
| `ALLOWED_HOSTS` | Comma-separated allowed hostnames/IPs | `localhost,127.0.0.1,your-app.onrender.com` |
| `USE_SQLITE` | Fast SQLite engine for local dev | `True` |
| `DATABASE_URL` | Full database URL (PostgreSQL) | `postgresql://user:pass@host:5432/dbname` |
| `DB_NAME` | PostgreSQL Database name | `loanassist_db` |
| `DB_USER` | PostgreSQL Username | `postgres` |
| `DB_PASSWORD` | PostgreSQL Password | `your_db_password` |
| `DB_HOST` | PostgreSQL Host | `localhost` |
| `DB_PORT` | PostgreSQL Port | `5432` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend URLs | `http://localhost:5173,https://your-frontend.vercel.app` |
| `CORS_ALLOW_ALL_ORIGINS` | Allow all CORS origins (Dev only) | `False` |

### Frontend Environment Variables (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Description | Local Value | Production Value |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of the backend API | `http://localhost:8000` | `https://your-backend-api.onrender.com` |

---

## 🚀 Local Development Setup

### 1. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run database migrations
python manage.py migrate

# (Optional) Seed initial bank and card data
python manage.py seed_master_data

# Start development server
python manage.py runserver
```
Backend API will be accessible at: `http://127.0.0.1:8000/`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start development server
npm run dev
```
Frontend Web App will be accessible at: `http://localhost:5173/`

---

## 🌐 Production Hosting & Deployment

### Backend Deployment (Render / Railway / Heroku / AWS)

1. **Environment Variables**: Set all environment variables in your hosting dashboard (`SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`).
2. **Build Command**:
   ```bash
   pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
   ```
3. **Start Command**:
   ```bash
   gunicorn core.wsgi:application --log-file -
   ```
   *(Or rely on the included `Procfile`)*

### Frontend Deployment (Vercel / Netlify / Cloudflare Pages)

1. **Root Directory**: `frontend`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://your-deployed-backend-url.com`

---

## 🧪 Testing

Run backend tests:
```bash
cd backend
python manage.py test
```

Run frontend build check:
```bash
cd frontend
npm run build
```
