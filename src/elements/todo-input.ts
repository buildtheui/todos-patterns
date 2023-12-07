// Input element for adding todos
export const createTodoInputEl = (): HTMLInputElement => {
  const el = document.createElement("input") as HTMLInputElement;
  el.type = "text";
  el.placeholder = "Add todo";
  el.classList.add("todo-add__input");
  return el;
};
