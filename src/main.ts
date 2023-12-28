import { camelCaseToSpace } from "./utils/generate";
import { init as basicInit } from "./basic-todo";
import { init as pubSubInit } from "./pubsub-todo";
import { init as pubSubCustomInit } from "./pubsub-custom-todo";
import { init as pubSubEventTargetInit } from "./pubsub-event-target-todo";
import { init as observerTodoInit } from "./observer-todo";
import "./style.css";

// Define a todos object with the basic todo init function
const todos = {
  basic: basicInit,
  pubSub: pubSubInit,
  pubSubCustomEvent: pubSubCustomInit,
  pubSubEventTarget: pubSubEventTargetInit,
  observer: observerTodoInit,
};

// Get the app element from the DOM
const appEl: HTMLDivElement = document.getElementById("app") as HTMLDivElement;

// Define the HTML for the menu
const MenuHTML = `
        <h1>TODOs patterns</h1>
        <div id="menu" class="menu">
                ${Object.keys(todos)
                  .map((todo) => {
                    // Create a link for each todo type
                    return `<a href="#" data-todo="${todo}" style="text-decoration:underline;">
                                ${camelCaseToSpace(todo)} TODO
                             </a>`;
                  })
                  .join("\n")}
        </div>
        <a href="#" id="back" class="back hidden">Back</a>
        <div id="body"></div>
        `;

// Create a div for the menu and set its innerHTML to the MenuHTML
const menuEl: HTMLDivElement = document.createElement("div");
menuEl.innerHTML = MenuHTML;
// Append the menu to the app element
appEl.append(menuEl);

// Get the back and menu elements from the DOM
const back = document.querySelector("#back");
const menu = document.querySelector("#menu");

// Define a function to handle menu clicks
const onMenuClick = (ev: MouseEvent) => {
  ev.preventDefault();
  const target = ev.target as HTMLAnchorElement;
  // If the clicked element has a todo data attribute, initialize the corresponding todo
  if (target.dataset?.todo) {
    initTodo(target.dataset.todo);
  }
};

// Define a function to handle back button clicks
const backToMenu = (ev: MouseEvent) => {
  ev.preventDefault();
  // Show the menu and hide the back button
  menu?.classList.remove("hidden");
  back?.classList.add("hidden");
  // Clean up the body element
  cleanup();
};

// Define a function to clean up the body element
const cleanup = () => {
  const oldElement = document.querySelector("#body");
  const newElement: Element = oldElement?.cloneNode(true) as Element;
  newElement && oldElement?.parentNode?.replaceChild(newElement, oldElement);
  newElement?.replaceChildren();
};

// Define a function to initialize a todo
const initTodo = (todo: string) => {
  const selectedTodoInit = todos[todo as keyof typeof todos];
  if (!selectedTodoInit) {
    return;
  }

  // Call the init function, hide the menu and show the back button
  selectedTodoInit();
  menu?.classList.add("hidden");
  back?.classList.remove("hidden");
};

// Add event listeners for clicks on the app element and the back button
appEl.addEventListener("click", onMenuClick);
back?.addEventListener("click", backToMenu as EventListener);
