/* global axios */
const itemTemplate = document.querySelector("#diary-item-template");
const todoList = document.querySelector("#diaries");

const instance = axios.create({
  baseURL: "http://localhost:8000/api",
});

let isAdd;
let todoEdit; // the todo element that we want to edit
let filterCategory;

async function main() {
  setupEventListeners();
  try {
    const diaries = await getTodos();
    diaries.forEach((todo) => renderTodo(todo));
  } catch (error) {
    console.log(error);
    alert("Failed to load diaries!");
  }
}

function editPageEventListeners() {
  const modal = document.querySelector("#myModal");
  const filterModal = document.querySelector("#filter-modal");
  const modal2 = document.querySelector("myModal-2");
  const addDiaryButton = document.querySelector("#add-diary-button");
  const span = document.getElementsByClassName("close")[0];
  const addTodoButton = document.querySelector("#diary-add");
  addDiaryButton.addEventListener("click", () => {
    modal.style.display = "block";
    //modal.style.zIndex = "10";
    //modal
    /*addTodoButton.addEventListener("click", async () => {
      isAdd = 1;
      processInputDiary();
      isAdd = 0;
    });*/
    isAdd = 1;
  });
  span.addEventListener("click", () => {
    clearInputField();
    modal.style.display = "none";
  });

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
    if (event.target === modal2) {
      modal2.style.display = "none";
    }
    if (event.target === filterModal) {
      filterModal.style.display = "none";
    }
  };

  addTodoButton.addEventListener("click", async () => {
    processInputDiary();
    //isAdd = 0;
  });

  const filterButton = document.querySelector("#menu");
  filterButton.addEventListener("click", () => {
    console.log("click menu");
    filterModal.style.display = "block";
  });

  const filterEnter = document.querySelector("#filter-modal-enter");
  filterEnter.addEventListener("click", async () => {
    try {
      const diaries = await getTodos();
      const filterOption = document.querySelector("#filter-selection");
      todoList.textContent = "";
      diaries.forEach((todo) => {
        const desired = filterOption.options[filterOption.selectedIndex].text;
        filterCategory = desired;
        document.querySelector("#display-current-filter").innerHTML =
          "目前所顯示日記本：\n" + filterCategory;
        if (
          todo.tag == desired ||
          todo.mood == desired ||
          desired == "所有日記本"
        ) {
          console.log("ok");
          renderTodo(todo);
        }
      });
      filterModal.style.display = "none";
    } catch (error) {
      console.log(error);
      alert("Failed to load diaries!");
      filterModal.style.display = "none";
    }
  });

  const filterCancel = document.querySelector("#filter-modal-cancel");
  filterCancel.addEventListener("click", () => {
    filterModal.style.display = "none";
  });

  /*const dateInput = document.querySelector("#date-today");
  const dateResult = document.querySelector("#date-result");
  const tagInput = document.querySelector("#tag-choice");
  const moodInput = document.querySelector("#mood-choice");*/
  //addTodoButton.addEventListener("click", async () => {
  //  processInputDiary();
  /*const dateInput = document.querySelector("#date-today");
    const dateResult = document.querySelector("#date-result");
    const tagInput = document.querySelector("#tag-choice");
    const moodInput = document.querySelector("#mood-choice");

    //const todoInput = document.querySelector("#todo-input");
    const todoDescriptionInput = document.querySelector(
      "#diary-description-input",
    );
    
    //const date = dateInput.value;
    const date = dateResult.textContent;
    const tag = tagInput.value;
    const mood = moodInput.value;
    const description = todoDescriptionInput.value;
    if(!date) {
      alert("Please enter the date!");
      return;
    }
    if(!tag) {
      alert("Please enter the tag!");
      return;
    }
    if(!mood) {
      alert("Please enter the mood!");
      return;
    }
    if(!description) {
      alert("Please enter the description!");
      return;
    }

    let todo;
    try {
      //const todo = await createTodo({ title, description });
      todo = await createTodo({ date, tag, mood, description });
      renderTodo(todo);
    } catch (error) {
      alert("Failed to create todo!");
      modal.style.display = "none";
      return;
    }




    //todoInput.value = "";
    const today = new Date();
    dateInput.valueAsDate = new Date();
    dateResult.textContent = `${today.getFullYear()}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getDate().toString().padStart(2, '0')} (${today.toLocaleDateString('zh-TW', { weekday: 'short' })[1]})`;
    tagInput.value = "";
    moodInput.value = "";
    todoDescriptionInput.value = "";
    
    modal.style.display = "none";
    modal.zIndex = 0;

    showBrowsePage(todo);*/
  //});
}

function browsePageEventListeners() {
  //const todoElement =
}

