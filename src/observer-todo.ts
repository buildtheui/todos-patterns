import { createButton } from "./elements/button";
import { createListItem } from "./elements/list-item";
import { createActionsContainer } from "./elements/todo-actions-container";
import { createTodoInputEl } from "./elements/todo-input";
import { createTodoListEl } from "./elements/todo-list-container";

type Data = {
  text?: string;
  targets?: HTMLElement[];
  ev?: KeyboardEvent | MouseEvent;
};

class Subject {
  private observer: Set<Observer>;

  constructor() {
    this.observer = new Set();
  }

  addObserver(observer: Observer) {
    this.observer.add(observer);
  }

  removeObserver(observer: Observer) {
    this.observer.delete(observer);
  }

  clear() {
    this.observer.clear();
  }

  notify(data: unknown) {
    this.observer.forEach((observer) => observer.update(data));
  }
}

class Observer {
  constructor(private subscribe: (data: unknown) => void) {}

  update(data: unknown) {
    this.subscribe(data);
  }
}

const listenerToAction = (action: (data: Data) => void, data: Data) => {
  return (ev: MouseEvent | KeyboardEvent) => {
    data.ev = ev;
    return action(data);
  };
};

export const init = () => {
  // Subjects to notify changes
  const addTodoSub = new Subject();
  const checkTodoSub = new Subject();
  const deleteTodoSub = new Subject();
  const updateClickSub = new Subject();
  const updateEnterSub = new Subject();
  const addCheckActionSub = new Subject();
  const addUpdateActionSub = new Subject();
  const addDeleteActionSub = new Subject();

  const todoInputEl = createTodoInputEl();
  const todoListEl = createTodoListEl();

  // Get the body element from the DOM
  const bodyEl = document.getElementById("body") as HTMLDivElement;
  // Append the todo input and the todo list to the body
  bodyEl.append(todoInputEl, todoListEl);

  // Subsbribe to the add-todo
  const todoObs = new Observer((data) => {
    // Create a li element for the todo item
    const todoItemEl = createListItem(data as string);
    const actionsEl = createActionsContainer();

    todoItemEl.append(actionsEl);
    todoListEl.append(todoItemEl);
    // Add the check and delete buttons to the todo item
    addCheckActionSub.notify({ targets: [todoItemEl, actionsEl] });
    addDeleteActionSub.notify({ targets: [todoItemEl, actionsEl] });
    // Add the update functionality to the todo item
    addUpdateActionSub.notify({ targets: [todoItemEl] });
  });

  // subscribe
  addTodoSub.addObserver(todoObs);

  // Subscribe to add check action
  const addCheckActionObs = new Observer((data) => {
    if (!(data as Data).targets) return;

    const [todoItemEl, actionsEl] = (data as Data).targets!;
    // Create a button for checking off a todo item
    const checkBtn = createButton("✔");
    actionsEl?.append(checkBtn);

    // Add an event listener to the check button to toggle the line-through class
    checkBtn.addEventListener(
      "click",
      listenerToAction(checkTodoSub.notify.bind(checkTodoSub), {
        targets: [todoItemEl],
      })
    );
  });

  // subscribe
  addCheckActionSub.addObserver(addCheckActionObs);

  // strike through the todo
  const checkTodoObs = new Observer((data) => {
    if (!(data as Data).targets) return;
    (data as Data).ev?.stopPropagation();
    const [todoItemEl] = (data as Data).targets!;
    todoItemEl.classList.toggle("line-through");
  });

  checkTodoSub.addObserver(checkTodoObs);

  // subscribe to add delete action
  const addDeleteActionObs = new Observer((data) => {
    if (!(data as Data).targets) return;

    const [todoItemEl, actionsEl] = (data as Data).targets!;
    // Create a button for deleting a todo item
    const deleteBtn = createButton("x");
    deleteBtn.style.backgroundColor = "red";
    actionsEl?.append(deleteBtn);

    // Add an event listener to the delete button to remove the todo item
    deleteBtn.addEventListener(
      "click",
      listenerToAction(deleteTodoSub.notify.bind(deleteTodoSub), {
        targets: [todoItemEl],
      })
    );
  });

  // Subscribe
  addDeleteActionSub.addObserver(addDeleteActionObs);

  // Remove todo
  const deleteTodoObs = new Observer((data) => {
    if (!(data as Data).targets) return;
    (data as Data).ev?.stopPropagation();
    const [todoItemEl] = (data as Data).targets!;
    todoItemEl.remove();
  });

  // subscribe
  deleteTodoSub.addObserver(deleteTodoObs);

  // set up logic to update todo when clicking on it
  const addUpdateActionObs = new Observer((data) => {
    if (!(data as Data).targets) return;
    const [todoItemEl] = (data as Data).targets!;
    // Create an input element for updating the todo item
    const updateInput: HTMLInputElement = document.createElement("input");
    updateInput.placeholder = "Update TODO";

    // Add an event listener to the todo item to replace the text with the update input
    todoItemEl.addEventListener(
      "click",
      listenerToAction(updateClickSub.notify.bind(updateClickSub), {
        targets: [todoItemEl, updateInput],
      })
    );

    // Add an event listener to the update input to replace the text of the todo item
    updateInput.addEventListener(
      "keydown",
      listenerToAction(updateEnterSub.notify.bind(updateEnterSub), {
        targets: [todoItemEl],
      })
    );
  });

  //subscribe
  addUpdateActionSub.addObserver(addUpdateActionObs);

  // click to update todo
  const updateClickObs = new Observer((data) => {
    if (!(data as Data).targets) return;
    (data as Data).ev?.stopPropagation();

    const [todoItemEl, updateInput] = (data as Data).targets!;

    if (((data as Data).ev?.target as HTMLLIElement).nodeName === "INPUT") {
      return;
    }

    // Replace the text of the todo item with the update input
    const [text, ...actions] = todoItemEl.childNodes;
    (updateInput as HTMLInputElement).value = text.textContent as string;
    todoItemEl.replaceChildren(updateInput, ...actions);
  });

  // subscribe
  updateClickSub.addObserver(updateClickObs);

  const updateEnterObs = new Observer((data) => {
    if (!(data as Data).targets) return;
    (data as Data).ev?.stopPropagation();

    const [todoItemEl] = (data as Data).targets!;

    if (
      ((data as Data).ev as KeyboardEvent)?.key === "Enter" &&
      ((data as Data).ev?.target as HTMLInputElement).value !== ""
    ) {
      const newText = ((data as Data).ev?.target as HTMLInputElement).value;
      const [_input, ...actions] = todoItemEl.childNodes;
      todoItemEl.replaceChildren(newText, ...actions);
    }
  });

  // subscribe
  updateEnterSub.addObserver(updateEnterObs);

  // Add an event listener to the todo input to append a new todo item when Enter is pressed
  todoInputEl.addEventListener("keydown", (ev: KeyboardEvent) => {
    if (ev.key === "Enter" && (ev.target as HTMLInputElement).value !== "") {
      // Publish the todo data to be read by the subscriber/s
      addTodoSub.notify((ev.target as HTMLInputElement).value);
      (ev.target as HTMLInputElement).value = "";
    }
  });
};
