export const init = () => {
  const bodyEl = document.getElementById("body") as HTMLDivElement;

  const todoInputEl = document.createElement("input") as HTMLInputElement;
  todoInputEl.type = "text";
  todoInputEl.placeholder = "Add todo";
  todoInputEl.classList.add("todo-add__input");

  const todoListEl = document.createElement("ul");
  todoListEl.classList.add("todo-list");

  const appendTodo = (todoText: string) => {
    const todoItemEl = document.createElement("li");
    const actionsEl = document.createElement("div");
    actionsEl.classList.add("actions");

    todoItemEl.textContent = todoText;
    todoItemEl.append(actionsEl);
    todoListEl.append(todoItemEl);
    addCheckButton(todoItemEl, actionsEl);
    addDeleteButton(todoItemEl, actionsEl);
    addUpdate(todoItemEl);
  };

  const addCheckButton = (
    todoItemEl: HTMLLIElement,
    actionsEl: HTMLDivElement
  ) => {
    const checkBtn = document.createElement("button");
    checkBtn.textContent = "✔";
    actionsEl.append(checkBtn);

    checkBtn.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();
      todoItemEl.classList.toggle("line-through");
    });
  };

  const addDeleteButton = (
    todoItemEl: HTMLLIElement,
    actionsEl: HTMLDivElement
  ) => {
    const deleteBtn = document.createElement("button");
    deleteBtn.style.backgroundColor = "red";
    deleteBtn.textContent = "x";
    actionsEl.append(deleteBtn);

    deleteBtn.addEventListener("click", (ev: MouseEvent) => {
      ev.stopPropagation();
      todoItemEl.remove();
    });
  };

  const addUpdate = (todoItemEl: HTMLLIElement) => {
    const updateInput: HTMLInputElement = document.createElement("input");
    updateInput.placeholder = "Update TODO";

    updateInput.addEventListener("keydown", (ev: KeyboardEvent) => {
      ev.stopPropagation();

      if (ev.key === "Enter") {
        const newText = (ev.target as HTMLInputElement).value;
        const [_input, ...actions] = todoItemEl.childNodes;
        todoItemEl.replaceChildren(newText, ...actions);
      }
    });

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
  };

  todoInputEl.addEventListener("keydown", (ev: KeyboardEvent) => {
    if (ev.key === "Enter") {
      appendTodo((ev.target as HTMLInputElement).value);
      (ev.target as HTMLInputElement).value = "";
    }
  });

  bodyEl.append(todoInputEl, todoListEl);
};
