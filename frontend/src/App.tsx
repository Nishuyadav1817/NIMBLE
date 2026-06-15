import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Article from "./pages/Article";
import Editor from "./pages/Editor";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/article/:slug" element={<Article />} />
      <Route path="/editor" element={<Editor />} />
    </Routes>
  );
}

export default App;