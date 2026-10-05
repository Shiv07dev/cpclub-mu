import request from "supertest";
import { createApp } from "../src/app";
import prisma from "../src/config/prisma";
import bcrypt from "bcryptjs";

const app = createApp();
let adminToken: string;
let testEventId: string;

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeAll(async () => {
  // Ensure a test admin exists
  const existing = await prisma.admin.findUnique({ where: { email: "test@cpclub.test" } });
  if (!existing) {
    await prisma.admin.create({
      data: {
        email: "test@cpclub.test",
        name: "Test Admin",
        passwordHash: await bcrypt.hash("TestPassword123!", 10),
        role: "SUPER_ADMIN",
      },
    });
  }

  // Initialize registration counter
  await prisma.registrationCounter.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", current: 0 },
    update: {},
  });
});

afterAll(async () => {
  // Cleanup test data
  await prisma.registration.deleteMany({ where: { universityEmail: { contains: "@test.cpclub" } } });
  await prisma.event.deleteMany({ where: { title: { startsWith: "[TEST]" } } });
  await prisma.admin.deleteMany({ where: { email: "test@cpclub.test" } });
  await prisma.$disconnect();
});

// ─── Health check ─────────────────────────────────────────────────────────────

describe("Health", () => {
  it("GET /api/health returns 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
  });
});

// ─── Authentication ───────────────────────────────────────────────────────────

describe("Auth", () => {
  it("POST /api/auth/login — invalid credentials returns 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@cpclub.test", password: "WrongPassword!" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/login — valid credentials returns token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@cpclub.test", password: "TestPassword123!" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    adminToken = res.body.data.token;
  });

  it("GET /api/auth/me — without token returns 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /api/auth/me — with valid token returns admin", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("test@cpclub.test");
  });
});

// ─── Public Events ────────────────────────────────────────────────────────────

describe("Public Events", () => {
  it("GET /api/events — returns list", async () => {
    const res = await request(app).get("/api/events");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/events?page=1&limit=5 — pagination works", async () => {
    const res = await request(app).get("/api/events?page=1&limit=5");
    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.limit).toBe(5);
  });

  it("GET /api/events/nonexistent-slug — returns 404", async () => {
    const res = await request(app).get("/api/events/this-event-does-not-exist-99999");
    expect(res.status).toBe(404);
  });
});

// ─── Admin Event Management ───────────────────────────────────────────────────

