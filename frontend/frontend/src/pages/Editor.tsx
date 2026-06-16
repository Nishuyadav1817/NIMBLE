import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useState } from "react";
import { apiPost } from "../lib/api";

export default function Editor() {
  const [title, setTitle] = useState("");

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: "<p>Start writing...</p>",
  });

  const uploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file || !editor) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const headers: Record<string, string> = {};
      if (typeof window !== 'undefined' && (window as any).Clerk?.session) {
        const token = await (window as any).Clerk.session.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/media/upload`,
        {
          method: "POST",
          body: formData,
          headers,
        }
      );

      const data = await response.json();

      editor
        .chain()
        .focus()
        .setImage({
          src: data.url,
        })
        .run();
    } catch (err) {
      console.error(err);
      alert("Image upload unavailable");
    }
  };

  const publish = async () => {
    if (!editor) return;

    const articleData = {
      title,
      body: editor.getJSON(),
      excerpt: title.substring(0, 100),
    };

    try {
      const result = await apiPost(
        "/api/articles",
        articleData
      );

      console.log(result);
      alert("Article submitted");
    } catch (error) {
      console.error(error);
      alert("Backend not available");
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto" }}>
      <h2>Editor</h2>

      <input
        placeholder="Article title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          fontSize: "18px",
        }}
      />

      <div style={{ marginBottom: "10px" }}>
        <input
          type="file"
          accept="image/*"
          onChange={uploadImage}
        />
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "8px",
          minHeight: "300px",
        }}
      >
        <EditorContent editor={editor} />
      </div>

      <button
        onClick={publish}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "black",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Publish
      </button>
    </div>
  );
}