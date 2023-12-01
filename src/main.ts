import { init as basicInit, cleanup as basicClean } from "./basic-todo";
import "./style.css";

const todos = {
  basic: [basicInit, basicClean],
};

const appEl: HTMLDivElement = document.getElementById("app") as HTMLDivElement;

// A list of link elements that when clicked will render a different TODO
const MenuHTML = `
    <h1>TODOs patterns</h1>
    <div id="menu">
        ${Object.keys(todos)
          .map((todo) => {
            return `<a href="#" data-todo="${todo}" style="text-decoration:underline;">
                    ${todo.toUpperCase()} TODO
                </a>`;
          })
          .join("")}
    </div>
    <a href="#" id="back" class="back hidden">Back</a>
    <div id="body"></div>
    `;

const menuEl: HTMLDivElement = document.createElement("div");
menuEl.innerHTML = MenuHTML;
appEl.append(menuEl);

const back = document.getElementById("back");
const menu = document.getElementById("menu");
const body = document.getElementById("body");

const onMenuClick = (ev: MouseEvent) => {
  ev.preventDefault();
  const target = ev.target as HTMLAnchorElement;
  if (target.dataset?.todo) {
    initTodo(target.dataset.todo);
  }
};

const backToMenu = (ev: MouseEvent) => {
  ev.preventDefault();

  menu?.classList.remove("hidden");
  back?.classList.add("hidden");
  body?.replaceChildren();
};

const initTodo = (todo: string) => {
  const selectedTodo = todos[todo as keyof typeof todos];
  if (!selectedTodo) {
    return;
  }
  const [init, cleanup] = selectedTodo;

  cleanup();
  init();
  menu?.classList.add("hidden");
  back?.classList.remove("hidden");
};

appEl.addEventListener("click", onMenuClick);
back?.addEventListener("click", backToMenu);