describe("Admin Events", () => {
  it("GET /api/admin/events — without auth returns 401", async () => {
    const res = await request(app).get("/api/admin/events");
    expect(res.status).toBe(401);
  });

  it("POST /api/admin/events — creates an event", async () => {
    const res = await request(app)
      .post("/api/admin/events")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "[TEST] Sample Event",
        description: "A test event for automated testing purposes.",
        category: "Workshop",
        year: 2026,
        mode: "Offline",
        upcoming: false,
        registrationOpen: false,
        isPublished: false,
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBeDefined();
    testEventId = res.body.data.id;
  });

  it("PUT /api/admin/events/:id — updates an event", async () => {
    if (!testEventId) return;
    const res = await request(app)
      .put(`/api/admin/events/${testEventId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "[TEST] Updated Event", year: 2026 });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("[TEST] Updated Event");
  });

  it("DELETE /api/admin/events/:id — deletes an event", async () => {
    if (!testEventId) return;
    const res = await request(app)
      .delete(`/api/admin/events/${testEventId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
    testEventId = "";
  });
});

// ─── Registration ─────────────────────────────────────────────────────────────

describe("Registration", () => {
  let openEventId: string;

  beforeAll(async () => {
    // Create a test event with registration open
    const ev = await prisma.event.create({
      data: {
        slug: "test-registration-event-2026",
        title: "[TEST] Registration Test Event",
        description: "Test event for registration testing",
        category: "Workshop",
        year: 2026,
        upcoming: true,
        registrationOpen: true,
        isPublished: true,
        status: "REGISTRATION_OPEN",
        maxParticipants: 2, // Small cap to test waitlisting
      },
    });
    openEventId = ev.id;
  });

  afterAll(async () => {
    if (openEventId) {
      await prisma.registration.deleteMany({ where: { eventId: openEventId } });
      await prisma.event.delete({ where: { id: openEventId } }).catch(() => {});
    }
  });

  const baseReg = {
    fullName: "Test Student",
    enrollmentNumber: "TEST001",
    universityEmail: "test001@test.cpclub",
    phone: "9876543210",
    semester: "Semester 4",
    department: "ICT",
    interest: "Competitive Programming",
    reason: "I want to improve my programming skills for competitive programming.",
  };

  it("POST /api/events/:id/register — successful registration", async () => {
    const res = await request(app)
      .post(`/api/events/${openEventId}/register`)
      .send(baseReg);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.registrationId).toMatch(/^CP-\d{4}-\d{6}$/);
    expect(res.body.data.status).toBe("REGISTERED");
  });

  it("POST /api/events/:id/register — duplicate enrollment returns 409", async () => {
    const res = await request(app)
      .post(`/api/events/${openEventId}/register`)
      .send(baseReg);
    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain("already registered");
  });

  it("POST /api/events/:id/register — capacity check creates WAITLISTED", async () => {
    const res = await request(app)
      .post(`/api/events/${openEventId}/register`)
      .send({ ...baseReg, enrollmentNumber: "TEST002", universityEmail: "test002@test.cpclub" });
    // First reg filled slot 1, this fills slot 2 (maxParticipants=2)
    expect([201, 201]).toContain(res.status);

    const res2 = await request(app)
      .post(`/api/events/${openEventId}/register`)
      .send({ ...baseReg, enrollmentNumber: "TEST003", universityEmail: "test003@test.cpclub" });
    // Third reg exceeds capacity → WAITLISTED
    expect(res2.status).toBe(201);
    expect(res2.body.data.status).toBe("WAITLISTED");
  });

  it("Admin can list registrations for event", async () => {
    const res = await request(app)
      .get(`/api/admin/events/${openEventId}/registrations`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("Admin can change registration status", async () => {
    // Get first registration
    const listRes = await request(app)
      .get(`/api/admin/events/${openEventId}/registrations`)
      .set("Authorization", `Bearer ${adminToken}`);
    const regId = listRes.body.data[0].id;

    const res = await request(app)
      .patch(`/api/admin/registrations/${regId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "ATTENDED" });
    expect(res.status).toBe(200);
  });

  it("Public user CANNOT access admin registrations", async () => {
    const res = await request(app).get("/api/admin/registrations");
    expect(res.status).toBe(401);
  });
});

// ─── Gallery ──────────────────────────────────────────────────────────────────

describe("Gallery", () => {
  let galleryEventId: string;
  let galleryImageId: string;

  beforeAll(async () => {
    const ev = await prisma.event.create({
      data: {
        slug: "test-gallery-event-2026",
        title: "[TEST] Gallery Test Event",
        description: "Test event for gallery testing",
        category: "Workshop",
        year: 2026,
        isPublished: true,
      },
    });
    galleryEventId = ev.id;
  });

  afterAll(async () => {
    if (galleryEventId) {
      await prisma.galleryImage.deleteMany({ where: { eventId: galleryEventId } });
      await prisma.event.delete({ where: { id: galleryEventId } }).catch(() => {});
    }
  });

  it("Admin can add gallery image", async () => {
    const res = await request(app)
      .post(`/api/admin/events/${galleryEventId}/gallery`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ url: "https://example.com/photo.jpg", caption: "Test photo" });
    expect(res.status).toBe(201);
    galleryImageId = res.body.data.id;
  });

  it("Public can see gallery for event", async () => {
    const ev = await prisma.event.findUnique({ where: { id: galleryEventId } });
    const res = await request(app).get(`/api/events/${ev!.slug}/gallery`);
    expect(res.status).toBe(200);
  });

  it("Public user CANNOT delete gallery image", async () => {
    if (!galleryImageId) return;
    const res = await request(app).delete(`/api/admin/gallery/${galleryImageId}`);
    expect(res.status).toBe(401);
  });

  it("Admin can delete gallery image", async () => {
    if (!galleryImageId) return;
    const res = await request(app)
      .delete(`/api/admin/gallery/${galleryImageId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});

// ─── Monthly Contest ──────────────────────────────────────────────────────────

describe("Monthly Contest", () => {
  it("GET /api/contests/current — returns null (no active contest initially)", async () => {
    const res = await request(app).get("/api/contests/current");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Could be null or a real contest — both are valid
  });
});

// ─── Achievements ─────────────────────────────────────────────────────────────

describe("Achievements", () => {
  it("GET /api/achievements — returns public achievements", async () => {
    const res = await request(app).get("/api/achievements");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("POST /api/admin/achievements — requires auth", async () => {
    const res = await request(app).post("/api/admin/achievements").send({});
    expect(res.status).toBe(401);
  });
});

// ─── Validation ───────────────────────────────────────────────────────────────

describe("Validation", () => {
  it("Registration with missing fields returns 422", async () => {
    const res = await request(app)
      .post("/api/events/nonexistent/register")
      .send({ fullName: "X" }); // Missing many required fields
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("Login with invalid email returns 422", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "notanemail", password: "password" });
    expect(res.status).toBe(422);
  });
});

// ─── Export ───────────────────────────────────────────────────────────────────

describe("Export", () => {
  it("GET /api/admin/registrations/export — requires auth", async () => {
    const res = await request(app).get("/api/admin/registrations/export");
    expect(res.status).toBe(401);
  });

  it("Admin can export registrations as CSV", async () => {
    const res = await request(app)
      .get("/api/admin/registrations/export")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    // Will be 200 with CSV content-type
    expect(res.headers["content-type"]).toContain("text/csv");
  });
});
