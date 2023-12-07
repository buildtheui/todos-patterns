import { createTodoInputEl } from "./elements/todo-input";
import { createTodoListEl } from "./elements/todo-list-container";
import { createActionsContainer } from "./elements/todo-actions-container";
import { createButton } from "./elements/button";
import { createListItem } from "./elements/list-item";

// This function initializes the todo list
export const init = () => {
  const todoInputEl = createTodoInputEl();
  const todoListEl = createTodoListEl();

  // Get the body element from the DOM
  const bodyEl = document.getElementById("body") as HTMLDivElement;
  // Append the todo input and the todo list to the body
  bodyEl.append(todoInputEl, todoListEl);

  // This function appends a todo item to the todo list
  const appendTodo = (todoText: string) => {
    // Create a li element for the todo item
    const todoItemEl = createListItem(todoText);
    const actionsEl = createActionsContainer();

    todoItemEl.append(actionsEl);
    todoListEl.append(todoItemEl);
    // Add the check and delete buttons to the todo item
    addCheckButton(todoItemEl, actionsEl);
    addDeleteButton(todoItemEl, actionsEl);
    // Add the update functionality to the todo item
    addUpdate(todoItemEl);
  };

  // This function adds a check button to a todo item
  const addCheckButton = (
    todoItemEl: HTMLLIElement,
    actionsEl: HTMLDivElement
  ) => {
    // Create a button for checking off a todo item
    const checkBtn = createButton("✔");
    actionsEl.append(checkBtn);

    // Add an event listener to the check button to toggle the line-through class
    checkBtn.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();
      todoItemEl.classList.toggle("line-through");
    });
  };

  // This function adds a delete button to a todo item
  const addDeleteButton = (
    todoItemEl: HTMLLIElement,
    actionsEl: HTMLDivElement
  ) => {
    // Create a button for deleting a todo item
    const deleteBtn = createButton("x");
    deleteBtn.style.backgroundColor = "red";
    actionsEl.append(deleteBtn);

    // Add an event listener to the delete button to remove the todo item
    deleteBtn.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();
      todoItemEl.remove();
    });
  };

  // This function adds the update functionality to a todo item
  const addUpdate = (todoItemEl: HTMLLIElement) => {
    // Create an input element for updating the todo item
    const updateInput: HTMLInputElement = document.createElement("input");
    updateInput.placeholder = "Update TODO";

    // Add an event listener to the todo item to replace the text with the update input
    todoItemEl.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();

      if ((ev.target as HTMLLIElement).nodeName === "INPUT") {
        return;
      }

      // Replace the text of the todo item with the update input
      const [text, ...actions] = todoItemEl.childNodes;
      updateInput.value = text.textContent as string;
      todoItemEl.replaceChildren(updateInput, ...actions);
    });

    // Add an event listener to the update input to replace the text of the todo item
    updateInput.addEventListener("keydown", (ev: KeyboardEvent) => {
      ev.stopPropagation();

      if (ev.key === "Enter" && (ev.target as HTMLInputElement).value !== "") {
        const newText = (ev.target as HTMLInputElement).value;
        const [_input, ...actions] = todoItemEl.childNodes;
        todoItemEl.replaceChildren(newText, ...actions);
      }
    });
  };

  // Add an event listener to the todo input to append a new todo item when Enter is pressed
  todoInputEl.addEventListener("keydown", (ev: KeyboardEvent) => {
    if (ev.key === "Enter" && (ev.target as HTMLInputElement).value !== "") {
      appendTodo((ev.target as HTMLInputElement).value);
      (ev.target as HTMLInputElement).value = "";
    }
  });
};
