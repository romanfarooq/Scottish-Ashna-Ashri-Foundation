import toast from "react-hot-toast";
import { Loader2, Download, Upload } from "lucide-react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchSurah = async () => {
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
    };

    fetchSurah();
  }, [surahNumber]);

  const handleExportJSON = () => {
    if (!surah) return;

    //  Create a blob with the JSON data
    const jsonString = JSON.stringify(surah, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    //  Create a link element and trigger download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Surah_${surah.surahNumber}.json`;

    //  Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    //  Free up memory
    URL.revokeObjectURL(link.href);

    //  Show a success toast
    toast.success(`Exported ${surah.name} as JSON`);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    //  Check file type
    if (file.type !== "application/json") {
      toast.error("Please upload a JSON file");
      return;
    }

    try {
      setUploadLoading(true);

      //  Read file content
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);

          //  Validate JSON structure
          if (!jsonData.surahNumber || !jsonData.name || !jsonData.ayat) {
            toast.error("Invalid JSON format");
            return;
          }

          //  Send update request
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
            setSurah(jsonData);
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
                id="jsonUpload"
                onChange={handleFileUpload}
                disabled={uploadLoading}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("jsonUpload").click()}
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
              <div key={ayah.ayahNumber} className="flex items-center">
                <div className="font-arabic ml-auto text-right text-xl leading-loose rtl:text-right">
                  {ayah.text}
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({ayah.ayahNumber})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

//  import React, { useState, useEffect } from "react";
//  import toast from "react-hot-toast";
//  import { Loader2, Download, Upload } from "lucide-react";
//  import { useParams } from "react-router-dom";
//  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
//  import { Separator } from "@/components/ui/separator";
//  import { Button } from "@/components/ui/button";
//  import { Input } from "@/components/ui/input";

//  const API_URL = import.meta.env.VITE_API_URL;

//  export function SurahTextPage() {
//    const { surahNumber } = useParams();
//    const [surah, setSurah] = useState(null);
//    const [loading, setLoading] = useState(true);
//    const [uploadLoading, setUploadLoading] = useState(false);

//    useEffect(() => {
//      const fetchSurah = async () => {
//        try {
//          setLoading(true);
//          const response = await fetch(
//            `${API_URL}/api/v1/admin/surahs/${surahNumber}`,
//            {
//              method: "GET",
//              headers: {
//                "Content-Type": "application/json",
//              },
//              credentials: "include",
//            }
//          );
//          const data = await response.json();
//          if (response.ok) {
//            setSurah(data.surah);
//          } else {
//            toast.error(data.message);
//          }
//        } catch (err) {
//          toast.error("Failed to fetch Surah.");
//        } finally {
//          setLoading(false);
//        }
//      };

//      fetchSurah();
//    }, [surahNumber]);

//    const handleExportJSON = () => {
//      if (!surah) return;

//       Create a blob with the JSON data
//      const jsonString = JSON.stringify(surah, null, 2);
//      const blob = new Blob([jsonString], { type: 'application/json' });

//       Create a link element and trigger download
//      const link = document.createElement('a');
//      link.href = URL.createObjectURL(blob);
//      link.download = `Surah_${surah.surahNumber}.json`;

//       Append to body, click, and remove
//      document.body.appendChild(link);
//      link.click();
//      document.body.removeChild(link);

//       Free up memory
//      URL.revokeObjectURL(link.href);

//       Show a success toast
//      toast.success(`Exported ${surah.name} as JSON`);
//    };

//    const handleFileUpload = async (event) => {
//      const file = event.target.files[0];
//      if (!file) return;

//       Check file type
//      if (file.type !== 'application/json') {
//        toast.error('Please upload a JSON file');
//        return;
//      }

//      try {
//        setUploadLoading(true);

//         Read file content
//        const fileReader = new FileReader();
//        fileReader.onload = async (e) => {
//          try {
//            const jsonData = JSON.parse(e.target.result);

//             Validate JSON structure
//            if (!jsonData.surahNumber || !jsonData.name || !jsonData.ayat) {
//              toast.error('Invalid JSON format');
//              return;
//            }

//             Send update request
//            const response = await fetch(
//              `${API_URL}/api/v1/admin/surahs/${surahNumber}`,
//              {
//                method: "PUT",
//                headers: {
//                  "Content-Type": "application/json",
//                },
//                credentials: "include",
//                body: JSON.stringify(jsonData)
//              }
//            );

//            const responseData = await response.json();

//            if (response.ok) {
//              toast.success('Surah updated successfully');
//              setSurah(jsonData);
//            } else {
//              toast.error(responseData.message || 'Failed to update Surah');
//            }
//          } catch (parseError) {
//            toast.error('Error parsing JSON file');
//          }
//        };

//        fileReader.readAsText(file);
//      } catch (error) {
//        toast.error('Failed to upload JSON');
//      } finally {
//        setUploadLoading(false);
//      }
//    };

//    if (loading) {
//      return (
//        <div className="flex justify-center items-center h-full">
//          <Loader2 className="animate-spin" />
//          <p className="ml-2">Loading Surah...</p>
//        </div>
//      );
//    }

//    return (
//      <Card className="w-full max-w-4xl mx-auto">
//        <CardHeader className="flex flex-row justify-between items-center">
//          <CardTitle>{surah.name} ({surah.englishName})</CardTitle>
//          <div className="flex space-x-2">
//            <Button
//              variant="outline"
//              onClick={handleExportJSON}
//            >
//              <Download className="mr-2 h-4 w-4" /> Export JSON
//            </Button>
//            <Input
//              type="file"
//              accept=".json"
//              className="hidden"
//              id="jsonUpload"
//              onChange={handleFileUpload}
//              disabled={uploadLoading}
//            />
//            <Button
//              variant="outline"
//              onClick={() => document.getElementById('jsonUpload').click()}
//              disabled={uploadLoading}
//            >
//              {uploadLoading ? (
//                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//              ) : (
//                <Upload className="mr-2 h-4 w-4" />
//              )}
//              Upload JSON
//            </Button>
//          </div>
//        </CardHeader>
//        <Separator />
//        <CardContent className="mt-4">
//          <p className="text-muted-foreground mb-4">{surah.meaning}</p>
//          <div className="space-y-2">
//            {surah.ayat.map((ayah) => (
//              <div
//                key={ayah.ayahNumber}
//                className="flex justify-between items-center p-2 border rounded"
//              >
//                <span>{ayah.text}</span>
//                <span className="text-muted-foreground text-sm">
//                  ({ayah.ayahNumber})
//                </span>
//              </div>
//            ))}
//          </div>
//        </CardContent>
//      </Card>
//    );
//  }
