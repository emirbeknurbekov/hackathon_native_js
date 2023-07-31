let registerUserModalBtn = document.querySelector("#registerUser-modal");
let loginUserModalBtn = document.querySelector("#loginUser-modal");
let registerUserModalBlock = document.querySelector("#registerUser-block");
let loginUserModalBlock = document.querySelector("#loginUser-block");
let registerUserBtn = document.querySelector("#registerUser-btn");
let loginUserBtn = document.querySelector("#loginUser-btn");
let logoutUserBtn = document.querySelector("#logoutUser-btn");
let closeModalBtn = document.querySelector(".btn-close");
let adminPanel = document.querySelector("#admin-panel");
let addProductBtn = document.querySelector(".add-product-btn");
let saveChangesBtn = document.querySelector(".save-changes-btn");
let productsList = document.querySelector("#products-list");
let categoriesList = document.querySelector(".dropdown-menu");
let searchForm = document.querySelector("form");
let prevPageBtn = document.querySelector("#prev-page-btn");
let nextPageBtn = document.querySelector("#next-page-btn");
//* inputs
let usernameInp = document.querySelector("#reg-username");
let ageInp = document.querySelector("#reg-age");
let passwordInp = document.querySelector("#reg-password");
let passwordConfirmInp = document.querySelector("#reg-passwordConfirm");
let isAdminInp = document.querySelector("#isAdmin");
let loginUsernameInp = document.querySelector("#login-username");
let loginPasswordInp = document.querySelector("#login-password");
let productTitle = document.querySelector("#product-title");
let productPrice = document.querySelector("#product-price");
let productDesc = document.querySelector("#product-desc");
let productImage = document.querySelector("#product-image");
let productCategory = document.querySelector("#product-category");
let searchInp = document.querySelector("#search-inp");

//* account  logic
registerUserModalBtn.addEventListener("click", () => {
  registerUserModalBlock.setAttribute("style", "display: flex !important;");
  registerUserBtn.setAttribute("style", "display: block !important;");
  loginUserModalBlock.setAttribute("style", "display: none !important;");
  loginUserBtn.setAttribute("style", "display: none !important;");
});

loginUserModalBtn.addEventListener("click", () => {
  registerUserModalBlock.setAttribute("style", "display: none !important;");
  registerUserBtn.setAttribute("style", "display: none !important;");
  loginUserModalBlock.setAttribute("style", "display: flex !important;");
  loginUserBtn.setAttribute("style", "display: block !important;");
});

// register
const USERS_API = "http://localhost:8000/users";

async function checkUniqueUsername(username) {
  let res = await fetch(USERS_API);
  let users = await res.json();
  return users.some((user) => user.username === username);
}

async function registerUser() {
  if (
    !usernameInp.value.trim() ||
    !ageInp.value.trim() ||
    !passwordInp.value.trim() ||
    !passwordConfirmInp.value.trim()
  ) {
    alert("Some inputs are empty!");
    return;
  }

  let uniqueUsername = await checkUniqueUsername(usernameInp.value);

  if (uniqueUsername) {
    alert("User with this username already exists!");
    return;
  }

  if (passwordInp.value !== passwordConfirmInp.value) {
    alert("Passwords don't match!");
    return;
  }

  let userObj = {
    username: usernameInp.value,
    age: ageInp.value,
    password: passwordInp.value,
    isAdmin: isAdmin.checked,
  };

  fetch(USERS_API, {
    method: "POST",
    body: JSON.stringify(userObj),
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });

  usernameInp.value = "";
  ageInp.value = "";
  passwordInp.value = "";
  passwordConfirmInp.value = "";
  isAdminInp.checked = false;

  closeModalBtn.click();
}

registerUserBtn.addEventListener("click", registerUser);

//* login
function checkLoginLogoutStatus() {
  let user = localStorage.getItem("user");
  if (!user) {
    loginUserModalBtn.parentNode.style.display = "block";
    logoutUserBtn.parentNode.style.display = "none";
  } else {
    loginUserModalBtn.parentNode.style.display = "none";
    logoutUserBtn.parentNode.style.display = "block";
  }

  showAdminPanel();
}
checkLoginLogoutStatus();

