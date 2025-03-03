import { TodoContainer } from "./components/todo-container";
import { ModeToggle } from "./components/ui/mode-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">究極のTodoアプリ</h1>
        <ModeToggle />
      </div>
      <TodoContainer />
    </main>
  );
}