function setupEventListeners() {
  editPageEventListeners();
  browsePageEventListeners();
}

function clearInputField() {
  const dateInput = document.querySelector("#date-today");
  const dateResult = document.querySelector("#date-result");
  const tagInput = document.querySelector("#tag-choice");
  const moodInput = document.querySelector("#mood-choice");
  const todoDescriptionInput = document.querySelector(
    "#diary-description-input",
  );

  const today = new Date();
  dateInput.valueAsDate = new Date();
  dateResult.textContent = `${today.getFullYear()}.${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.${today.getDate().toString().padStart(2, "0")} (${
    today.toLocaleDateString("zh-TW", { weekday: "short" })[1]
  })`;
  tagInput.value = "";
  moodInput.value = "";
  todoDescriptionInput.value = "";
}

async function processInputDiary() {
  if (isAdd === 0) return;
  const modal = document.querySelector("#myModal");
  //const dateInput = document.querySelector("#date-today");
  const dateResult = document.querySelector("#date-result");
  const tagInput = document.querySelector("#tag-choice");
  const moodInput = document.querySelector("#mood-choice");
  const todoDescriptionInput = document.querySelector(
    "#diary-description-input",
  );
  //const todoInput = document.querySelector("#todo-input");

  //const date = dateInput.value;
  const date = dateResult.textContent;
  const tag = tagInput.value;
  const mood = moodInput.value;
  const description = todoDescriptionInput.value;
  if (!date) {
    alert("Please enter the date!");
    return;
  }
  if (!tag) {
    alert("Please enter the tag!");
    return;
  }
  if (!mood) {
    alert("Please enter the mood!");
    return;
  }
  if (!description) {
    alert("Please enter the description!");
    return;
  }

  let todo;
  if (isAdd === 1) {
    console.log("undefined id -> add diary");
    try {
      //const todo = await createTodo({ title, description });
      todo = await createTodo({ date, tag, mood, description });
      if (filterCategory == "所有日記本") {
        renderTodo(todo);
      } else {
        filterCategory = "所有日記本";
        document.querySelector("#display-current-filter").innerHTML =
          "目前所顯示日記本：\n" + filterCategory;
        const diaries = await getTodos();
        diaries.forEach((todo) => renderTodo(todo));
      }
    } catch (error) {
      alert("Failed to create todo!");
      modal.style.display = "none";
      isAdd = 0;
      return;
    }
  } else if (isAdd === 2) {
    console.log("exist id -> edit diary");
    try {
      //const todo = await createTodo({ title, description });
      //const diaries = await getTodos();
      todo = todoEdit; //diaries.find((element) => element.id === id);
      const id = todo.id;
      // update todo and the database
      todo.date = date;
      todo.tag = tag;
      todo.mood = mood;
      todo.description = description;
      todo = await updateTodoStatus(id, todo);
      console.log("after edit");
      console.log(todo);
      // update todo to dom node so that the html of the website changes
      //const idselectString = "#"
      const target = document.getElementById(id);
      target.querySelector(".preview-date").innerText = date;
      target.querySelector(".preview-tag").innerText = tag;
      target.querySelector(".preview-mood").innerText = mood;
      target.querySelector(".todo-description").innerText = description;
    } catch (error) {
      alert("Failed to update todo!");
      modal.style.display = "none";
      console.log(error);
      isAdd = 0;
      return;
    }
  }
  isAdd = 0;

  //todoInput.value = "";
  /*const today = new Date();
  dateInput.valueAsDate = new Date();
  dateResult.textContent = `${today.getFullYear()}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getDate().toString().padStart(2, '0')} (${today.toLocaleDateString('zh-TW', { weekday: 'short' })[1]})`;
  tagInput.value = "";
  moodInput.value = "";
  todoDescriptionInput.value = "";*/
  clearInputField();

  modal.style.display = "none";
  modal.zIndex = 0;

  showBrowsePage(todo);
}

