import toast from "react-hot-toast";
import mammoth from "mammoth";
import ReactQuill, { Quill } from "react-quill-new";
import { SnowTheme } from "quill-color-picker-enhance";
import { useState, useEffect, useCallback } from "react";
import {
  Save,
  RefreshCw,
  AlertCircle,
  FileText,
  Upload,
  Trash2,
} from "lucide-react";
import "react-quill-new/dist/quill.snow.css";
import "quill-color-picker-enhance/dist/index.css";

Quill.register("themes/snow-quill-color-picker-enhance", SnowTheme);

const API_URL = import.meta.env.VITE_API_URL;

export function AboutPage() {
  const [editorValue, setEditorValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/about`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setEditorValue(data.content || "");
        setHasChanges(false);
      } else {
        toast.error(data.message || "Failed to fetch content");
      }
    } catch (error) {
      toast.error("Failed to fetch content");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleChange = (value) => {
    setEditorValue(value);
    setHasChanges(true);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".docx")) {
        toast.error("Please upload only .docx files", {
          icon: <FileText size={24} className="text-red-500" />,
        });
        setUploadedFileName("");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        try {
          const { value } = await mammoth.convertToHtml({ arrayBuffer });
          setEditorValue(value);
          setUploadedFileName(file.name);
          setHasChanges(true);
        } catch (error) {
          console.error("Error converting .docx file", error);
          toast.error("Failed to convert .docx file", {
            icon: <AlertCircle size={24} className="text-red-500" />,
          });
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const clearFile = () => {
    setUploadedFileName("");
  };

  const saveContent = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/about`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editorValue }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Content saved successfully");
        setHasChanges(false);
      } else {
        toast.error(data.message || "Failed to save content");
      }
    } catch (error) {
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }], // Headers
      [{ size: ["small", false, "large", "huge"] }], // Font sizes
      ["bold", "italic", "underline", "strike"], // Text formatting
      [{ color: [] }, { background: [] }], // Text color and background
      [{ script: "sub" }, { script: "super" }], // Subscript and superscript
      [{ list: "ordered" }, { list: "bullet" }], // Lists
      [{ indent: "-1" }, { indent: "+1" }], // Indentation
      [{ direction: "rtl" }], // Text direction (RTL)
      [{ align: [] }], // Text alignment
      ["clean"], // Remove formatting
    ],
  };

  const formats = [
    "header", // Headers
    "size", // Font size
    "bold",
    "italic",
    "underline",
    "strike", // Text formatting
    "color",
    "background", // Text color and background
    "script", // Subscript and superscript
    "list",
    "bullet", // Lists
    "indent", // Indentation
    "direction", // Text direction (RTL)
    "align", // Text alignment
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-lg bg-white shadow-md">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Edit About Us Page
          </h2>
          <button
            onClick={fetchContent}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Reload
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <input
              type="file"
              accept=".docx"
              onChange={handleFileUpload}
              className="hidden"
              id="docx-upload"
            />
            <label
              htmlFor="docx-upload"
              className="flex cursor-pointer items-center gap-2 rounded-md border border-blue-500 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
            >
              <Upload size={16} />
              {uploadedFileName ? "Replace File" : "Upload .docx"}
            </label>
            {uploadedFileName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText size={16} />
                <span>{uploadedFileName}</span>
                <button
                  onClick={clearFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          <ReactQuill
            value={editorValue}
            onChange={handleChange}
            theme="snow-quill-color-picker-enhance"
            modules={modules}
            formats={formats}
            className="mb-4 rounded-md border"
            placeholder="Write your about us content here..."
          />

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setEditorValue("")}
              disabled={!editorValue}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              <Trash2 size={16} />
              Clear
            </button>
            <button
              onClick={saveContent}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save Content"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
