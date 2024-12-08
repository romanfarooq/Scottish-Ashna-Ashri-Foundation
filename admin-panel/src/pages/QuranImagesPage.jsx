import toast from "react-hot-toast";
import { useState, useEffect, useCallback } from "react";
import { Search, FileAudio, Upload, Trash2, Loader2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const API_URL = import.meta.env.VITE_API_URL;

export function QuranImagesPage() {
  const [loading, setLoading] = useState(true);
  const [surahs, setSurahs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const handleViewImage = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
    setIsViewDialogOpen(true);
  };

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex((prevIndex) => prevIndex + 1);
      setSelectedImage(images[currentImageIndex + 1]);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prevIndex) => prevIndex - 1);
      setSelectedImage(images[currentImageIndex - 1]);
    }
  };

  const fetchSurahImages = async (surahNumber) => {
    if (!surahNumber) {
      toast.error("Please enter a Surah number");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/surahs/${surahNumber}/images`,
        {
          credentials: "include",
        },
      );
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message);
        return;
      }
      setImages(data.images);
      toast.success(
        `Retrieved ${data.images.length} images for Surah ${surahNumber}`,
      );
    } catch (error) {
      toast.error("Failed to fetch surah images");
    }
  };

  const handleImageUpload = async (surahNumber) => {
    const formData = new FormData();
    Array.from(selectedFile).forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch(
        `${API_URL}/api/surahs/${surahNumber}/images`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message);
      fetchSurahImages();
    } catch (error) {
      toast.error("Failed to upload images");
    }
  };

  const handleDownload = async (surahNumber) => {
    if (!surahNumber) {
      toast.error("Please enter a Surah number");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/surahs/${surahNumber}/images/download`,
        {
          credentials: "include",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Surah_${surahNumber}_Pages.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Images downloaded successfully");
    } catch (error) {
      toast.error("Failed to download surah images");
    }
  };

  const handleDeleteImages = async (surahNumber) => {
    try {
      const response = await fetch(
        `${API_URL}/api/surahs/${surahNumber}/images`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message);
        return;
      }
      toast.success(data.message);
      setImages([]);
    } catch (error) {
      toast.error("Failed to delete surah images");
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                        onClick={null}
                      >
                        <Eye size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                    >
                      View Images
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                        onClick={() => handleImageUpload(surah.surahNumber)}
                      >
                        <Upload size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                    >
                      Upload Images
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="hover:bg-red-600"
                        onClick={() => handleDeleteImages(surah.surahNumber)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                    >
                      Delete Images
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
