import toast from "react-hot-toast";
import { Loader2, Download, Upload, Play, Pause } from "lucide-react";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = import.meta.env.VITE_API_URL;

export function SurahTextPage() {
  const { surahNumber } = useParams();
  const [surah, setSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [playingAyah, setPlayingAyah] = useState(null);
  const audioRefs = useRef({});
  const jsonUploadRef = useRef(null);
  const audioUploadRefs = useRef({});

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
  }, []);

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

  const playAudio = async (ayahNumber) => {
    // Pause any currently playing audio
    if (playingAyah && audioRefs.current[playingAyah]) {
      audioRefs.current[playingAyah].pause();
      audioRefs.current[playingAyah].currentTime = 0;
    }

    // If clicking the same ayah, just stop
    if (playingAyah === ayahNumber) {
      setPlayingAyah(null);
      return;
    }

    try {
      const audioUrl = `${API_URL}/api/v1/admin/surahs/${surahNumber}/ayat/${ayahNumber}/audio`;

      // Create audio element if it doesn't exist
      if (!audioRefs.current[ayahNumber]) {
        const audio = new Audio(audioUrl);
        audioRefs.current[ayahNumber] = audio;

        const handleAudioEnd = () => {
          setPlayingAyah(null);
          audio.removeEventListener("ended", handleAudioEnd);
        };

        audio.addEventListener("ended", handleAudioEnd);
      }

      await audioRefs.current[ayahNumber].play();
      setPlayingAyah(ayahNumber);
    } catch (error) {
      toast.error("Failed to play audio.");
    }
  };

  const pauseAudio = (ayahNumber) => {
    if (audioRefs.current[ayahNumber]) {
      audioRefs.current[ayahNumber].pause();
      setPlayingAyah(null);
    }
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="my-4" />
          <div className="space-y-4">
            {surah.ayat.map((ayah) => (
              <div
                key={ayah.ayahNumber}
                className="flex items-center justify-between space-x-4"
              >
                <div className="flex-grow">
                  <div className="font-arabic text-right text-xl leading-loose rtl:text-right">
                    {ayah.text}
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({ayah.ayahNumber})
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    ref={(el) => {
                      audioUploadRefs.current[ayah.ayahNumber] = el;
                    }}
                    onChange={(e) => handleAudioUpload(ayah.ayahNumber, e)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      audioUploadRefs.current[ayah.ayahNumber]?.click()
                    }
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  {playingAyah === ayah.ayahNumber ? (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => pauseAudio(ayah.ayahNumber)}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={!ayah.audioFileId}
                      onClick={() => playAudio(ayah.ayahNumber)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
