import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { wordsAPI } from "@/lib/api/endpoints/words";
import { useState } from "react";

const Words = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newWord, setNewWord] = useState({ word: "", meaning: "" });

  const { data: words, isLoading } = useQuery({
    queryKey: ["words"],
    queryFn: () => wordsAPI.getWords(),
  });

  const addWordMutation = useMutation({
    mutationFn: (wordData: { word: string; meaning: string }) =>
      wordsAPI.createWord(wordData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Word added successfully",
      });
      setNewWord({ word: "", meaning: "" });
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
    if (newWord.word && newWord.meaning) {
      addWordMutation.mutate(newWord);
    }
  };

  return (
    <div className="space-y-6 animate-slideIn">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Words</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your vocabulary</p>
      </header>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="word">Word</Label>
              <Input
                id="word"
                value={newWord.word}
                onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                placeholder="Enter word"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meaning">Meaning</Label>
              <Input
                id="meaning"
                value={newWord.meaning}
                onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                placeholder="Enter meaning"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={addWordMutation.isPending}
            className="w-full"
          >
            {addWordMutation.isPending ? "Adding..." : "Add Word"}
          </Button>
        </form>

        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="grid gap-4">
            <div className="grid grid-cols-3 font-medium text-gray-700 dark:text-gray-300">
              <div>Word</div>
              <div>Meaning</div>
              <div>Actions</div>
            </div>
            {words?.data?.map((word) => (
              <div key={word.id} className="grid grid-cols-3 border-t py-3 text-gray-600 dark:text-gray-400">
                <div className="text-primary font-medium">{word.word}</div>
                <div>{word.meaning}</div>
                <div>
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Words;
