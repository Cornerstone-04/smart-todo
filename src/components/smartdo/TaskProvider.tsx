"use client";

import type { Task, TaskUrgency } from "@/lib/types";
import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface TaskContextType {
  tasks: Task[];
  addTask: (taskData: Omit<Task, "id" | "completed" | "urgency" | "category"> & { category?: string; urgency?: TaskUrgency }) => void;
  editTask: (taskId: string, updatedData: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  setTaskReminder: (taskId: string, reminderDateTime: string, reasoning: string) => void;
  getTaskById: (taskId: string) => Task | undefined;
  categories: string[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const initialTasks: Task[] = [
  { id: "1", title: "Grocery Shopping", description: "Buy milk, eggs, bread, and cheese.", dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), category: "Personal", completed: false, urgency: "medium" },
  { id: "2", title: "Project Report", description: "Finalize Q3 project report for client.", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), category: "Work", completed: false, urgency: "high" },
  { id: "3", title: "Book Doctor Appointment", description: "Annual check-up.", category: "Personal", completed: true, urgency: "low" },
];

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const localData = localStorage.getItem("smartdo-tasks");
      return localData ? JSON.parse(localData) : initialTasks;
    }
    return initialTasks;
  });

  useEffect(() => {
    localStorage.setItem("smartdo-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Omit<Task, "id" | "completed" | "urgency" | "category"> & { category?: string; urgency?: TaskUrgency }) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
      category: taskData.category || "General",
      urgency: taskData.urgency || "medium",
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const editTask = (taskId: string, updatedData: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...updatedData } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const setTaskReminder = (taskId: string, reminderDateTime: string, reasoning: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, reminderDateTime, reminderReasoning: reasoning } : task
      )
    );
  };

  const getTaskById = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };

  const categories = Array.from(new Set(tasks.map(task => task.category))).sort();

  return (
    <TaskContext.Provider value={{ tasks, addTask, editTask, deleteTask, toggleTaskCompletion, setTaskReminder, getTaskById, categories }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
