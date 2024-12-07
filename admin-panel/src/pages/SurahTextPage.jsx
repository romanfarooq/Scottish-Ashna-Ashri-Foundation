import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Download, Upload, Trash2, SearchIcon } from "lucide-react";
import { SurahTranslationUpload } from "@/components/SurahTranslationUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_URL = import.meta.env.VITE_API_URL;

const SAMPLE_JSON = {
  surahNumber: 108,
  name: "الكوثر",
  englishName: "Al-Kawthar",
  meaning: "The Abundance",
  ayat: [
    {
      ayahNumber: 1,
      text: "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
    },
    {
      ayahNumber: 2,
      text: "فَصَلِّ لِرَبِّكَ وَانْحَرْ",
    },
    {
      ayahNumber: 3,
      text: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ",
    },
  ],
};

export function SurahTextPage() {
  const { surahNumber } = useParams();
  const [surah, setSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedTranslationLanguage, setSelectedTranslationLanguage] = useState(null);
  const jsonUploadRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAyat, setFilteredAyat] = useState([]);

  useEffect(() => {
    fetchSurah();
  }, []);

  useEffect(() => {
    const filtered = surah?.ayat?.filter((ayah) => {
      return ayah.ayahNumber && ayah.ayahNumber.toString().includes(searchTerm);
    });
    setFilteredAyat(filtered);
  }, [searchTerm, surah]);

  const fetchSurah = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/v1/admin/surahs/${surahNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );
      const data = await response.json();
      if (response.ok) {
        setSurah(data.surah);
        setFilteredAyat(data.surah?.ayat);
        if (data.surah.translations?.length > 0) {
          setSelectedTranslationLanguage(data.surah.translations[0].language);
        }
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to fetch Surah.");
    } finally {
      setLoading(false);
    }
  }, [surahNumber]);

  useEffect(() => {
    fetchSurah();
  }, [fetchSurah]);

  const handleExportJSON = () => {
    if (!surah) return;

    const jsonString = JSON.stringify(surah, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Surah_${surah.surahNumber}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);

    toast.success(`Exported ${surah.name} as JSON`);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("Please upload a JSON file");
      return;
    }

    try {
      setUploadLoading(true);

      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);

          if (!jsonData.surahNumber || !jsonData.name || !jsonData.ayat) {
            toast.error("Invalid JSON format");
            return;
          }

          const response = await fetch(
            `${API_URL}/api/v1/admin/surahs/${surahNumber}/ayat`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify(jsonData),
            },
          );

          const responseData = await response.json();

          if (response.ok) {
            toast.success("Surah updated successfully");
            fetchSurah();
          } else {
            toast.error(responseData.message || "Failed to update Surah");
          }
        } catch (parseError) {
          toast.error("Error parsing JSON file");
        }
      };

      fileReader.readAsText(file);
    } catch (error) {
      toast.error("Failed to upload JSON");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAudioUpload = async (ayahNumber, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/surahs/${surahNumber}/ayat/${ayahNumber}/audio`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Audio uploaded successfully!");
        fetchSurah();
      } else {
        toast.error(data.message || "Failed to upload audio.");
      }
    } catch (error) {
      toast.error("Audio upload failed.");
    }
  };

  const handleAudioDelete = async (ayahNumber) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/surahs/${surahNumber}/ayat/${ayahNumber}/audio`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Audio removed successfully!");
        fetchSurah();
      } else {
        toast.error(data.message || "Failed to remove audio.");
      }
    } catch (error) {
      toast.error("Audio removal failed.");
    }
  };

  const handleDeleteTranslation = async (language) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/surahs/${surahNumber}/translations/${language}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Translation deleted successfully");
        fetchSurah();

        if (selectedTranslationLanguage === language) {
          setSelectedTranslationLanguage(
            surah.translations.length > 0
              ? surah.translations[0].language
              : null,
          );
        }
      } else {
        toast.error(data.message || "Failed to delete translation");
      }
    } catch (error) {
      toast.error("Failed to delete translation");
    }
  };

  const findTranslationForAyah = (ayahNumber) => {
    if (!selectedTranslationLanguage || !surah.translations) return null;

    const translation = surah.translations.find(
      (t) => t.language === selectedTranslationLanguage,
    );

    return translation?.translation.find((t) => t.ayahNumber === ayahNumber)
      ?.text;
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
        <p className="ml-4 text-lg font-semibold">Loading Surah...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <Card>
        <CardHeader className="text-center">
          <div className="flex flex-col items-center justify-between space-y-10">
            <div className="flex-grow">
              <CardTitle className="text-2xl font-bold">
                {surah.name} ({surah.englishName})
              </CardTitle>
              <p className="text-muted-foreground">{surah.meaning}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleExportJSON}>
                <Download className="mr-2 h-4 w-4" /> Export JSON
              </Button>
              <Input
                type="file"
                accept=".json"
                className="hidden"
                ref={jsonUploadRef}
                onChange={handleFileUpload}
                disabled={uploadLoading}
              />
              <Button
                variant="outline"
                onClick={() => jsonUploadRef.current?.click()}
                disabled={uploadLoading}
              >
                {uploadLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload JSON
              </Button>
              <SurahTranslationUpload
                surahNumber={surahNumber}
                onTranslationAdded={fetchSurah}
              />
              <div className="flex space-x-4">
                <div className="relative max-w-44 flex-grow">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="Enter Ayah Number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-gray-300 bg-white pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="my-4" />
          {surah.translations && surah.translations.length > 0 && (
            <div className="mb-4 flex items-center space-x-2">
              <Select
                value={selectedTranslationLanguage || ""}
                onValueChange={setSelectedTranslationLanguage}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Translation" />
                </SelectTrigger>
                <SelectContent>
                  {surah.translations.map((translation) => (
                    <SelectItem
                      key={translation.language}
                      value={translation.language}
                    >
                      {translation.language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTranslationLanguage && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() =>
                        handleDeleteTranslation(selectedTranslationLanguage)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete Translation</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
          <div className="space-y-4">
            {!filteredAyat || filteredAyat.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                JSON file should have the following structure:
                <div className="mt-2 max-h-52 w-full overflow-auto rounded bg-gray-100 p-2 text-sm">
                  <pre>{JSON.stringify(SAMPLE_JSON, null, 2)}</pre>
                </div>
              </div>
            ) : (
              filteredAyat.map((ayah) => (
                <div
                  key={ayah.ayahNumber}
                  className="flex flex-col justify-between space-y-4"
                >
                  <div className="flex-grow">
                    <div className="font-arabic text-right text-xl leading-loose rtl:text-right">
                      {ayah.text}
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({ayah.ayahNumber})
                      </span>
                    </div>
                    {selectedTranslationLanguage && (
                      <div className="mt-2 text-left text-base text-muted-foreground">
                        {findTranslationForAyah(ayah.ayahNumber) ||
                          "No translation available"}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    {ayah.audioFileId && (
                      <div className="flex items-center space-x-2">
                        <audio
                          src={`${API_URL}/api/v1/admin/surahs/${surahNumber}/ayat/${ayah.ayahNumber}/audio`}
                          controls
                        />
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      id={`audio-upload-${ayah.ayahNumber}`}
                      onChange={(e) => handleAudioUpload(ayah.ayahNumber, e)}
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={ayah.audioFileId}
                          className="transition-colors duration-200 hover:bg-primary/10"
                          onClick={() =>
                            document
                              .getElementById(`audio-upload-${ayah.ayahNumber}`)
                              .click()
                          }
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload Audio</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/80"
                          disabled={!ayah.audioFileId}
                          onClick={() => handleAudioDelete(ayah.ayahNumber)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove Audio</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