function checkUserInUsers(username, users) {
  return users.some((item) => item.username === username);
}

function checkUserPassword(user, password) {
  return user.password === password;
}

function setUserToStorage(username, isAdmin) {
  localStorage.setItem(
    "user",
    JSON.stringify({
      username,
      isAdmin,
    })
  );
}

async function loginUser() {
  if (!loginUsernameInp.value.trim() || !loginPasswordInp.value.trim()) {
    alert("Some inpits are empty!");
    return;
  }

  let res = await fetch(USERS_API);
  let users = await res.json();

  if (!checkUserInUsers(loginUsernameInp.value, users)) {
    alert("User not found!");
    return;
  }

  let userObj = users.find((user) => user.username === loginUsernameInp.value);

  if (!checkUserPassword(userObj, loginPasswordInp.value)) {
    alert("Wrong password!");
    return;
  }

  setUserToStorage(userObj.username, userObj.isAdmin);

  loginUsernameInp.value = "";
  loginPasswordInp.value = "";

  checkLoginLogoutStatus();

  closeModalBtn.click();

  render();
}

loginUserBtn.addEventListener("click", loginUser);

//* logout
logoutUserBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  checkLoginLogoutStatus();
  render();
});

//* product logic
function checkUserForProductCreate() {
  let user = JSON.parse(localStorage.getItem("user"));
  if (user) return user.isAdmin;
  return false;
}

function showAdminPanel() {
  if (!checkUserForProductCreate()) {
    adminPanel.setAttribute("style", "display: none !important;");
  } else {
    adminPanel.setAttribute("style", "display: flex !important;");
  }
}

//* create
const PRODUCTS_API = "http://localhost:8000/products";

function cleanAdminForm() {
  productTitle.value = "";
  productPrice.value = "";
  productDesc.value = "";
  productImage.value = "";
  productCategory.value = "";
}

async function createProduct() {
  if (
    !productTitle.value.trim() ||
    !productPrice.value.trim() ||
    !productDesc.value.trim() ||
    !productImage.value.trim() ||
    !productCategory.value.trim()
  ) {
    alert("Some inputs are empty!");
    return;
  }

  let productObj = {
    title: productTitle.value,
    price: productPrice.value,
    desc: productDesc.value,
    image: productImage.value,
    category: productCategory.value,
  };

  await fetch(PRODUCTS_API, {
    method: "POST",
    body: JSON.stringify(productObj),
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });

  cleanAdminForm();

  render();
}

addProductBtn.addEventListener("click", createProduct);

//* read
let category = "";
let search = "";
let currentPage = 1;

async function render() {
  let requestAPI = `${PRODUCTS_API}?q=${search}&category=${category}&_page=${currentPage}&_limit=6`;
  if (!category) {
    requestAPI = `${PRODUCTS_API}?q=${search}&_page=${currentPage}&_limit=6`;
  }
  productsList.innerHTML = "";
  let res = await fetch(requestAPI);
  let products = await res.json();
  products.forEach((product) => {
    productsList.innerHTML += `
        <div class="card m-5" style="width: 18.5rem;">
            <img src="${
              product.image
            }" class="card-img-top" alt="error:(" height="200">
            <div class="card-body">
                <h5 class="card-title">${product.title}</h5>
                <p class="card-text">${product.desc}</p>
                <p class="card-text">${product.category}</p>
                <p class="card-text">${product.price}$</p>
                ${
                  checkUserForProductCreate()
                    ? `<a href="#" class="btn btn-dark btn-edit" id="edit-${product.id}">EDIT</a>
                <a href="#" class="btn btn-danger btn-delete" id="del-${product.id}">DELETE</a>`
                    : ""
                }
            </div>
        </div>
        `;
  });

  if (products.length === 0) return;
  addDeleteEvent();
  addEditEvent();
  addCategoryToDropdownMenu();
}
render();