function setBrowsePageContent(todo) {
  const showTag = document.querySelector(".diary-tags");
  const showMood = document.querySelector(".diary-moods");
  const showDate = document.querySelector(".diary-date");
  const showContent = document.querySelector(".diary-content");

  showTag.innerHTML = todo.tag;
  showMood.innerHTML = todo.mood;
  showDate.innerHTML = todo.date;
  showContent.innerHTML = todo.description;

  const editButton = document.querySelector("#edit-diary-button");
  const modal = document.querySelector("#myModal");
  editButton.addEventListener("click", () => {
    isAdd = 2;

    todoEdit = todo;

    modal.style.display = "block";
    modal.style.zIndex = "10";
    //modal2.style.zIndex = "1";

    // edit diary
    const dateInput = document.querySelector("#date-today");
    const formattedDate =
      todo.date.substr(0, 4) +
      "-" +
      todo.date.substr(5, 2) +
      "-" +
      todo.date.substr(8, 2);
    console.log(formattedDate);
    dateInput.value = formattedDate;
    const dateResult = document.querySelector("#date-result");
    dateResult.textContent = todo.date;
    const tagInput = document.querySelector("#tag-choice");
    tagInput.value = todo.tag;
    const moodInput = document.querySelector("#mood-choice");
    moodInput.value = todo.mood;
    const todoDescriptionInput = document.querySelector(
      "#diary-description-input",
    );
    todoDescriptionInput.value = todo.description;

    //modal.style.display = "none";
    //modal2.style.display = "block";

    /*const addTodoButton = document.querySelector("#diary-add");
    addTodoButton.addEventListener("click", async () => {
      isAdd = 2;
      processInputDiary(todo, todo.id);
      isAdd = 0;
    });*/
  });
}

function showBrowsePage(todo) {
  const modal2 = document.querySelector("#myModal-2");
  modal2.style.display = "block";
  setBrowsePageContent(todo);
  //console.log(todo);
}

/*async function deleteTodoElement(id) {
  try {
    await deleteTodoById(id);
  } catch (error) {
    alert("Failed to delete todo!");
  } finally {
    const todo = document.getElementById(id);
    todo.remove();
  }
}*/

function renderTodo(todo) {
  const item = createTodoElement(todo);
  //console.log("testttt\n");
  //console.log(todo.date);
  todoList.appendChild(item);
}

function createTodoElement(todo) {
  const item = itemTemplate.content.cloneNode(true);
  const container = item.querySelector(".todo-item");
  container.id = todo.id;
  //const checkbox = item.querySelector(`input[type="checkbox"]`);
  //checkbox.checked = todo.completed;
  //checkbox.dataset.id = todo.id;
  const date = item.querySelector(".preview-date");
  date.innerText = todo.date;
  const tag = item.querySelector(".preview-tag");
  tag.innerText = todo.tag;
  const mood = item.querySelector(".preview-mood");
  mood.innerText = todo.mood;
  //const title = item.querySelector("p.todo-title");
  //title.innerText = todo.title;
  const description = item.querySelector("p.todo-description");
  description.innerText = todo.description;
  /*const deleteButton = item.querySelector("button.delete-todo");
  deleteButton.dataset.id = todo.id;
  deleteButton.addEventListener("click", () => {
    deleteTodoElement(todo.id);
  });*/

  const modal2 = document.querySelector("#myModal-2");
  const span = document.querySelector("#modal2-close");
  //const span = document.getElementsByClassName("close")[0];
  span.addEventListener("click", () => {
    modal2.style.display = "none";
  });
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal2) {
      modal2.style.display = "none";
    }
  };

  container.addEventListener("click", () => {
    modal2.style.display = "block";
    setBrowsePageContent(todo);
    /*const showTag = document.querySelector(".diary-tags");
    const showMood = document.querySelector(".diary-moods");
    const showDate = document.querySelector(".diary-date");
    const showContent = document.querySelector(".diary-content");

    showTag.innerHTML = todo.tag;
    showMood.innerHTML = todo.mood;
    showDate.innerHTML = todo.date;
    showContent.innerHTML = todo.description;

    const editButton = document.querySelector("#edit-diary-button");
    const modal = document.querySelector("#myModal");
    editButton.addEventListener("click", () => {
      modal.style.display = "block";
      modal.style.zIndex = "10";
      //modal2.style.zIndex = "1";
      

      // edit diary 還沒寫
      //const dateInput = document.querySelector("#date-today");
      //dateInput.valueAsDate = todo.date;
      const dateResult = document.querySelector("#date-result");
      dateResult.textContent = todo.date;
      const tagInput = document.querySelector("#tag-choice");
      tagInput.value = todo.tag;
      const moodInput = document.querySelector("#mood-choice");
      moodInput.value = todo.mood;
      const todoDescriptionInput = document.querySelector(
        "#diary-description-input",
      );
      todoDescriptionInput.value = todo.description;
      

      //modal.style.display = "none";
      //modal2.style.display = "block";

    });  */
  });

  return item;
}

async function getTodos() {
  const response = await instance.get("/todos");
  return response.data;
}

async function createTodo(todo) {
  const response = await instance.post("/todos", todo);
  return response.data;
}

// eslint-disable-next-line no-unused-vars
async function updateTodoStatus(id, todo) {
  const response = await instance.put(`/todos/${id}`, todo);
  return response.data;
}

/*async function deleteTodoById(id) {
  const response = await instance.delete(`/todos/${id}`);
  return response.data;
}*/

main();
