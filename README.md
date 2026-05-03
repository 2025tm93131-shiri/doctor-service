# Doctor & Scheduling Service

##  Overview

This microservice manages doctor information and scheduling within the Hospital Management System.
It provides APIs for doctor CRUD operations, department-based filtering, and slot management with conflict validation.

Doctor & Scheduling Service
•	Provide doctor listings with department-based filtering.
•	Manage and validate doctor slot availability.



##  Features

###  Doctor Management

* Create doctor records
* Retrieve all doctors (with pagination)
* Filter doctors by department
* Get doctor by ID
* Update doctor details
* Delete doctor

###  Scheduling (Slots)

* Create time slots for doctors
* Prevent overlapping slots (conflict detection)
* Retrieve all slots for a doctor

---

Tech Stack

* Node.js
* Express.js
* Prisma ORM
* MySQL

## ⚙️ Setup Instructions
### 1 Install Dependencies


npm install
``

### 2 Configure Database

Update `.env` file:

```
DATABASE_URL="mysql://root:root@localhost:3306/doctordb"
```

 3 Run Migrations

```
npx prisma migrate dev --name init
```

### 4 Load Dataset (CSV)

```
node seed.js
```

### 5 Start Server

```
npx nodemon index.js
```

---



##  API Endpoints

### 🔹 Health Check

```
GET /health
```

---

###  Doctor APIs

#### Create Doctor

```
POST /doctors
```

#### Get All Doctors (Pagination)

```
GET /doctors?page=1&size=5
```

#### Filter by Department

```
GET /doctors?department=Cardiology
```

#### Get Doctor by ID

```
GET /doctors/{id}
```

#### Update Doctor

```
PUT /doctors/{id}
```

#### Delete Doctor

```
DELETE /doctors/{id}
```

---

###  Scheduling APIs

#### Create Slot

```
POST /doctors/{id}/slots
```

Sample Body:

```
{
  "start_time": "2026-05-05T10:00:00.000Z",
  "end_time": "2026-05-05T10:30:00.000Z"
}
```

#### Get Slots

```
GET /doctors/{id}/slots
```

---

## Validation Rules

* Slot duration must be 30 minutes
* Slots must not overlap
* Doctor must exist before slot creation
* Email and phone must be unique


## Notes

* Each microservice has its own database (no shared tables)
* No cross-database joins
* Designed for scalability and loose coupling




