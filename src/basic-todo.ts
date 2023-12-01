const listeners: [
  evType: keyof HTMLElementEventMap,
  listener: (ev: any) => void
][] = [];

export const init = () => {
  const bodyEl: HTMLDivElement = document.getElementById(
    "body"
  ) as HTMLDivElement;

  const todoInputEl: HTMLInputElement = document.createElement(
    "Input"
  ) as HTMLInputElement;
  todoInputEl.type = "text";
  todoInputEl.placeholder = "Add todo";
  todoInputEl.classList.add("todo-add__input");

  const todoListEl: HTMLUListElement = document.createElement("ul");
  todoListEl.classList.add("todo-list");

  const appendTodo = (todo: string) => {
    const liEl: HTMLLIElement = document.createElement("li");
    const actionsEl: HTMLDivElement = document.createElement("div");
    actionsEl.classList.add("actions");

    liEl.append(todo);
    liEl.append(actionsEl);
    todoListEl.append(liEl);
    addCheckButton(liEl, actionsEl);
    addDeleteButton(liEl, actionsEl);
    addUpdate(liEl);
  };

  const addCheckButton = (liEl: HTMLLIElement, actionsEl: HTMLDivElement) => {
    const checkBtn = document.createElement("button");
    checkBtn.innerHTML = "&check;";
    actionsEl.append(checkBtn);

    const onCheck = (ev: MouseEvent) => {
      ev.stopPropagation();
      liEl.classList.toggle("line-through");
    };

    listeners.push(["click", onCheck]);
    checkBtn.addEventListener("click", onCheck);
  };

  const addDeleteButton = (liEl: HTMLLIElement, actionsEl: HTMLDivElement) => {
    const checkBtn = document.createElement("button");
    checkBtn.style.backgroundColor = "red";
    checkBtn.innerHTML = "x";
    actionsEl.append(checkBtn);

    const onDelete = (ev: MouseEvent) => {
      ev.stopPropagation();
      liEl.remove();
    };

    listeners.push(["click", onDelete]);
    checkBtn.addEventListener("click", onDelete);
  };

  const addUpdate = (liEl: HTMLLIElement) => {
    const updateInput: HTMLInputElement = document.createElement("input");
    updateInput.placeholder = "Update TODO";

    const onUpdateText = (ev: KeyboardEvent) => {
      ev.stopPropagation();

      if (ev.key === "Enter") {
        const newText = (ev.target as HTMLInputElement).value;
        const [_input, ...actions] = liEl.childNodes;
        liEl.replaceChildren(newText, ...actions);
      }
    };

    const onClickUpdate = (ev: MouseEvent) => {
      ev.stopPropagation();

      if ((ev.target as HTMLLIElement).nodeName === "INPUT") {
        return;
      }

      const [text, ...actions] = liEl.childNodes;
      updateInput.value = text.textContent as string;
      liEl.replaceChildren(updateInput, ...actions);
    };

    listeners.push(["click", onClickUpdate]);
    listeners.push(["keydown", onUpdateText]);

    liEl.addEventListener("click", onClickUpdate);
    updateInput.addEventListener("keydown", onUpdateText);
  };

  const todoAddListener = (ev: KeyboardEvent) => {
    if (ev.key === "Enter") {
      appendTodo((ev.target as HTMLInputElement).value);
      (ev.target as HTMLInputElement).value = "";
    }
  };

  listeners.push(["keydown", todoAddListener]);
  todoInputEl.addEventListener("keydown", todoAddListener);

  bodyEl.append(todoInputEl, todoListEl);
};

export const cleanup = () => {
  listeners.forEach(([evType, listener]) =>
    document.removeEventListener(evType, listener)
  );
};
