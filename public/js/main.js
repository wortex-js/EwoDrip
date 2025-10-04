const productsContainer = document.getElementById("products");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const searchInput = document.getElementById("search");
const modal = document.getElementById("product-modal");
const modalImg = document.getElementById("modal-img");
const modalName = document.getElementById("modal-name");
const modalPrice = document.getElementById("modal-price");
const modalDesc = document.getElementById("modal-desc");
const modalQty = document.getElementById("modal-qty");
const modalAdd = document.getElementById("modal-add");
const closeModal = document.getElementById("close-product");

let currentProduct = null;
let cart = [];

// Example products (you will load from DB in routes)
const products = [
  {id:1,name:"Ewo Sneakers",price:120,image:"/images/sneakers.jpg",desc:"Gothic sneakers"},
  {id:2,name:"Ewo Hoodie",price:80,image:"/images/hoodie.jpg",desc:"Dark hoodie with red accents"},
  {id:3,name:"Ewo Cap",price:25,image:"/images/cap.jpg",desc:"Black cap gothic"},
];

// Render products
function renderProducts(items){
    productsContainer.innerHTML="";
    items.forEach(p=>{
        const div = document.createElement("div");
        div.classList.add("product-card");
        div.innerHTML=`<img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>$${p.price}</p>`;
        div.addEventListener("click",()=>openModal(p));
        productsContainer.appendChild(div);
    });
}

// Modal functions
function openModal(product){
    currentProduct = product;
    modal.style.display = "flex";
    modalImg.src = product.image;
    modalName.textContent = product.name;
    modalPrice.textContent = "$" + product.price;
    modalDesc.textContent = product.desc;
    modalQty.value = 1;
}

closeModal.addEventListener("click", ()=> modal.style.display="none");

modalAdd.addEventListener("click", ()=>{
    const qty = parseInt(modalQty.value);
    for(let i=0;i<qty;i++) cart.push(currentProduct);
    updateCart();
    modal.style.display="none";
});

// Cart
function updateCart(){
    cartItems.innerHTML="";
    let total=0;
    cart.forEach((item,index)=>{
        total+=item.price;
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML=`<span>${item.name} - $${item.price}</span>
        <button onclick="removeFromCart(${index})">Remove</button>`;
        cartItems.appendChild(div);
    });
    cartTotal.textContent = total.toFixed(2);
    cartCount.textContent = cart.length;
}

function removeFromCart(index){ cart.splice(index,1); updateCart(); }

// Search
searchInput.addEventListener("input", ()=>{
    const term = searchInput.value.toLowerCase();
    const filtered = products.filter(p=>p.name.toLowerCase().includes(term));
    renderProducts(filtered);
});

renderProducts(products);
updateCart();
