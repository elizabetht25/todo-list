"use client";
import { SignIn } from "@/components/signin-button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { Input } from "@/components/ui/input";
import { api } from "../../convex/_generated/api";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { Check, Ellipsis, Pencil, Search, Trash } from "lucide-react";
import { editTodo } from "../../convex/todos";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuCheckboxItemProps,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sign } from "crypto";

type Checked = DropdownMenuCheckboxItemProps["checked"];

export default function Home() {
  //User constants
  const user = useQuery(api.todos.getUser);

  return (
    <div className="h-screen flex flex-col items-center justify-between p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-2xl mt-8">
        <div className="gap-5 items-center flex">
          <Authenticated>
            <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(" ")[0]}!</h1>
          </Authenticated>
          <Unauthenticated>
            <h1 className="text-2xl font-bold ">Your Todo List</h1>
          </Unauthenticated>
          <div className="ml-auto p-2 flex gap-2">
            <ThemeToggle />
            <SignIn />
          </div>
        </div>

        <SearchBar />
      </div>
      <div
        className="w-full max-w-2xl mb-8 fixed bottom-2 left-1/2 transform -translate-x-1/2"
        style={{ maxWidth: "calc(100% - 2rem)" }}
      >
        <InputBar />
      </div>
    </div>
  );
}
function InputBar() {
  return (
    <div className="rounded-xl border shadow-lg bg-background p-3 flex gap-3 items-center backdrop-blur-sm bg-opacity-80">
      <Authenticated>
        <CreateTodoInput />
      </Authenticated>
      <Unauthenticated>
        <div className="text-muted-foreground">
          Please sign in to add todos.
        </div>
      </Unauthenticated>
    </div>
  );
}
function SearchBar() {
  //Search bar constants
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [debounceSearch, setDebounceSearch] = useState("");

  //Valid tags
  const validTags = ["#personal", "#work", "#bills", "#urgent"];

  //Table constants
  const todos = useQuery(api.todos.getTodos);
  const markTodoAsDone = useMutation(api.todos.markAsDone);
  const deleteTodo = useMutation(api.todos.deleteTodo);

  //Filter constants
  const [filterTag, setFilterTag] = useState("");
  
  //Debouncer
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearch(searchValue);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSearchInput = (input: string) => {
    input = input.trim();

    if (input.includes("#")) {
      const tagMatch = input.substring(input.indexOf("#")).match(/#\w+/);
      if (tagMatch) {
        const potentialTag = tagMatch[0];
        if(potentialTag == undefined) return { type: "title", value: input };
      
      if (validTags.includes(potentialTag.toLowerCase())) {
        return { type: "tag", value: potentialTag };
      }}
    } else {
      return { type: "title", value: input };
    }
  };

  const searchInput = handleSearchInput(debounceSearch);

  const titleSearchResults = useQuery(
    api.todos.searchTodo, 
    searchInput?.type === "title" && searchInput.value.trim() 
      ? { title: searchInput.value } 
      : "skip"
  );

  let searchResults;

  if(searchInput && searchInput.type === "tag") {
searchResults = todos;
if(searchResults){
  searchResults = searchResults.filter((todo) => todo.tag === searchInput.value); 
}
  } else if (searchInput?.value.trim()) {
    searchResults = titleSearchResults;
  } else {
    searchResults = todos;
  }
  // let searchResults = debounceSearch.trim()
  //   ? useQuery(api.todos.searchTodo, { title: debounceSearch })
  //   : useQuery(api.todos.getTodos);

  if (filterTag.trim() && searchResults) {
    searchResults = searchResults.filter((todo) => todo.tag === filterTag);
  }
  //Loading state
  if (todos === undefined)
    return <p className="text-center py-4">Loading...</p>;

  if (todos.length === 0)
    return (
      <div className="text-center py-8 text-muted-foreground">
        No todos yet. Add some below!
      </div>
    );
  //Table functions
  const handleToggle = async (id: Id<"todos">) => {
    try {
      await markTodoAsDone({ id });
      toast.success("Todo status updated");
    } catch {
      toast.error("Failed to update todo");
    }
  };

  const handleDelete = async (id: Id<"todos">) => {
    try {
      await deleteTodo({ id });
      toast.success("Todo deleted");
    } catch {
      toast.error("Failed to delete todo");
    }
  };
  //Search bar functions
  const handleClearSearch = () => {
    setSearchValue("");
    setDebounceSearch("");
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleClearSearch();
    }
  };
  //Filter functions
  const handleFilter = (tag: string) => {
    setFilterTag(tag);
  };
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-5 rounded-lg p-2 flex-grow">
        <Input
          className="w-full focus-visible:ring-offset-0 pr-8 py-6 text-base"
          disabled={loading}
          placeholder="Search your todo here..."
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          value={searchValue}
        />
      </div>
      <div className="flex gap-5">
        <Button
          variant={filterTag === "" ? "default" : "ghost"}
          onClick={() => handleFilter("")}
        >
          All tags
        </Button>
        <Button
          variant={filterTag === "#personal" ? "default" : "ghost"}
          onClick={() => handleFilter("#personal")}
        >
          #personal
        </Button>

        <Button
          variant={filterTag === "#work" ? "default" : "ghost"}
          onClick={() => handleFilter("#work")}
        >
          #work
        </Button>
        <Button
          variant={filterTag === "#bills" ? "default" : "ghost"}
          onClick={() => handleFilter("#bills")}
        >
          #bills
        </Button>
        <Button
          variant={filterTag === "#urgent" ? "default" : "ghost"}
          onClick={() => handleFilter("#urgent")}
        >
          #urgent
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden bg-background shadow-md">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full table-fixed">
            {/* <thead className="sticky top-0 bg-background border-b-2 border-border z-10">
              <tr>
                <th className="p-3 text-left font-medium w-16">Status</th>
                <th className="p-3 text-left font-medium">Todo</th>
                <th className="p-3 text-left font-medium w-16">Action</th>
              </tr>
            </thead> */}
            <tbody className="overflow-y-auto ">
              {searchResults &&
                searchResults.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t hover:bg-muted/20 transition-colors group"
                  >
                    <td className="p-3 w-16">
                      <button
                        onClick={() => handleToggle(item._id)}
                        className={`h-6 w-6 rounded-full border flex items-center justify-center transition-all ${
                          item.done
                            ? "bg-primary border-primary"
                            : "border-gray-300 hover:border-primary/50"
                        }`}
                      >
                        {item.done && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="p-3 flex-col">
                      <span
                        className={`text-base block ${
                          item.done ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.tag && (
                        <div className="pt-2">
                          <Button variant="ghost">{item.tag}</Button>
                        </div>
                      )}
                    </td>
                    <td className="p-3 w-16 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Ellipsis className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-background p-2 rounded-lg shadow-lg w-40"
                        >
                          <DropdownMenuItem className="flex items-center gap-2 hover:cursor-pointer hover:text-border transition-colors text-foreground hover:bg-secondary/20 rounded-lg px-2 py-1">
                            <Pencil className="w-4 h-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item._id)}
                            className="flex items-center gap-2 hover:cursor-pointer hover:text-border transition-colors text-foreground hover:bg-secondary/20 rounded-lg px-2 py-1"
                          >
                            <Trash className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                      {/* <button
                        onClick={() => handleDelete(item._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash className="text-border hover:text-foreground/90 transition-colors" />
                      </button> */}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CreateTodoInput() {
  const createTodo = useMutation(api.todos.createTodo);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const [tag, setTag] = React.useState("#personal");

  const handleSubmit = async () => {
    if (!title.trim() || loading) return;
    setLoading(true);
    try {
      await createTodo({ title, tag });
      setTitle("");
      toast.success("Todo added");
    } catch {
      toast.error("Failed to add todo");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-1 flex gap-3 items-center">
      <div className="flex-1 relative flex gap-3 items-center ">
        <Input
          className="w-full focus-visible:ring-offset-0 pr-8 py-6 text-base"
          disabled={loading}
          placeholder="Type your todo here..."
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          value={title}
        />
        {title.trim() && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}
      </div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default">Tags</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-background p-5 rounded-xl shadow mx-5 my-10"
            align="start"
          >
            <DropdownMenuRadioGroup value={tag} onValueChange={setTag}>
              <DropdownMenuRadioItem
                value="#personal"
                className="hover:bg-secondary rounded-xl px-2 py-1 flex gap-2"
              >
                Personal
                {tag == "#personal" && <Check className="w-4" />}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="#work"
                className="hover:bg-secondary rounded-xl px-2 py-1 flex gap-2"
              >
                Work
                {tag == "#work" && <Check className="w-4" />}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="#bills"
                className="hover:bg-secondary rounded-xl px-2 py-1 flex gap-2"
              >
                Bills
                {tag == "#bills" && <Check className="w-4" />}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="#urgent"
                className="hover:bg-secondary rounded-xl px-2 py-1 flex gap-2"
              >
                Urgent
                {tag == "#urgent" && <Check className="w-4" />}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
