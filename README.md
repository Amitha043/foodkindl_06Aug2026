# FoodKindl — React + Django Full-Stack Application

A complete starter inspired by the FoodKindl landing-page screenshots.

## Included features

### Public website
- Cinematic dark responsive landing page
- How FoodKindl works
- Product showcase
- Food redistribution section
- Trust and safety section
- Product roadmap
- Waitlist form
- Contact form

### Application
- Email-based registration and login
- JWT authentication
- User profile
- Community posts
- Food invites
- Accept/decline invitation flow
- Surplus-food listings
- Claim food listing
- Dashboard statistics

## Technology

- React
- Vite
- React Router
- Axios
- Django
- Django REST Framework
- Simple JWT
- SQLite for local development

## Quick start

### Backend

```bash
cd backend
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

Then:

```bash
pip install -r requirements.txt
python manage.py makemigrations accounts community website
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`, then:

```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://127.0.0.1:8000
