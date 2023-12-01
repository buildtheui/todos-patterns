import "./style.css";

const listeners = [];

const appEl: HTMLDivElement = document.getElementById("app") as HTMLDivElement;

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
};

const addCheckButton = (liEl: HTMLLIElement, actionsEl: HTMLDivElement) => {
  const checkBtn = document.createElement("button");
  checkBtn.innerHTML = "&check;";
  actionsEl.append(checkBtn);

  const onCheck = (ev: MouseEvent) => {
    ev.stopPropagation();
    liEl.classList.toggle("line-through");
  };

  listeners.push(onCheck);
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

  listeners.push(onDelete);
  checkBtn.addEventListener("click", onDelete);
};

const todoAddListener = (ev: KeyboardEvent) => {
  if (ev.key === "Enter") {
    appendTodo((ev.target as HTMLInputElement).value);
    (ev.target as HTMLInputElement).value = "";
  }
};

todoInputEl.addEventListener("keydown", todoAddListener);

appEl.append(todoInputEl, todoListEl);
