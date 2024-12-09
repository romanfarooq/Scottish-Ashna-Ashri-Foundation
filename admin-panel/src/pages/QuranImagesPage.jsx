import toast from "react-hot-toast";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Upload,
  Trash2,
  Loader2,
  Eye,
  Image,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_URL = import.meta.env.VITE_API_URL;

export function QuranImagesPage() {
  const [loading, setLoading] = useState(true);
  const [surahs, setSurahs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [images, setImages] = useState([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState(null);

  const fetchSurahs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/admin/surahsWithImages`, {
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

  const handleViewImages = async (surahNumber) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/surahs/${surahNumber}/images`,
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
      setSelectedSurahNumber(surahNumber);
      setCurrentImageIndex(0);
      setSelectedImage(data.images[0]);
      setIsViewDialogOpen(true);
    } catch (error) {
      toast.error("Failed to fetch surah images");
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      const nextIndex = currentImageIndex + 1;
      setCurrentImageIndex(nextIndex);
      setSelectedImage(images[nextIndex]);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      const prevIndex = currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setSelectedImage(images[prevIndex]);
    }
  };

  const handlePageSelect = (pageIndex) => {
    const index = parseInt(pageIndex);
    setCurrentImageIndex(index);
    setSelectedImage(images[index]);
  };

  const handleImageUpload = async (surahNumber, e) => {
    const files = e.target.files;

    if (!files.length) {
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/surahs/${surahNumber}/images`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        },
      );

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message);
      fetchSurahs();
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload images");
    }
  };

  const handleDeleteImages = async (surahNumber) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/surahs/${surahNumber}/images`,
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
      fetchSurahs();
    } catch (error) {
      toast.error("Failed to delete surah images");
    }
  };

  const handleDownloadSurahImages = async (surahNumber) => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/v1/admin/surahs/${surahNumber}/images/download`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        toast.error("Failed to download images");
        return;
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `surah_${surahNumber}_images.zip`);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Images downloaded successfully");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download images");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-screen flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        <p className="mt-4 text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
          <h1 className="flex items-center text-2xl font-semibold text-gray-800">
            <Image className="mr-2 h-8 w-8 text-gray-600" />
            Surah Management - Images
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
                        disabled={!surah.images.length}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                        onClick={() => handleViewImages(surah.surahNumber)}
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
                        disabled={!surah.images.length}
                        className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700"
                        onClick={() =>
                          handleDownloadSurahImages(surah.surahNumber)
                        }
                      >
                        <Download size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                    >
                      Download Images
                    </TooltipContent>
                  </Tooltip>
                  <Input
                    id={`image-upload-${surah.surahNumber}`}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(surah.surahNumber, e)}
                    className="hidden"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={!!surah.images.length}
                        onClick={() =>
                          document
                            .getElementById(`image-upload-${surah.surahNumber}`)
                            .click()
                        }
                        className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
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
                        disabled={!surah.images.length}
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
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>
                Surah {selectedSurahNumber} - Page Viewer
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center">
              <div className="relative mb-4 flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousImage}
                  disabled={currentImageIndex === 0}
                  className="mr-4"
                >
                  <ChevronLeft size={24} />
                </Button>
                <img
                  src={selectedImage}
                  alt={`Surah ${selectedSurahNumber} - Page ${
                    currentImageIndex + 1
                  }`}
                  className="max-h-[70vh] max-w-full object-contain"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextImage}
                  disabled={currentImageIndex === images.length - 1}
                  className="ml-4"
                >
                  <ChevronRight size={24} />
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Go to Page:</span>
                <Select
                  value={currentImageIndex.toString()}
                  onValueChange={handlePageSelect}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Page" />
                  </SelectTrigger>
                  <SelectContent>
                    {images.map((_, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        Page {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">
                  {currentImageIndex + 1} / {images.length}
                </span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
