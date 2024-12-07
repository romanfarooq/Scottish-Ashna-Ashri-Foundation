import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL;

export function SurahTranslationUpload({ surahNumber, onTranslationAdded }) {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [language, setLanguage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef(null);

  const SAMPLE_JSON = [
    {
      ayahNumber: 1,
      text: "Indeed, We have granted you, [O Muhammad], Al-Kawthar.",
    },
    {
      ayahNumber: 2,
      text: "So pray to your Lord and sacrifice [to Him alone].",
    },
    {
      ayahNumber: 3,
      text: "Indeed, your enemy is the one cut off.",
    },
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("Please upload a JSON file");
      return;
    }

    if (!language.trim()) {
      toast.error("Please enter a language");
      return;
    }

    try {
      setUploadLoading(true);

      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);

          if (
            !Array.isArray(jsonData) ||
            jsonData.length === 0 ||
            !jsonData[0].ayahNumber ||
            !jsonData[0].text
          ) {
            toast.error("Invalid JSON format");
            return;
          }

          const response = await fetch(
            `${API_URL}/api/v1/admin/surahs/${surahNumber}/translations`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                language: language.trim(),
                translation: jsonData,
              }),
            },
          );

          const responseData = await response.json();

          if (response.ok) {
            toast.success(`${language} translations added successfully`);
            onTranslationAdded();
            setDialogOpen(false);
            setLanguage("");
          } else {
            toast.error(responseData.message || "Failed to add translations");
          }
        } catch (parseError) {
          toast.error("Error parsing JSON file");
        }
      };

      fileReader.readAsText(file);
    } catch (error) {
      toast.error("Failed to upload translations");
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Upload Translation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-fit" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Upload Surah Translations</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />

          <Input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploadLoading}
          />

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadLoading || !language.trim()}
          >
            {uploadLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Choose JSON File
          </Button>

          <div className="text-sm text-muted-foreground">
            JSON file should be an array of objects with `ayahNumber` and `text`
            properties. Example:
            <div className="mt-2 max-h-52 w-full overflow-auto rounded bg-gray-100 p-2 text-sm">
              <pre>{JSON.stringify(SAMPLE_JSON, null, 2)}</pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
