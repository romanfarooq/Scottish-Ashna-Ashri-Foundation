import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  SearchIcon,
  BookOpen,
  Pencil,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const API_URL = import.meta.env.VITE_API_URL;

export function QuranImagesPage() {
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [surahs, setSurahs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSurahs, setFilteredSurahs] = useState([]);

  const fetchSurahs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/v1/admin/surahs`, {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message);
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

  if (loading) {
    return (
      <div className="flex h-full min-h-screen flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        <p className="mt-4 text-xl text-gray-600">Loading Surahs...</p>
      </div>
    );
  }

  const navigateToAyat = (surah) => {
    navigate(`/surah-text/${surah.surahNumber}`);
  };

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

  // const handleDownload = async () => {
  //   if (!surahNumber) {
  //     toast.error("Please enter a Surah number");
  //     return;
  //   }

  //   try {
  //     const response = await axios.get(
  //       `/api/surahs/${surahNumber}/images/download`,
  //       {
  //         responseType: "blob",
  //       },
  //     );

  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", `Surah_${surahNumber}_Pages.zip`);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();

  //     toast.success("Images downloaded successfully");
  //   } catch (error) {
  //     toast.error("Failed to download surah images");
  //   }
  // };

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="p-2">
        <CardHeader>
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <h2 className="text-3xl font-bold text-gray-800">
              Surah Management - Images
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
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="text-center text-gray-600">
                  Number
                </TableHead>
                <TableHead className="text-center text-gray-600">
                  Arabic Name
                </TableHead>
                <TableHead className="text-center text-gray-600">
                  English Name
                </TableHead>
                <TableHead className="text-center text-gray-600">
                  Meaning
                </TableHead>
                <TableHead className="text-center text-gray-600">
                  Juzz Number
                </TableHead>
                <TableHead className="text-center text-gray-600">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-center">
              {filteredSurahs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-gray-500"
                  >
                    No Surahs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSurahs.map((surah) => (
                  <TableRow
                    key={surah.surahNumber}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <TableCell className="font-medium text-gray-700">
                      {surah.surahNumber}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {surah.name || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {surah.englishName || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {surah.meaning || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {surah.juzzNumber || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                              onClick={() => navigateToAyat(surah)}
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
                              onClick={() =>
                                handleImageUpload(surah.surahNumber)
                              }
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
                              onClick={() =>
                                handleDeleteImages(surah.surahNumber)
                              }
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
