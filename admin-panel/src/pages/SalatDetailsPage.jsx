import toast from "react-hot-toast";
import mammoth from "mammoth";
import ReactQuill from "react-quill-new";
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
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export function SalatDetailsPage() {
  const { salatId } = useParams();
  const [salat, setSalat] = useState({
    title: "",
    subTitle: "",
  });
  const [editorValue, setEditorValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/salats/${salatId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSalat({
          title: data.salat.title || "",
          subTitle: data.salat.subTitle || "",
        });
        setEditorValue(data.salat.content || "");
        setHasChanges(false);
      } else {
        toast.error(data.message || "Failed to fetch content");
      }
    } catch (error) {
      toast.error("Failed to fetch content");
    } finally {
      setIsLoading(false);
    }
  }, [salatId]);

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
      const response = await fetch(
        `${API_URL}/api/v1/admin/salats/${salatId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: salat.title,
            subTitle: salat.subTitle,
            content: editorValue,
          }),
        },
      );

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
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "list",
    "indent",
    "direction",
    "align",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-lg bg-white shadow-md">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {salat.title}
            <span className="text-sm pl-3 text-gray-600 font-normal">
              ({salat.subTitle})
            </span>
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
            </label>
          </div>

          <ReactQuill
            value={editorValue}
            onChange={handleChange}
            theme="snow"
            modules={modules}
            formats={formats}
            className="mb-4 rounded-md border"
            placeholder="Write your content here..."
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
