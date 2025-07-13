"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { courseSchema, CourseSchemaType } from "@/lib/schemas";
import { ApiRes } from "@/lib/types";

export async function editCourse(
  data: CourseSchemaType,
  courseId: string
): Promise<ApiRes> {
  const user = await requireAdmin();
  try {
    const result = courseSchema.safeParse(data);
    if (!result.success) {
      return {
        status: "error",
        message: "Invaild data",
      };
    }

    await prisma.course.update({
      where: {
        id: courseId,
        userId: user.user.id,
      },
      data: {
        ...result.data,
      },
    });
    return {
      status: "success",
      message: "Course updated successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update",
    };
  }
}
