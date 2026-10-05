import prisma from "../config/prisma";
import { NotFoundError } from "../middleware/error";
import { auditService } from "./auditService";

export const galleryService = {
  async getForEvent(eventId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundError("Event");

    return prisma.galleryImage.findMany({
      where: { eventId },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });
  },

  async add(
    eventId: string,
    data: { url: string; thumbnailUrl?: string; caption?: string; altText?: string; isFeatured?: boolean },
    adminId: string
  ) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundError("Event");

    // Get max display order
    const last = await prisma.galleryImage.findFirst({
      where: { eventId },
      orderBy: { displayOrder: "desc" },
    });

    const image = await prisma.galleryImage.create({
      data: {
        eventId,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl ?? null,
        caption: data.caption ?? null,
        altText: data.altText ?? null,
        isFeatured: data.isFeatured ?? false,
        displayOrder: (last?.displayOrder ?? -1) + 1,
      },
    });

    await auditService.log(adminId, "GALLERY_IMAGE_UPLOADED", "GalleryImage", image.id, {
      eventId,
      url: data.url,
    });

    return image;
  },

  async update(id: string, data: { caption?: string; altText?: string; isFeatured?: boolean; displayOrder?: number }) {
    const image = await prisma.galleryImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundError("Gallery image");

    return prisma.galleryImage.update({ where: { id }, data });
  },

  async remove(id: string, adminId: string) {
    const image = await prisma.galleryImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundError("Gallery image");

    await prisma.galleryImage.delete({ where: { id } });
    await auditService.log(adminId, "GALLERY_IMAGE_DELETED", "GalleryImage", id, {
      eventId: image.eventId,
    });
  },

  async reorder(eventId: string, orderedIds: string[]) {
    await Promise.all(
      orderedIds.map((imgId, idx) =>
        prisma.galleryImage.updateMany({
          where: { id: imgId, eventId },
          data: { displayOrder: idx },
        })
      )
    );
  },
};
