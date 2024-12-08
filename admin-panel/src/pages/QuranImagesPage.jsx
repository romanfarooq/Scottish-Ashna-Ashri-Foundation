import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL = import.meta.env.VITE_API_URL;

export function QuranImagesPage() {
  const [surahNumber, setSurahNumber] = useState("");
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const fetchSurahImages = async () => {
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

  const handleImageUpload = async () => {
    if (!surahNumber || !selectedFile) {
      toast.error("Please select a Surah number and images");
      return;
    }

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

  const handleDeleteImages = async () => {
    if (!surahNumber) {
      toast.error("Please enter a Surah number");
      return;
    }

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
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Surah Images Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex space-x-4">
          <div className="flex-grow">
            <Label>Surah Number</Label>
            <Input
              type="number"
              value={surahNumber}
              onChange={(e) => setSurahNumber(e.target.value)}
              placeholder="Enter Surah Number"
            />
          </div>
          <Button variant="outline" onClick={fetchSurahImages}>
            View Images
          </Button>
        </div>

        <div className="mb-4 flex space-x-4">
          <div className="flex-grow">
            <Label>Upload Images</Label>
            <Input
              type="file"
              multiple
              onChange={(e) => setSelectedFile(e.target.files)}
            />
          </div>
          <Button onClick={handleImageUpload} disabled={!selectedFile}>
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
        </div>

        <div className="mb-4 flex space-x-4">
          <div className="flex-grow">
            <Label>Upload Zip File</Label>
            <Input
              type="file"
              accept=".zip"
              onChange={(e) => setSelectedZipFile(e.target.files[0])}
            />
          </div>
          <Button onClick={handleImageUpload} disabled={!selectedZipFile}>
            <Upload className="mr-2 h-4 w-4" /> Upload Zip
          </Button>
        </div>

        <div className="mt-4 flex justify-between">
          <Button
            variant="outline"
            onClick={null}
            disabled={images.length === 0}
          >
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteImages}
            disabled={images.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete All
          </Button>
        </div>

        {images.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold">Surah Images</h3>
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="group relative cursor-pointer overflow-hidden rounded-lg border"
                  onClick={() => handleViewImage(image, index)}
                >
                  <img
                    src={image.url}
                    alt={`Page ${image.pageNumber}`}
                    className="h-40 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-200 group-hover:bg-opacity-30">
                    <Eye className="text-white opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="h-[80vh] max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Surah {surahNumber} - Page {selectedImage?.pageNumber}
              </DialogTitle>
            </DialogHeader>
            <div className="relative flex h-full items-center justify-center">
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 z-10"
                onClick={handlePreviousImage}
                disabled={currentImageIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {selectedImage && (
                <img
                  src={selectedImage.url}
                  alt={`Page ${selectedImage.pageNumber}`}
                  className="max-h-full max-w-full object-contain"
                />
              )}

              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 z-10"
                onClick={handleNextImage}
                disabled={currentImageIndex === images.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
