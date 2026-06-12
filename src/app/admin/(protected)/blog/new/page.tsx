import { PageHeader } from "@/components/admin/PageHeader";
import { BlogForm } from "../BlogForm";

export const dynamic = "force-dynamic";

export default function NewBlogPage() {
  return (
    <>
      <PageHeader title="New blog post" description="Add a new article to the blog." />
      <BlogForm />
    </>
  );
}
