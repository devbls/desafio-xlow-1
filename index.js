const url = "https://desafio.xlow.com.br/search";
let formattedProducts = [];
const listElement = document.querySelector('#products-container');
const productsCount = document.querySelector('#products-count');

async function getData() {
  const response = await fetch(url);
  const data = await response.json();

  const promises = data.map(async item => {
    const response = await fetch(`https://desafio.xlow.com.br/search/${item.productId}`);
    return response.json();
  });

  return Promise.all(promises);
}

function handleGridControl(gridControl) {
  const screenWidth = window.innerWidth;
  const gridControlElement = document.querySelector(`.grid-control-${gridControl}`);
  gridControlElement.style = "border: 0.1rem solid darkgray; border-radius: 4px;";

  if (gridControl === 'large') {
    document.querySelector(".grid-control-default").style = "border: none;";
    
    if (screenWidth < 700) listElement.style = "grid-template-columns: repeat(2, 1fr);";
    else if (screenWidth < 950) listElement.style = "grid-template-columns: repeat(3, 1fr);";
    else if (screenWidth < 1200) listElement.style = "grid-template-columns: repeat(4, 1fr);";
    else listElement.style = "grid-template-columns: repeat(5, 1fr);";
  } else {
    document.querySelector(".grid-control-large").style = "border: none;";

    if (screenWidth < 700) listElement.style = "grid-template-columns: repeat(1, 1fr);"
    else if (screenWidth < 950) listElement.style = "grid-template-columns: repeat(2, 1fr);";
    else if (screenWidth < 1200) listElement.style = "grid-template-columns: repeat(3, 1fr);";
    else listElement.style = "grid-template-columns: repeat(4, 1fr);";
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price)
}

function handleChangeImage(image) {
  const imageData = JSON.parse(decodeURIComponent(image));
  const imageElement = document.querySelector(`.item-image-${imageData.productId}`);
  const prevThumbElement = document.querySelector(`.active-thumb-${imageData.productId}`);
  const currentThumbElement = document.querySelector(`.thumb-${imageData.productId}`);
  imageElement.src = imageData.imageUrl;

  if (currentThumbElement.src === imageElement.src) {
    currentThumbElement.className = `active-thumb-${imageData.productId}`;
    prevThumbElement.className = `thumb-${imageData.productId}`;
  } else {
    currentThumbElement.className = `thumb-${imageData.productId}`;
    prevThumbElement.className = `active-thumb-${imageData.productId}`;
  }
}

getData(url).then(data => {
  data.map(item => formattedProducts.push(item[0]));

  productsCount.innerHTML = `${formattedProducts.length} ${formattedProducts.length > 0 ? 'produtos' : 'produto'}`;

  formattedProducts.map(item => {
    const sellingPrices = item.items[0].sellers[0].commertialOffer;
    const productImages = item.items[0].images;
    
    listElement.insertAdjacentHTML('afterbegin', `
      <div class="item">
        <img class="item-image item-image-${item.productId}" src="${productImages[0].imageUrl}" alt="${productImages[0].imageText}">
        <p class="item-title">${item.productName}</p>
        <div class="images-showcase"></div>
        <p class="item-original-price"></p>
        <p class="item-price"></p>
        <button class="buy-button">COMPRAR</button>
      </div>
    `);

    const price = document.querySelector(`.item-price`);
    const originalPrice = document.querySelector(`.item-original-price`);
    originalPrice.style.display = 'none';

    if (sellingPrices.Price < sellingPrices.PriceWithoutDiscount) {
      
      originalPrice.style.display = 'block';
      originalPrice.innerHTML = formatPrice(sellingPrices.PriceWithoutDiscount);
      price.innerHtml = formatPrice(sellingPrices.Price);
    } else {
      price.innerHTML = formatPrice(sellingPrices.PriceWithoutDiscount);
    }

    productImages.forEach(image => {
      document.querySelector('.images-showcase').insertAdjacentHTML('afterbegin', `
        <img src="${image.imageUrl}" alt="${image.imageText}" onclick="handleChangeImage('${encodeURIComponent(JSON.stringify({...image, productId: item.productId}))}')" class="${image.imageUrl === productImages[0].imageUrl ? `active-thumb-${item.productId}` : `thumb-${item.productId}`}" />
      `);
    });
  });
});
