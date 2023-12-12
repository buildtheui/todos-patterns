import { createButton } from "./elements/button";
import { createListItem } from "./elements/list-item";
import { createActionsContainer } from "./elements/todo-actions-container";
import { createTodoInputEl } from "./elements/todo-input";
import { createTodoListEl } from "./elements/todo-list-container";

const EVENTS = {
  addTodo: "add-todo",
  checkTodo: "check-todo",
  deleteTodo: "delete-todo",
  updateClick: "update-click",
  updateEnter: "update-enter",
  addCheckAction: "add-check-action",
  addDeleteAction: "add-delete-action",
  addUpdateAction: "add-update-action",
} as const;

type EventsValues = (typeof EVENTS)[keyof typeof EVENTS];

type Data = {
  text?: string;
  targets?: HTMLElement[];
  ev?: KeyboardEvent | MouseEvent;
};

// Holds the action logic to all todos data actions
class TodosStore extends EventTarget {
  constructor() {
    super();
  }

  addTodo(text: Data["text"]) {
    this.publishData(EVENTS.addTodo, { text });
  }

  checkTodo(data: Data) {
    this.publishData(EVENTS.checkTodo, data);
  }

  deleteTodo(data: Data) {
    this.publishData(EVENTS.deleteTodo, data);
  }

  updateClick(data: Data) {
    this.publishData(EVENTS.updateClick, data);
  }

  updateEnter(data: Data) {
    this.publishData(EVENTS.updateEnter, data);
  }

  addCheckAction(targets: Data["targets"]) {
    this.publishData(EVENTS.addCheckAction, { targets });
  }

  addUpdateAction(targets: Data["targets"]) {
    this.publishData(EVENTS.addUpdateAction, { targets });
  }

  addDeleteAction(targets: Data["targets"]) {
    this.publishData(EVENTS.addDeleteAction, { targets });
  }

  private publishData(event: EventsValues, data: Data) {
    this.dispatchEvent(
      new CustomEvent<Data>(event, {
        detail: {
          ...data,
        },
      })
    );
  }
}

const listenerToAction = (action: (data: Data) => void, data: Data) => {
  return (ev: MouseEvent | KeyboardEvent) => {
    data.ev = ev;
    return action(data);
  };
};

export const init = () => {
  const todos = new TodosStore();
  const todoInputEl = createTodoInputEl();
  const todoListEl = createTodoListEl();

  // Get the body element from the DOM
  const bodyEl = document.getElementById("body") as HTMLDivElement;
  // Append the todo input and the todo list to the body
  bodyEl.append(todoInputEl, todoListEl);

  // Subsbribe to the add-todo
  todos.addEventListener(EVENTS.addTodo, (({
    detail: data,
  }: CustomEvent<Data>) => {
    // Create a li element for the todo item
    const todoItemEl = createListItem(data.text as string);
    const actionsEl = createActionsContainer();

    todoItemEl.append(actionsEl);
    todoListEl.append(todoItemEl);
    // Add the check and delete buttons to the todo item
    todos.addCheckAction([todoItemEl, actionsEl]);
    todos.addDeleteAction([todoItemEl, actionsEl]);
    // Add the update functionality to the todo item
    todos.addUpdateAction([todoItemEl]);
  }) as EventListener);

  // Subscribe to add check action
  todos.addEventListener(EVENTS.addCheckAction, (({
    detail: data,
  }: CustomEvent<Data>) => {
    if (!data.targets) return;

    const [todoItemEl, actionsEl] = data.targets;
    // Create a button for checking off a todo item
    const checkBtn = createButton("✔");
    actionsEl?.append(checkBtn);

    // Add an event listener to the check button to toggle the line-through class
    checkBtn.addEventListener(
      "click",
      listenerToAction(todos.checkTodo.bind(todos), { targets: [todoItemEl] })
    );
  }) as EventListener);

  // strike through the todo
  todos.addEventListener(EVENTS.checkTodo, (({
    detail: data,
  }: CustomEvent<Data>) => {
    if (!data.targets) return;
    data.ev?.stopPropagation();
    const [todoItemEl] = data.targets;
    todoItemEl.classList.toggle("line-through");
  }) as EventListener);

  // subscribe to add delete action
  todos.addEventListener(EVENTS.addDeleteAction, (({
    detail: data,
  }: CustomEvent<Data>) => {
    if (!data.targets) return;

    const [todoItemEl, actionsEl] = data.targets;
    // Create a button for deleting a todo item
    const deleteBtn = createButton("x");
    deleteBtn.style.backgroundColor = "red";
    actionsEl?.append(deleteBtn);

    // Add an event listener to the delete button to remove the todo item
    deleteBtn.addEventListener(
      "click",
      listenerToAction(todos.deleteTodo.bind(todos), { targets: [todoItemEl] })
    );
  }) as EventListener);

  // Remove todo
  todos.addEventListener(EVENTS.deleteTodo, (({
    detail: data,
  }: CustomEvent<Data>) => {
    if (!data.targets) return;
    data.ev?.stopPropagation();
    const [todoItemEl] = data.targets;
    todoItemEl.remove();
  }) as EventListener);

  // set up logic to update todo when clicking on it
  todos.addEventListener(EVENTS.addUpdateAction, (({
    detail: data,
  }: CustomEvent<Data>) => {
    if (!data.targets) return;
    const [todoItemEl] = data.targets;
    // Create an input element for updating the todo item
    const updateInput: HTMLInputElement = document.createElement("input");
    updateInput.placeholder = "Update TODO";

    // Add an event listener to the todo item to replace the text with the update input
    todoItemEl.addEventListener(
      "click",
      listenerToAction(todos.updateClick.bind(todos), {
        targets: [todoItemEl, updateInput],
      })
    );

    // Add an event listener to the update input to replace the text of the todo item
    updateInput.addEventListener(
      "keydown",
      listenerToAction(todos.updateEnter.bind(todos), { targets: [todoItemEl] })
    );
  }) as EventListener);

  // click to update todo
  todos.addEventListener(EVENTS.updateClick, (({
    detail: data,
  }: CustomEvent<Data>) => {
    if (!data.targets) return;
    data.ev?.stopPropagation();

    const [todoItemEl, updateInput] = data.targets;

    if ((data.ev?.target as HTMLLIElement).nodeName === "INPUT") {
      return;
    }

    // Replace the text of the todo item with the update input
    const [text, ...actions] = todoItemEl.childNodes;
    (updateInput as HTMLInputElement).value = text.textContent as string;
    todoItemEl.replaceChildren(updateInput, ...actions);
  }) as EventListener);

  todos.addEventListener(EVENTS.updateEnter, (({
    detail: data,
  }: CustomEvent<Data>) => {
    if (!data.targets) return;
    data.ev?.stopPropagation();

    const [todoItemEl] = data.targets;

    if (
      (data.ev as KeyboardEvent)?.key === "Enter" &&
      (data.ev?.target as HTMLInputElement).value !== ""
    ) {
      const newText = (data.ev?.target as HTMLInputElement).value;
      const [_input, ...actions] = todoItemEl.childNodes;
      todoItemEl.replaceChildren(newText, ...actions);
    }
  }) as EventListener);

  // Add an event listener to the todo input to append a new todo item when Enter is pressed
  todoInputEl.addEventListener("keydown", (ev: KeyboardEvent) => {
    if (ev.key === "Enter" && (ev.target as HTMLInputElement).value !== "") {
      // Publish the todo data to be read by the subscriber/s
      todos.addTodo((ev.target as HTMLInputElement).value);

      (ev.target as HTMLInputElement).value = "";
    }
  });
};
