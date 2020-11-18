// const client = contentful.createClient({
//   space: "xxxxxxxxxxxxx",
//   accessToken: "Yxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
//   //host: "preview.contentful.com"
// });


const cartTotal = document.querySelector(".total-price");
const cartItems = document.querySelector(".cart__items");
const productsDOM = document.querySelector(".product__wrapper");
const cartConntent = document.querySelector(".cart__container");
const cartBtn = document.querySelector(".cart__btn");
const closeCartBtn = document.querySelector(".close__cart");
const clearCartBtn = document.querySelector(".clear__cart");
// cart
let cart = [];
// buttons
let buttonsDOM = [];
// get the products
class Products {
  async getProducts() {
    try {

      let contentful = await client.getEntries({
        content_type: "hemmiTakeAway"
      })
      

      // let result = await fetch("http://localhost:3000/data/data.json");
      // let data = await result.json();
      let products = contentful.items;
      products = products.map((item) => {
        const {title, price, description} = item.fields;
        const {id}= item.sys;
        const image = item.fields.image.fields.file.url;
        return {title, price, description, id, image};
      });
      return products;
    } catch (err) {
      console.log(err);
    }
  }
}
//display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `<div class="product">
                      <div class="buttons">
                          <span class="delete-btn"></span>
                          <span class="like-btn"></span>
                      </div>

                      <div class="image">
                          <img src="${product.image}" alt="" />
                      </div>

                      <div class="description">
                      <h2 class="title">${product.title}</h2>
                      <span>${product.description}</span>
                      </div>
                      <div class="price">CHF ${product.price}</div>
                      <button class="order" data-id="${product.id}">Auf den Tisch</button>
                  </div>`;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".order")];
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "Bestellt";
        button.disabled = true
      }
      button.addEventListener('click', (event) => {
        event.target.innerText = "Bestellt";
        event.target.disabled = true
        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add product to cart
        cart = [...cart, cartItem];
        // save cart in localstorage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display cart items
        this.addCartItem(cartItem);
        // show the cart
        this.showCart()
      });

    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    })
    cartTotal.innerText = 'CHF' + ' ' + parseFloat(tempTotal.toFixed(2))
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement('DIV');
    div.classList.add('cart__item');
    div.innerHTML = `
                        <div class="cart__image"> 
                          <img src="${item.image}" alt=""/>
                      </div>

                      <div class="cart__description">
                      <h2 class="title">${item.title}</h2>
                      <span>${item.description}</span>
                      </div>

                      <div class="quantity">
                          <button class="plus-btn" type="button" name="button" data-id=${item.id}>
                              +
                          </button>
                          <p class="cart-quantity" data-id=${item.amount}>1</p>
                          <button class="minus-btn" type="button" name="button" data-id=${item.id}>
                              -
                          </button>
                      </div>
                      <span class="remove__item" data-id=${item.id}>remove</span>

                      <div class="price">CHF ${item.price}</div>`;
                      console.log(cartConntent);
    cartConntent.appendChild(div);

  }
  showCart() {
    cartConntent.classList.add('show__cart');

  }
  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  hideCart() {
    cartConntent.classList.remove('show__cart');
  }
  cartLogic() {
    // clear cartBtn
    clearCartBtn.addEventListener('click', () => {
      // ('click', this.clearCart "would point to the button")
      this.clearCart();
    });
    // cart functionality
    cartConntent.addEventListener('click', event=>{
      if (event.target.classList.contains('remove__item')) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartConntent.removeChild(removeItem.parentElement);
        this.removeItem(id);
      }
      else if (event.target.classList.contains('plus-btn')) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      }
      else if (event.target.classList.contains('minus-btn')) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
        Storage.saveCart(cart);
        this.setCartValues(cart);
        lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartConntent.removeChild(lowerAmount.parentElement.parentElement);
        }
        
        
        
      }
      
    })
  }
  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    console.log(cartConntent.children)
    while(cartConntent.children.length>0) {
      cartConntent.removeChild(cartConntent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `Auf den Tisch`;
  }
  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id)
  }

}
//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}


document.addEventListener("DOMContentLoaded", () => {
  // showShopItems();
  const ui = new UI();
  const products = new Products();
  // setup App
  ui.setupApp();
  // get all products
  products.getProducts().then((products) => {
    ui.displayProducts(products);
    Storage.saveProducts(products);
  }).then(() => {
    ui.getBagButtons();
    ui.cartLogic();
  });
});
