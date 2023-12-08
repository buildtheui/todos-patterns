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

// publish a event using the global event bus
const publish = (event: EventsValues, data: Data) => {
  // a custom event is created
  const ev = new CustomEvent<Data>(event, { detail: data });
  // the custom event is dispatched using the global event bus
  window.dispatchEvent(ev);
};

const listenerToPublish = (event: EventsValues, data: Data) => {
  return (ev: MouseEvent | KeyboardEvent) => {
    data.ev = ev;
    return publish(event, data);
  };
};

export const init = () => {
  const todoInputEl = createTodoInputEl();
  const todoListEl = createTodoListEl();

  // Get the body element from the DOM
  const bodyEl = document.getElementById("body") as HTMLDivElement;
  // Append the todo input and the todo list to the body
  bodyEl.append(todoInputEl, todoListEl);

  // Subsbribe to the add-todo
  window.addEventListener(EVENTS.addTodo, (({
    detail: data,
  }: CustomEvent<Data>) => {
    // Create a li element for the todo item
    const todoItemEl = createListItem(data.text as string);
    const actionsEl = createActionsContainer();

    todoItemEl.append(actionsEl);
    todoListEl.append(todoItemEl);
    // Add the check and delete buttons to the todo item
    publish(EVENTS.addCheckAction, { targets: [todoItemEl, actionsEl] });
    publish(EVENTS.addDeleteAction, {
      targets: [todoItemEl, actionsEl],
    });
    // Add the update functionality to the todo item
    publish(EVENTS.addUpdateAction, { targets: [todoItemEl] });
  }) as EventListener);

  // Subscribe to add check action
  window.addEventListener(EVENTS.addCheckAction, (({
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
      listenerToPublish(EVENTS.checkTodo, { targets: [todoItemEl] })
    );
  }) as EventListener);

  // strike through the todo
  window.addEventListener(EVENTS.checkTodo, (({
    detail: data,
  }: CustomEvent<Data>) => {
    if (!data.targets) return;
    data.ev?.stopPropagation();
    const [todoItemEl] = data.targets;
    todoItemEl.classList.toggle("line-through");
  }) as EventListener);

  // subscribe to add delete action
  window.addEventListener(EVENTS.addDeleteAction, (({
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
      listenerToPublish(EVENTS.deleteTodo, { targets: [todoItemEl] })
    );
  }) as EventListener);

  // Remove todo
  window.addEventListener(EVENTS.deleteTodo, (({
    detail: data,
  }: CustomEvent<Data>) => {
    if (!data.targets) return;
    data.ev?.stopPropagation();
    const [todoItemEl] = data.targets;
    todoItemEl.remove();
  }) as EventListener);

  // set up logic to update todo when clicking on it
  window.addEventListener(EVENTS.addUpdateAction, (({
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
      listenerToPublish(EVENTS.updateClick, {
        targets: [todoItemEl, updateInput],
      })
    );

    // Add an event listener to the update input to replace the text of the todo item
    updateInput.addEventListener(
      "keydown",
      listenerToPublish(EVENTS.updateEnter, { targets: [todoItemEl] })
    );
  }) as EventListener);

  // click to update todo
  window.addEventListener(EVENTS.updateClick, (({
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

  window.addEventListener(EVENTS.updateEnter, (({
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
      publish(EVENTS.addTodo, {
        text: (ev.target as HTMLInputElement).value,
      });

      (ev.target as HTMLInputElement).value = "";
    }
  });
};
