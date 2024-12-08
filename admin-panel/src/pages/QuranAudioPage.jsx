import toast from "react-hot-toast";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  FileAudio,
  Upload,
  Trash2,
  Play,
  CircleX,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const API_URL = import.meta.env.VITE_API_URL;

export function QuranAudioPage() {
  const [loading, setLoading] = useState(true);
  const [surahs, setSurahs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [activeAudioSurah, setActiveAudioSurah] = useState(null);

  const fetchSurahs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/admin/surahs`, {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message);
        return;
      }
      setSurahs(data.surahs);
      setFilteredSurahs(data.surahs);
    } catch (error) {
      toast.error("Failed to load Surahs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurahs();
  }, [fetchSurahs]);

  useEffect(() => {
    const filtered = surahs.filter((surah) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        surah.name?.toLowerCase().includes(searchLower) ||
        surah.englishName?.toLowerCase().includes(searchLower) ||
        surah.surahNumber?.toString().includes(searchLower)
      );
    });
    setFilteredSurahs(filtered);
  }, [searchTerm, surahs]);

  const handleSurahAudioUpload = async (surahNumber, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/surahs/${surahNumber}/audio`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Surah audio uploaded successfully!");
        fetchSurahs();
      } else {
        toast.error(data.message || "Failed to upload surah audio.");
      }
    } catch (error) {
      toast.error("Surah audio upload failed.");
    }
  };

  const handleSurahAudioDelete = async (surahNumber) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/surahs/${surahNumber}/audio`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Surah audio removed successfully!");
        if (activeAudioSurah === surahNumber) {
          setActiveAudioSurah(null);
        }
        fetchSurahs();
      } else {
        toast.error(data.message || "Failed to remove surah audio.");
      }
    } catch (error) {
      toast.error("Surah audio removal failed.");
    }
  };

  const handleAudioPlay = (surah) => {
    setActiveAudioSurah(surah.surahNumber);
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-screen flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        <p className="mt-4 text-xl text-gray-600">Loading Surahs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
          <h1 className="flex items-center text-2xl font-semibold text-gray-800">
            <FileAudio className="mr-3 text-gray-600" />
            Quran Audio Management
          </h1>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search Surahs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-700 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredSurahs.map((surah) => (
            <div
              key={surah.surahNumber}
              className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700">
                    {surah.surahNumber}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{surah.name}</h3>
                    <p className="text-sm text-gray-500">{surah.englishName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {surah.audioFileId &&
                    (activeAudioSurah === surah.surahNumber ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => setActiveAudioSurah(null)}
                            className="rounded-md bg-gray-50 p-2 text-gray-600 hover:bg-gray-100"
                          >
                            <CircleX className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                        >
                          Stop Audio
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleAudioPlay(surah)}
                            className="rounded-md bg-gray-50 p-2 text-gray-600 hover:bg-gray-100"
                          >
                            <Play className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                        >
                          Play Audio
                        </TooltipContent>
                      </Tooltip>
                    ))}

                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    id={`surah-audio-upload-${surah.surahNumber}`}
                    onChange={(e) =>
                      handleSurahAudioUpload(surah.surahNumber, e)
                    }
                  />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() =>
                          document
                            .getElementById(
                              `surah-audio-upload-${surah.surahNumber}`,
                            )
                            .click()
                        }
                        disabled={!!surah.audioFileId}
                        className="rounded-md bg-gray-50 p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
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
                        onClick={() =>
                          handleSurahAudioDelete(surah.surahNumber)
                        }
                        disabled={!surah.audioFileId}
                        className="rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                    >
                      Delete Audio
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {activeAudioSurah === surah.surahNumber && (
                <div className="bg-gray-50 p-4">
                  <audio
                    src={`${API_URL}/api/v1/admin/surahs/${surah.surahNumber}/audio`}
                    controls
                    autoPlay
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
