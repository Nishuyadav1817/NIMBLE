import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { useNavigate } from "react-router-dom";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
};

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadArticles() {
      try {
        const data = await apiGet("/api/articles");
        setArticles(data || []);
      } catch (err) {
        console.log("API not ready yet");
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, []);

return (
  <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto" }}>
    <h1 style={{ fontSize: "32px" }}>Nimble Articles</h1>
    <p style={{ color: "#666" }}>Read the latest stories</p>

    {loading && <p>Loading articles...</p>}

    {!loading && articles.length === 0 && (
      <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ddd" }}>
        <h3>No articles yet</h3>
        <p>Backend is not connected or no data exists.</p>
      </div>
    )}

    <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
      {articles.map((article) => (
        <div
          key={article.id}
          style={{
            padding: "15px",
            border: "1px solid #eee",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <h2 style={{ margin: 0 }}>{article.title}</h2>
          <p style={{ color: "#666" }}>{article.excerpt}</p>
          <small>slug: {article.slug}</small>
        </div>
      ))}
    </div>
  </div>
);
}