import { PageHeader } from "@/components/admin/PageHeader";
import { getServiceLinkOptions, getBlogLinkOptions } from "@/server/services/relatedLinks";
import { BlogForm } from "../BlogForm";

export const dynamic = "force-dynamic";

export default async function NewBlogPage() {
  const [serviceOptions, blogOptions] = await Promise.all([
    getServiceLinkOptions(),
    getBlogLinkOptions(),
  ]);
  return (
    <>
      <PageHeader title="New blog post" description="Add a new article to the blog." />
      <BlogForm serviceOptions={serviceOptions} blogOptions={blogOptions} />
    </>
  );
}
