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
  const [selectedTranslationLanguage, setSelectedTranslationLanguage] =
    useState(null);
  const jsonUploadRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAyat, setFilteredAyat] = useState([]);

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

  useEffect(() => {
    const filtered = surah?.ayat?.filter((ayah) => {
      return ayah.ayahNumber && ayah.ayahNumber.toString().includes(searchTerm);
    });
    setFilteredAyat(filtered);
  }, [searchTerm, surah]);

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
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-blue-600" />
          <p className="text-xl font-medium text-gray-700">Loading Surah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Card>
        <CardHeader className="bg-gray-50/50 pb-4">
          <div className="flex flex-col items-center justify-between space-y-6">
            <div className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-800">
                {surah.name}{" "}
                <span className="text-gray-600">({surah.englishName})</span>
              </CardTitle>
              <p className="mt-2 text-lg text-gray-500">{surah.meaning}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
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
              <div className="relative max-w-48 flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search Ayah Number"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator className="my-2 bg-gray-200" />

        <CardContent className="space-y-4 bg-white p-6">
          {surah.translations && surah.translations.length > 0 && (
            <div className="mb-4 flex items-center space-x-4 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm">
              <div className="flex w-full items-center space-x-3">
                <div className="shrink-0 text-sm font-medium text-gray-600">
                  Translation:
                </div>
                <Select
                  value={selectedTranslationLanguage || ""}
                  onValueChange={setSelectedTranslationLanguage}
                >
                  <SelectTrigger className="min-w-[180px] flex-grow border-gray-300 transition-all focus:ring-2 focus:ring-blue-200">
                    <SelectValue
                      placeholder="Choose Language"
                      className="text-gray-700"
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg bg-white shadow-md">
                    {surah.translations.map((translation) => (
                      <SelectItem
                        key={translation.language}
                        value={translation.language}
                        className="group cursor-pointer rounded-md px-3 py-2 transition-colors hover:bg-blue-50 hover:text-blue-600"
                      >
                        <span className="transition-colors group-hover:text-blue-600">
                          {translation.language}
                        </span>
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
                        className="h-9 w-9 scale-90 bg-red-50 text-red-500 opacity-80 transition-all hover:scale-100 hover:bg-red-100 hover:text-red-600 hover:opacity-100"
                        onClick={() =>
                          handleDeleteTranslation(selectedTranslationLanguage)
                        }
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                    >
                      Remove {selectedTranslationLanguage} Translation
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          )}
          <div className="space-y-4">
            {!filteredAyat || filteredAyat.length === 0 ? (
              <div className="rounded-lg bg-gray-100 p-4 text-gray-600">
                <p className="mb-2">
                  JSON file should have the following structure:
                </p>
                <div className="max-h-52 overflow-auto rounded bg-white p-3 font-mono text-sm shadow-inner">
                  <pre>{JSON.stringify(SAMPLE_JSON, null, 2)}</pre>
                </div>
              </div>
            ) : (
              filteredAyat.map((ayah) => (
                <div
                  key={ayah.ayahNumber}
                  className="rounded-lg bg-gray-50 p-4 shadow-sm transition-all"
                >
                  <div className="flex flex-col">
                    <div className="font-arabic text-right text-2xl leading-relaxed rtl:text-right">
                      {ayah.text}
                      <span className="ml-2 text-sm text-gray-500">
                        ({ayah.ayahNumber})
                      </span>
                    </div>
                    {selectedTranslationLanguage && (
                      <div className="mt-2 text-left text-base text-gray-600">
                        {findTranslationForAyah(ayah.ayahNumber) || (
                          <span className="italic text-gray-400">
                            No translation available
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-end space-x-2">
                      {ayah.audioFileId && (
                        <audio
                          src={`${API_URL}/api/v1/admin/surahs/${surahNumber}/ayat/${ayah.ayahNumber}/audio`}
                          controls
                          className="mr-2"
                        />
                      )}
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          id={`audio-upload-${ayah.ayahNumber}`}
                          onChange={(e) =>
                            handleAudioUpload(ayah.ayahNumber, e)
                          }
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-9 w-9 scale-90 bg-green-50 text-green-500 opacity-80 transition-all hover:scale-100 hover:bg-green-100 hover:text-green-600 hover:opacity-100"
                              disabled={ayah.audioFileId}
                              onClick={() =>
                                document
                                  .getElementById(
                                    `audio-upload-${ayah.ayahNumber}`,
                                  )
                                  .click()
                              }
                            >
                              <Upload className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            Upload Audio
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              disabled={!ayah.audioFileId}
                              className="h-9 w-9 scale-90 bg-red-50 text-red-500 opacity-80 transition-all hover:scale-100 hover:bg-red-100 hover:text-red-600 hover:opacity-100"
                              onClick={() => handleAudioDelete(ayah.ayahNumber)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            Remove Audio
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
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
