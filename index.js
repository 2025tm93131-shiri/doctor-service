const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

/* Health Check */
app.get("/v1/health", (req, res) => {
  res.json({ status: "Doctor Service OK" });
});

/* Create Doctor */
app.post("/v1/doctors", async (req, res) => {
  try {
    const { name, email, phone, department, specialization } = req.body;

    if (!name || !email || !phone || !department) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Required fields missing",
        correlationId: Date.now().toString(),
      });
    }

    const doctor = await prisma.doctor.create({
      data: { name, email, phone, department, specialization },
    });

    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({
      code: "CREATE_FAILED",
      message: err.message,
      correlationId: Date.now().toString(),
    });
  }
});

/* Get Doctors (Filter + Pagination) */
app.get("/v1/doctors", async (req, res) => {
  try {
    let { department = "", page = 1, size = 10 } = req.query;

    page = parseInt(page);
    size = parseInt(size);

    const where = department
      ? { department: { contains: department } }
      : {};

    const total = await prisma.doctor.count({ where });

    const doctors = await prisma.doctor.findMany({
      where,
      skip: (page - 1) * size,
      take: size,
      orderBy: { created_at: "desc" },
    });

    res.json({
      page,
      size,
      total,
      totalPages: Math.ceil(total / size),
      data: doctors,
    });
  } catch (err) {
    res.status(500).json({
      code: "FETCH_FAILED",
      message: err.message,
      correlationId: Date.now().toString(),
    });
  }
});

/* Get Doctor by ID */
app.get("/v1/doctors/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const doctor = await prisma.doctor.findUnique({
      where: { doctor_id: id },
    });

    if (!doctor) {
      return res.status(404).json({
        code: "NOT_FOUND",
        message: "Doctor not found",
        correlationId: Date.now().toString(),
      });
    }

    res.json(doctor);
  } catch (err) {
    res.status(500).json({
      code: "FETCH_ONE_FAILED",
      message: err.message,
      correlationId: Date.now().toString(),
    });
  }
});

/* Update Doctor */
app.put("/v1/doctors/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const updated = await prisma.doctor.update({
      where: { doctor_id: id },
      data: req.body,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({
      code: "UPDATE_FAILED",
      message: err.message,
      correlationId: Date.now().toString(),
    });
  }
});

/* Delete Doctor */
app.delete("/v1/doctors/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.doctor.delete({
      where: { doctor_id: id },
    });

    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({
      code: "DELETE_FAILED",
      message: err.message,
      correlationId: Date.now().toString(),
    });
  }
});


// ================== SCHEDULING ==================

/* Create Slot (with conflict check) */
app.post("/v1/doctors/:id/slots", async (req, res) => {
  try {
    const doctor_id = parseInt(req.params.id);
    const { start_time, end_time } = req.body;

    const overlap = await prisma.doctorSlot.findFirst({
      where: {
        doctor_id,
        AND: [
          { start_time: { lt: new Date(end_time) } },
          { end_time: { gt: new Date(start_time) } },
        ],
      },
    });

    if (overlap) {
      return res.status(400).json({
        code: "SLOT_CONFLICT",
        message: "Time slot overlaps with existing slot",
        correlationId: Date.now().toString(),
      });
    }

    const slot = await prisma.doctorSlot.create({
      data: {
        doctor_id,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
      },
    });

    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({
      code: "SLOT_CREATE_FAILED",
      message: err.message,
      correlationId: Date.now().toString(),
    });
  }
});

/* Get Slots */
app.get("/v1/doctors/:id/slots", async (req, res) => {
  try {
    const doctor_id = parseInt(req.params.id);

    const slots = await prisma.doctorSlot.findMany({
      where: { doctor_id },
      orderBy: { start_time: "asc" },
    });

    res.json(slots);
  } catch (err) {
    res.status(500).json({
      code: "FETCH_SLOTS_FAILED",
      message: err.message,
      correlationId: Date.now().toString(),
    });
  }
});

app.listen(3001, () => {
  console.log("Doctor Service running on port 3001");
});