//* delete
async function deleteProduct(e) {
  let productId = e.target.id.split("-")[1];

  await fetch(`${PRODUCTS_API}/${productId}`, {
    method: "DELETE",
  });

  render();
}

function addDeleteEvent() {
  let deleteProductBtns = document.querySelectorAll(".btn-delete");
  deleteProductBtns.forEach((btn) =>
    btn.addEventListener("click", deleteProduct)
  );
}

//* update
function checkCreateAndSaveBtn() {
  if (saveChangesBtn.id) {
    addProductBtn.setAttribute("style", "display: none;");
    saveChangesBtn.setAttribute("style", "display: block;");
  } else {
    addProductBtn.setAttribute("style", "display: block;");
    saveChangesBtn.setAttribute("style", "display: none;");
  }
}
checkCreateAndSaveBtn();

async function addProductDataToForm(e) {
  let productId = e.target.id.split("-")[1];
  let res = await fetch(`${PRODUCTS_API}/${productId}`);
  let productObj = await res.json();

  productTitle.value = productObj.title;
  productPrice.value = productObj.price;
  productDesc.value = productObj.desc;
  productImage.value = productObj.image;
  productCategory.value = productObj.category;

  saveChangesBtn.setAttribute("id", productObj.id);

  checkCreateAndSaveBtn();
}

function addEditEvent() {
  let editProductBtns = document.querySelectorAll(".btn-edit");
  editProductBtns.forEach((btn) =>
    btn.addEventListener("click", addProductDataToForm)
  );
}

async function saveChanges(e) {
  let updatedProductObj = {
    id: e.target.id,
    title: productTitle.value,
    price: productPrice.value,
    desc: productDesc.value,
    image: productImage.value,
    category: productCategory.value,
  };

  await fetch(`${PRODUCTS_API}/${e.target.id}`, {
    method: "PUT",
    body: JSON.stringify(updatedProductObj),
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  });

  cleanAdminForm();

  saveChangesBtn.removeAttribute("id");

  checkCreateAndSaveBtn();

  render();
}

saveChangesBtn.addEventListener("click", saveChanges);

//* filtering
async function addCategoryToDropdownMenu() {
  let res = await fetch(PRODUCTS_API);
  let data = await res.json();
  let categories = new Set(data.map((product) => product.category));
  categoriesList.innerHTML =
    '<li><a class="dropdown-item" href="#">all</a></li>';
  categories.forEach((category) => {
    categoriesList.innerHTML += `
            <li><a class="dropdown-item" href="#">${category}</a></li>
        `;
  });
  addClickEventOnDropdownItem();
}

function filterOnCategory(e) {
  let categoryText = e.target.innerText;
  if (categoryText === "all") {
    category = "";
  } else {
    category = categoryText;
  }
  render();
}

function addClickEventOnDropdownItem() {
  let categoryItems = document.querySelectorAll(".dropdown-item");
  categoryItems.forEach((item) =>
    item.addEventListener("click", filterOnCategory)
  );
}

//* search
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  search = searchInp.value;
  render();
});

//* pagination
async function getPagesCount() {
  let res = await fetch(PRODUCTS_API);
  let products = await res.json();
  let pagesCount = Math.ceil(products.length / 2);
  return pagesCount;
}

async function checkPages() {
  let maxPagesNum = await getPagesCount();
  if (currentPage === 1) {
    prevPageBtn.setAttribute("style", "display: none;");
    nextPageBtn.setAttribute("style", "display: block;");
  } else if (currentPage === maxPagesNum) {
    prevPageBtn.setAttribute("style", "display: block;");
    nextPageBtn.setAttribute("style", "display: none;");
  } else {
    prevPageBtn.setAttribute("style", "display: block;");
    nextPageBtn.setAttribute("style", "display: block;");
  }
}
checkPages();

prevPageBtn.addEventListener("click", () => {
  currentPage--;
  checkPages();
  render();
});

nextPageBtn.addEventListener("click", () => {
  currentPage++;
  checkPages();
  render();
});
