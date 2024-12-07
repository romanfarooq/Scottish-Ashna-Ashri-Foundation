import toast from "react-hot-toast";
import { useState, useEffect, useCallback } from "react";
import { Loader2, SearchIcon, Upload, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

  useEffect(() => {
    fetchSurahs();
  }, []);

  useEffect(() => {
    const filtered = surahs.filter((surah) => {
      return (
        (surah.name &&
          surah.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (surah.englishName &&
          surah.englishName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (surah.surahNumber && surah.surahNumber.toString().includes(searchTerm))
      );
    });
    setFilteredSurahs(filtered);
  }, [searchTerm, surahs]);

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
        fetchSurahs();
      } else {
        toast.error(data.message || "Failed to remove surah audio.");
      }
    } catch (error) {
      toast.error("Surah audio removal failed.");
    }
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
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="p-2">
        <CardHeader>
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <h2 className="text-2xl font-bold text-gray-800">
              Quran Audio Management
            </h2>
            <div className="flex space-x-4">
              <div className="relative max-w-md flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search Surahs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-gray-300 bg-white pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSurahs.map((surah) => (
            <div key={surah.surahNumber} className="mb-4 rounded-lg border">
              <div className="flex items-center justify-between p-4 transition-all hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-bold">
                    {surah.surahNumber}. {surah.name} ({surah.englishName})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {surah.audioFileId && (
                    <audio
                      src={`${API_URL}/api/v1/admin/surahs/${surah.surahNumber}/audio`}
                      controls
                      className="mr-2"
                    />
                  )}
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
                        variant="destructive"
                        size="icon"
                        className="h-9 w-9 scale-90 bg-green-50 text-green-500 opacity-80 transition-all hover:scale-100 hover:bg-green-100 hover:text-green-600 hover:opacity-100"
                        disabled={!!surah.audioFileId}
                        onClick={() => {
                          document
                            .getElementById(
                              `surah-audio-upload-${surah.surahNumber}`,
                            )
                            .click();
                        }}
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
                        className="h-9 w-9 scale-90 bg-red-50 text-red-500 opacity-80 transition-all hover:scale-100 hover:bg-red-100 hover:text-red-600 hover:opacity-100"
                        disabled={!surah.audioFileId}
                        onClick={() =>
                          handleSurahAudioDelete(surah.surahNumber)
                        }
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
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
