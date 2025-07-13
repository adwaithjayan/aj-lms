import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { AdminCourseCard } from "./_components/adminCourseCard";

export default async function page() {
  const data = await adminGetCourses();
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold ">Your Courses</h1>
        <Link className={buttonVariants()} href="/admin/courses/create">
          Create Coures
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-7">
        {data.map((d) => (
          <AdminCourseCard data={d} key={d.id} />
        ))}
      </div>
    </>
  );
}
