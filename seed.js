const fs = require("fs");
const csv = require("csv-parser");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const doctors = [];

fs.createReadStream("data/hms_doctors_indian.csv")
  .pipe(csv())
  .on("data", (row) => doctors.push(row))
  .on("end", async () => {
    try {
      for (const row of doctors) {
        try {
          await prisma.doctor.create({
            data: {
              name: row.name,
              email: row.email,
              phone: row.phone,
              department: row.department,
              specialization: row.specialization,
            },
          });
        } catch (err) {
          if (err.code === "P2002") {
            console.log("⚠️ Duplicate skipped:", row.email);
          } else {
            console.error(err);
          }
        }
      }

      console.log("✅ Dataset loaded successfully");
    } catch (err) {
      console.error("❌ Error:", err.message);
    } finally {
      await prisma.$disconnect();
    }
  });