// ul element for the todo list
export const createTodoListEl = (): HTMLUListElement => {
  const el = document.createElement("ul");
  el.classList.add("todo-list");
  return el;
};
