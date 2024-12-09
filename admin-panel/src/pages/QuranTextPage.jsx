import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddSurahDialog } from "@/components/AddSurahDialog";
import { EditSurahDialog } from "@/components/EditSurahDialog";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pencil, Trash2, BookOpen, Loader2, SearchIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";

const API_URL = import.meta.env.VITE_API_URL;

export function QuranTextPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [surahs, setSurahs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahToDelete, setSurahToDelete] = useState(null);

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
        <p className="mt-4 text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  const navigateToAyat = (surah) => {
    navigate(`/surah-text/${surah.surahNumber}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="p-2">
        <CardHeader>
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <h2 className="text-3xl font-bold text-gray-800">
              Surah Management
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
              <AddSurahDialog fetchSurahs={fetchSurahs} />
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
                              <BookOpen size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            View Ayat
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                              onClick={() => setSelectedSurah(surah)}
                              title="Edit Surah"
                            >
                              <Pencil size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            Edit Surah
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="hover:bg-red-600"
                              onClick={() => setSurahToDelete(surah)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 shadow-sm"
                          >
                            Delete Surah
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

      {selectedSurah && (
        <EditSurahDialog
          surah={selectedSurah}
          fetchSurahs={fetchSurahs}
          selectedSurah={selectedSurah}
          setSelectedSurah={setSelectedSurah}
        />
      )}
      <DeleteConfirmationDialog
        fetchSurahs={fetchSurahs}
        surahToDelete={surahToDelete}
        setSurahToDelete={setSurahToDelete}
      />
    </div>
  );
}
