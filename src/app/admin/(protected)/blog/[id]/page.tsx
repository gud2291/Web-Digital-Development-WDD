import { notFound } from "next/navigation";
import { getBlogById } from "@/server/services/blog.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { BlogForm } from "../BlogForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function EditBlogPage({ params }: PageProps) {
  const doc = await getBlogById(params.id).catch(() => null);
  if (!doc) notFound();

  return (
    <>
      <PageHeader title="Edit blog post" description={doc.title} />
      <BlogForm
        initial={{
          _id: String(doc._id),
          title: doc.title,
          slug: doc.slug,
          excerpt: doc.excerpt ?? "",
          content: doc.content ?? "",
          featuredImage: doc.featuredImage ?? "",
          featuredImageAlt: doc.featuredImageAlt ?? "",
          author: doc.author ?? "Web Digital Development Team",
          authorFollowUrl: doc.authorFollowUrl ?? "",
          category: doc.category ?? "General",
          tags: doc.tags ?? [],
          readTime: doc.readTime ?? 5,
          published: !!doc.published,
          seoTitle: doc.seoTitle ?? "",
          seoDescription: doc.seoDescription ?? "",
        }}
      />
    </>
  );
}
