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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_URL = import.meta.env.VITE_API_URL;

export function SurahTranslationUpload({ surahNumber, onTranslationAdded }) {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef(null);

  const LANGUAGES = [
    "English",
    "Arabic",
    "Urdu",
    "French",
    "German",
    "Spanish",
    "Turkish",
    "Persian",
    "Chinese",
    "Russian",
    "Indonesian",
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("Please upload a JSON file");
      return;
    }

    if (!selectedLanguage) {
      toast.error("Please select a language");
      return;
    }

    try {
      setUploadLoading(true);

      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);

          // Validate JSON structure
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
                language: selectedLanguage,
                translations: jsonData,
              }),
            },
          );

          const responseData = await response.json();

          if (response.ok) {
            toast.success(
              `${selectedLanguage} translations added successfully`,
            );
            onTranslationAdded();
            setDialogOpen(false);
            setSelectedLanguage("");
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
          <Upload className="mr-2 h-4 w-4" /> Upload Translations
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Surah Translations</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
            disabled={uploadLoading || !selectedLanguage}
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
            properties.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
