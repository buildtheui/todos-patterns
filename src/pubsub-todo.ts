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

type PartialRecord<K extends EventsValues, T> = {
  [P in K]?: T;
};

type Data = {
  text?: string;
  targets?: HTMLElement[];
  ev?: KeyboardEvent | MouseEvent;
};

type PubSub<DT extends Data> = {
  events: PartialRecord<EventsValues, ((data: DT) => void)[]>;
  publish(event: EventsValues, data: DT): void;
  subscribe(event: EventsValues, cb: (data: DT) => void): void;
  clear(): void;
};

const pubSub: PubSub<Data> = {
  events: {},
  publish(event, data) {
    this.events[event]?.forEach((cb) => cb(data));
  },
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]?.push(callback);
  },
  clear() {
    this.events = {};
  },
};

const listenerToPublish = (event: EventsValues, data: Data) => {
  return (ev: MouseEvent | KeyboardEvent) => {
    data.ev = ev;
    return pubSub.publish(event, data);
  };
};

export const init = () => {
  const todoInputEl = createTodoInputEl();
  const todoListEl = createTodoListEl();

  // clean up previous events
  pubSub.clear();

  // Get the body element from the DOM
  const bodyEl = document.getElementById("body") as HTMLDivElement;
  // Append the todo input and the todo list to the body
  bodyEl.append(todoInputEl, todoListEl);

  // Subsbribe to the add-todo
  pubSub.subscribe(EVENTS.addTodo, (data: Data) => {
    // Create a li element for the todo item
    const todoItemEl = createListItem(data.text as string);
    const actionsEl = createActionsContainer();

    todoItemEl.append(actionsEl);
    todoListEl.append(todoItemEl);
    // Add the check and delete buttons to the todo item
    pubSub.publish(EVENTS.addCheckAction, { targets: [todoItemEl, actionsEl] });
    pubSub.publish(EVENTS.addDeleteAction, {
      targets: [todoItemEl, actionsEl],
    });
    // Add the update functionality to the todo item
    pubSub.publish(EVENTS.addUpdateAction, { targets: [todoItemEl] });
  });

  // Subscribe to add check action
  pubSub.subscribe(EVENTS.addCheckAction, (data: Data) => {
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
  });

  // strike through the todo
  pubSub.subscribe(EVENTS.checkTodo, (data: Data) => {
    if (!data.targets) return;
    data.ev?.stopPropagation();
    const [todoItemEl] = data.targets;
    todoItemEl.classList.toggle("line-through");
  });

  // subscribe to add delete action
  pubSub.subscribe(EVENTS.addDeleteAction, (data: Data) => {
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
  });

  // Remove todo
  pubSub.subscribe(EVENTS.deleteTodo, (data: Data) => {
    if (!data.targets) return;
    data.ev?.stopPropagation();
    const [todoItemEl] = data.targets;
    todoItemEl.remove();
  });

  // set up logic to update todo when clicking on it
  pubSub.subscribe(EVENTS.addUpdateAction, (data: Data) => {
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
  });

  // click to update todo
  pubSub.subscribe(EVENTS.updateClick, (data: Data) => {
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
  });

  pubSub.subscribe(EVENTS.updateEnter, (data: Data) => {
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
  });

  // Add an event listener to the todo input to append a new todo item when Enter is pressed
  todoInputEl.addEventListener("keydown", (ev: KeyboardEvent) => {
    if (ev.key === "Enter" && (ev.target as HTMLInputElement).value !== "") {
      // Publish the todo data to be read by the subscriber/s
      pubSub.publish(EVENTS.addTodo, {
        text: (ev.target as HTMLInputElement).value,
      });

      (ev.target as HTMLInputElement).value = "";
    }
  });
};
