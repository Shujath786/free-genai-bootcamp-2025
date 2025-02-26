import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { wordsAPI } from "@/lib/api/endpoints/words";
import { useState } from "react";

interface Word {
  id: number;
  arabic: string;
  english: string;
  parts: Array<{
    letter: string;
    transliteration: string;
  }>;
  root?: string;
  transliteration?: string;
  wrong_count?: number;
  correct_count?: number;
}

const Words = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newWord, setNewWord] = useState<Word>({ id: 0, arabic: "", english: "", parts: [] });
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["words"],
    queryFn: () => wordsAPI.getWords(),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading words: {(error as Error).message}</div>;
  }

  const words = response?.data;
  if (!words || words.length === 0) {
    return <div>No words found. Add some words to get started!</div>;
  }

  const deleteWordMutation = useMutation({
    mutationFn: (id: number) => wordsAPI.deleteWord(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Word deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["words"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete word",
        variant: "destructive",
      });
    },
  });

  const updateWordMutation = useMutation({
    mutationFn: (word: Word) => wordsAPI.updateWord(word.id, word),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Word updated successfully",
      });
      setEditingWord(null);
      queryClient.invalidateQueries({ queryKey: ["words"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update word",
        variant: "destructive",
      });
    },
  });

  const addWordMutation = useMutation({
    mutationFn: (word: Word) => wordsAPI.createWord(word),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Word added successfully",
      });
      setNewWord({ id: 0, arabic: "", english: "", parts: [] });
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["words"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add word",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWord.arabic && newWord.english) {
      addWordMutation.mutate(newWord);
    }
  };

  return (
    <div className="space-y-6 animate-slideIn">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Words</h1>
      </header>

      <Card className="p-6">
        {editingWord ? (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (editingWord.arabic && editingWord.english) {
                updateWordMutation.mutate(editingWord);
              }
            }} 
            className="space-y-4"
          >
            <div>
              <Label htmlFor="edit-arabic">Arabic</Label>
              <Input
                id="edit-arabic"
                value={editingWord.arabic}
                onChange={(e) => setEditingWord({ ...editingWord, arabic: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-english">English</Label>
              <Input
                id="edit-english"
                value={editingWord.english}
                onChange={(e) => setEditingWord({ ...editingWord, english: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={updateWordMutation.isPending}
                className="flex-1"
              >
                {updateWordMutation.isPending ? "Updating..." : "Update Word"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setEditingWord(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="arabic">Arabic</Label>
              <Input
                id="arabic"
                value={newWord.arabic}
                onChange={(e) => setNewWord({ ...newWord, arabic: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="english">English</Label>
              <Input
                id="english"
                value={newWord.english}
                onChange={(e) => setNewWord({ ...newWord, english: e.target.value })}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={addWordMutation.isPending}
              className="w-full"
            >
              {addWordMutation.isPending ? "Adding..." : "Add Word"}
            </Button>
          </form>
        )}

        <div className="grid gap-4">
          <div className="grid grid-cols-3 font-medium text-gray-700 dark:text-gray-300">
            <div>Arabic</div>
            <div>English</div>
            <div>Actions</div>
          </div>
          {words.map((word) => (
            <div key={word.id} className="grid grid-cols-3 border-t py-3 text-gray-600 dark:text-gray-400">
              <div className="text-primary font-medium">{word.arabic}</div>
              <div>{word.english}</div>
              <div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setEditingWord(word)}
                >
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this word?')) {
                      deleteWordMutation.mutate(word.id);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Words;
