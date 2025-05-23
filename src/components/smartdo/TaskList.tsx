"use client";

import { useTasks } from "./TaskProvider";
import { TaskItem } from "./TaskItem";
import { AnimatePresence, motion } from "framer-motion"; // For animations
import { PackageOpen } from "lucide-react";

export function TaskList() {
  const { tasks, categories } = useTasks();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <PackageOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">No Tasks Yet!</h2>
        <p>Click "Add New Task" to get started.</p>
      </div>
    );
  }

  const categorizedTasks: Record<string, typeof tasks> = tasks.reduce((acc, task) => {
    const category = task.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  const sortedCategories = Object.keys(categorizedTasks).sort((a, b) => {
    // Prioritize "Urgent", then sort alphabetically
    if (a.toLowerCase() === "urgent") return -1;
    if (b.toLowerCase() === "urgent") return 1;
    return a.localeCompare(b);
  });


  return (
    <div className="space-y-8">
      <AnimatePresence>
        {sortedCategories.map((category) => (
          <motion.section 
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            aria-labelledby={`category-title-${category.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <h2 
              id={`category-title-${category.toLowerCase().replace(/\s+/g, '-')}`} 
              className="text-2xl font-semibold mb-4 pb-2 border-b-2 border-primary/30 text-foreground capitalize"
            >
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {categorizedTasks[category].map((task, index) => (
                  <motion.div
                    key={task.id}
                    layout // Enable smooth reordering animation if tasks move between categories (though not implemented here)
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <TaskItem task={task} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        ))}
      </AnimatePresence>
    </div>
  );
}
