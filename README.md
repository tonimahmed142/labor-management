# Labor Management

A lightweight labor management system to manage employees, shifts, time tracking, payroll, and reporting. Intended as a starter template for small businesses and teams.

## Features
- Employee profiles, roles and permissions
- Shift scheduling and swap requests
- Clock-in / clock-out time tracking
- Overtime and payroll calculation
- Attendance and payroll reports (CSV / PDF)
- RESTful API and simple web UI
- Audit logs and basic notifications

## Tech stack (suggested)
- Backend: Node.js (Express) / Python (FastAPI) / Ruby (Rails)
- Database: PostgreSQL / MySQL
- Frontend: React / Vue
- Auth: JWT or session-based auth
- Optional: Redis for queueing & caching

## Quick start (Node.js example)

Prerequisites:
- Node.js >= 16
- PostgreSQL

Install and run:
```bash
git clone <repo-url>
cd labor-management
cp .env.example .env
# edit .env to set DATABASE_URL and SECRET
npm install
npm run migrate   # runs DB migrations
npm run seed      # optional: seed sample data
npm run dev       # start development server
```

Docker:
```bash
docker-compose up --build
```

## Example .env
```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/labormanagement
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## Database (core tables)
- users (id, name, email, role_id, hired_at, active)
- roles (id, name, permissions JSON)
- employees (id, user_id, employee_number, position, pay_rate)
- shifts (id, employee_id, start_at, end_at, status)
- time_logs (id, employee_id, shift_id, clock_in, clock_out, total_minutes)
- payrolls (id, employee_id, period_start, period_end, gross, taxes, net)
- audit_logs (id, user_id, action, resource, created_at)

## API (examples)
- POST /api/auth/login — authenticate and receive JWT
- GET /api/employees — list employees
- POST /api/employees — create employee
- GET /api/shifts — list shifts
- POST /api/shifts — create shift
- POST /api/time/clock-in — clock in
- POST /api/time/clock-out — clock out
- GET /api/payrolls?start=YYYY-MM-DD&end=YYYY-MM-DD

Use Authorization: Bearer <token> for protected routes.

## Payroll rules (example)
- Regular hours up to 40 per week at base pay_rate
- Overtime = 1.5x base pay for hours beyond 40/week
- Rounding: minutes rounded to nearest 15-minute increment for payroll

## Testing
- Unit tests: npm test
- Integration: test database separate from development database
- Use CI to run tests and linting on pull requests

## Contributing
- Fork the repo, create a feature branch, and open a pull request
- Follow repository code style and include tests for new features
- Use descriptive commit messages and small, focused PRs

## Roadmap / Ideas
- Mobile clock-in app with GPS/QR validation
- Advanced scheduling (recurring shifts, shift templates)
- Integrations: payroll providers, calendar sync (Google/Outlook)
- Role-based dashboards and data exports

## License
MIT — see LICENSE file.

## Contact
Project maintainer: `maintainer@example.com`
