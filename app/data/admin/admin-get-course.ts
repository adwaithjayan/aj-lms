import "server-only";
import { requireAdmin } from "./require-admin";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export async function adminGetCourse(id: string) {
  await requireAdmin();

  const data = await prisma.course.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      duration: true,
      price: true,
      slug: true,
      smallDescription: true,
      status: true,
      category: true,
      level: true,
      fileKey: true,
      chapter: {
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            select: {
              id: true,
              description: true,
              thumbnailKey: true,
              position: true,
              videoKey: true,
            },
          },
        },
      },
    },
  });
  if (!data) {
    return notFound();
  }

  return data;
}

export type AdminSingleCourseType = Awaited<ReturnType<typeof adminGetCourse>>;
