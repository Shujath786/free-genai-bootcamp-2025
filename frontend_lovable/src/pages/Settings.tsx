
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const Settings = () => {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const { theme, setTheme } = useTheme();

  const handleReset = () => {
    if (confirmText.toLowerCase() === "reset me") {
      // Reset functionality would go here
      toast.success("History has been reset successfully");
      setIsResetDialogOpen(false);
      setConfirmText("");
    } else {
      toast.error("Please type 'reset me' to confirm");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="space-y-8 animate-slideIn">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your preferences</p>
      </header>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reset History</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              This will reset your entire learning history. This action cannot be undone.
            </p>
            <Button 
              variant="destructive" 
              className="mt-4"
              onClick={() => setIsResetDialogOpen(true)}
            >
              Reset History
            </Button>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dark Mode</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Toggle between light and dark theme.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="mr-2" /> : <Moon className="mr-2" />}
              Toggle Theme
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your entire learning history
              and reset your progress.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Type "reset me" to confirm:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="reset me"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Reset History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
