// contenful
const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "khjio5elkwmw",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "0ccerBiZY3WNwDfy6NjQZdRicW1W4qUwDB5p-UGkj9o"
});



// Variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

// 
let cart = [];
let buttonsDOM = [];

// get the products from the storage
class Products{
    async getProducts(){
    try {
        let contentful = await client
  .getEntries({
      content_type: '0ccerBiZY3WNwDfy6NjQZdRicW1W4qUwDB5p-UGkj9o'
  })
  

        // let result = await fetch('products.json');
        // let data = await result.json();
        let products = contentful.items;
        products = products.map(item => {
            const {title,price} = item.fields;
            const {id} = item.sys;
            const image = item.fields.image.fields.file.url;
            return {title,price,id,image};
        })
        return products;
    } catch(error){
        console.log(error);
    }
    }
}

// display the products on the UI
class UI{
    displayProducts(products){
        let result = '';
        products.forEach(product => {
            // result variable specifies the display structure and styling of each product item
            result += `
            <article class="product">
                    <div class="img-container">
                        <img src="${product.image}" alt="product" class="product-img">
                        <button class="bag-btn" data-id=${product.id}>
                            <i class="fas fa-shopping-cart"></i> add to cart
                        </button>
                    </div>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                </article>
                `;
        });
        productsDOM.innerHTML = result //actual display of the the products on the DOM (HTML).
    }
// getting add to cart buttons (these buttons appear when you hover on a product item)
    getCartButtons(){
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id); // check if the product has been added to the cart already

            if(inCart){
                button.innerText = 'In Cart';
                button.disabled = true;
            }
            button.addEventListener('click',(event)=>{
                    event.target.innerText = 'In Cart';
                    event.target.disabled = true;
                    // get product from products in local storage based on id
                    let cartItem = {...Storage.getProduct(id), amount:1};
                    // add product to the cart
                    cart = [...cart, cartItem]
                    
                    // save cart to local storage
                    Storage.saveCart(cart);
                    // set cart values
                    this.setCartValues(cart);
                    // display cart items
                    this.addCartItem(cartItem);
                    // show the cart
                    this.showCart();
                });
        });
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        }) 
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;

    }

    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} alt="product">
                        <div>
                            <h4>${item.title}</h4>
                            <h5>$${item.price}</h5>
                            <span class="remove-item" data-id=${item.id}>Remove</span>
                        </div>
                        <div>
                            <i class="fas fa-chevron-up" data-id=${item.id}></i>
                            <p class="item-amount">${item.amount}</p>
                            <i class="fas fa-chevron-down" data-id=${item.id}></i>
                        </div>
                        `;
                        cartContent.appendChild(div);
    }

    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    // setupAPP
    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }
    populateCart(cart){
        cart.forEach(item =>{
            this.addCartItem(item)
        });
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic(){
        // clear cart button
        clearCartBtn.addEventListener('click', ()=>{
            this.clearCart();
        });
        // cart functionality
        cartContent.addEventListener('click',(e)=> {
            if(e.target.classList.contains('remove-item')){
                let removeItem = e.target;
                let id = removeItem.dataset.id;
                this.removeItem(id)
                // this.removeItem(e.target.dataset.id);
                cartContent.removeChild(removeItem.parentElement.parentElement)
            }else if(e.target.classList.contains('fa-chevron-up')){
                let addAmount = e.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount +1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }else if(e.target.classList.contains('fa-chevron-down')){
                let reduceAmount = e.target;
                let id = reduceAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount -1;
                if(tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                }else{
                    cartContent.removeChild(reduceAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
                reduceAmount.previousElementSibling.innerText = tempItem.amount;
            }
        })
    }
    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
            
        }
        this.hideCart();
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleBtn(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`
    }
    getSingleBtn(id){
        return buttonsDOM.find(button => button.dataset.id === id)
    }
}

// store the products in local storage
class Storage{
    static saveProducts(products){
        localStorage.setItem('products', JSON.stringify(products));
    }

    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
    const ui = new UI();
    const products = new Products();

    // setupApp
    ui.setupAPP();
    // get all products
    products.getProducts().then(products => {ui.displayProducts(products)
    Storage.saveProducts(products);
}).then(()=>{
    ui.getCartButtons();
    ui.cartLogic();
});
    
})