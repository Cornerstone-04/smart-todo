"use client"; // Top-level page needs to be client component if it uses context/hooks directly

import { Header } from "@/components/smartdo/Header";
import { TaskList } from "@/components/smartdo/TaskList";
import { TaskProvider } from "@/components/smartdo/TaskProvider";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { TaskForm } from "@/components/smartdo/TaskForm";
import { useState } from "react";

export default function SmartDoPage() {
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);

  return (
    <TaskProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 md:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Your Tasks</h2>
            <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add a New Task</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to add a new task to your list.
                  </DialogDescription>
                </DialogHeader>
                <TaskForm onOpenChange={setIsAddTaskDialogOpen} />
              </DialogContent>
            </Dialog>
          </div>
          <TaskList />
        </main>
        <footer className="text-center py-4 border-t border-border/50 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SmartDo. Built with Firebase Studio.</p>
        </footer>
      </div>
    </TaskProvider>
  );
}
