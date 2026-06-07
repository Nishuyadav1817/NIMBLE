import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function Article() {
  const { slug } = useParams();

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // dummy editor just for rendering (read-only)
  const editor = useEditor({
    extensions: [StarterKit],
    editable: false,
    content: null,
  });

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);

        const data = await apiGet(`/api/articles/${slug}`);

        setArticle(data);

        // inject content into editor
        if (editor && data?.body) {
          editor.commands.setContent(data.body);
        }

        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, editor]);

  if (loading) {
    return <h2 style={{ padding: 20 }}>Loading article...</h2>;
  }

  if (!article) {
    return (
      <h2 style={{ padding: 20 }}>
        Article not found / backend not connected
      </h2>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto" }}>
      <h1>{article.title}</h1>

      <p style={{ color: "gray", marginBottom: 20 }}>
        {article.excerpt}
      </p>

      <hr />

      {/* REAL RENDERED CONTENT */}
      <div style={{ marginTop: 20 }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}